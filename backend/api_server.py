"""
MCP-Style API Server for Stock Prediction - FastAPI Version
Exposes REST endpoints for ML predictions with dynamic risk parameters
OPEN ACCESS - No authentication required, with rate limiting and input validation
"""

import sys
import os

# Force unbuffered output so we can see prints immediately
sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', buffering=1)
sys.stderr = os.fdopen(sys.stderr.fileno(), 'w', buffering=1)

# Set environment variable for Python unbuffered output
os.environ['PYTHONUNBUFFERED'] = '1'

from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
import logging
from pathlib import Path
from datetime import datetime
import json
import psutil

from core.mcp_adapter import MCPAdapter
# JWT authentication removed - open access API
from rate_limiter import check_rate_limit, get_rate_limit_status
from validators import (
    validate_symbols, validate_horizon, validate_horizons_list,
    validate_risk_parameters, sanitize_input, validate_confidence
)
import config
from config import LOGS_DIR

# Initialize FastAPI app
app = FastAPI(
    title=config.API_TITLE,
    version=config.API_VERSION,
    description=config.API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging setup with automatic rotation
from logging.handlers import RotatingFileHandler

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler(
            str(LOGS_DIR / 'api_server.log'),  # Cross-platform path handling
            maxBytes=10*1024*1024,  # 10 MB per file (prevents huge log files)
            backupCount=5,           # Keep 5 backup files (max 60 MB total)
            encoding='utf-8'
        ),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize MCP Adapter
try:
    mcp_adapter = MCPAdapter()
    logger.info("MCP Adapter initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize MCP Adapter: {e}", exc_info=True)
    raise

# API request logging
API_LOG_PATH = Path("data/logs/api_requests.jsonl")
SECURITY_LOG_PATH = Path("data/logs/security.jsonl")


# ==================== Pydantic Models ====================
# JWT authentication removed - no login models needed

class PredictRequest(BaseModel):
    symbols: List[str] = Field(..., min_items=1, max_items=50)
    horizon: str = Field(default="intraday")
    risk_profile: Optional[str] = Field(None)
    stop_loss_pct: Optional[float] = Field(None, ge=0.1, le=50.0)
    capital_risk_pct: Optional[float] = Field(None, ge=0.1, le=100.0)
    drawdown_limit_pct: Optional[float] = Field(None, ge=0.1, le=100.0)
    
    @validator('symbols')
    def validate_symbols_not_empty(cls, v):
        """Ensure symbols list is not empty and normalize to uppercase"""
        if not v or len(v) == 0:
            raise ValueError('At least one symbol must be provided')
        return [s.upper().strip() for s in v]
    
    @validator('horizon')
    def validate_horizon_value(cls, v):
        """Validate horizon is one of the allowed values"""
        valid_horizons = ['intraday', 'short', 'long']
        if v.lower() not in valid_horizons:
            raise ValueError(f'Invalid horizon. Valid options: {", ".join(valid_horizons)}')
        return v.lower()
    
    @validator('risk_profile')
    def validate_risk_profile_value(cls, v):
        """Validate risk profile if provided"""
        if v is not None:
            valid_profiles = ['low', 'moderate', 'high']
            if v.lower() not in valid_profiles:
                raise ValueError(f'Invalid risk_profile. Valid options: {", ".join(valid_profiles)}')
            return v.lower()
        return v


class ScanAllRequest(BaseModel):
    symbols: List[str] = Field(..., min_items=1, max_items=100)
    horizon: str = Field(default="intraday")
    min_confidence: float = Field(default=0.3, ge=0.0, le=1.0)
    stop_loss_pct: Optional[float] = Field(None, ge=0.1, le=50.0)
    capital_risk_pct: Optional[float] = Field(None, ge=0.1, le=100.0)
    
    @validator('symbols')
    def validate_symbols_list(cls, v):
        """Ensure symbols list is not empty and normalize"""
        if not v or len(v) == 0:
            raise ValueError('At least one symbol must be provided')
        return [s.upper().strip() for s in v]
    
    @validator('horizon')
    def validate_horizon_value(cls, v):
        """Validate horizon is one of the allowed values"""
        valid_horizons = ['intraday', 'short', 'long']
        if v.lower() not in valid_horizons:
            raise ValueError(f'Invalid horizon. Valid options: {", ".join(valid_horizons)}')
        return v.lower()


class AnalyzeRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20)
    horizons: List[str] = Field(default=["intraday"], min_items=1, max_items=3)
    stop_loss_pct: float = Field(default=2.0, ge=0.1, le=50.0)
    capital_risk_pct: float = Field(default=1.0, ge=0.1, le=100.0)
    drawdown_limit_pct: float = Field(default=5.0, ge=0.1, le=100.0)
    
    @validator('symbol')
    def validate_symbol_format(cls, v):
        """Normalize symbol to uppercase and validate not empty"""
        if not v.strip():
            raise ValueError('Symbol cannot be empty')
        return v.upper().strip()
    
    @validator('horizons')
    def validate_horizons_list(cls, v):
        """Validate each horizon and normalize"""
        if not v or len(v) == 0:
            raise ValueError('At least one horizon must be provided')
        valid_horizons = ['intraday', 'short', 'long']
        for h in v:
            if h.lower() not in valid_horizons:
                raise ValueError(f'Invalid horizon: {h}. Valid options: {", ".join(valid_horizons)}')
        return [h.lower() for h in v]


class FeedbackRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20)
    predicted_action: str = Field(...)
    user_feedback: str = Field(...)
    actual_return: Optional[float] = Field(None, ge=-100.0, le=1000.0)
    
    @validator('symbol')
    def validate_symbol_format(cls, v):
        """Normalize symbol to uppercase"""
        return v.upper().strip()
    
    @validator('predicted_action')
    def validate_and_normalize_action(cls, v):
        """Validate and normalize predicted action (accepts BUY/SELL and LONG/SHORT/HOLD)"""
        v_upper = v.upper().strip()
        # Map BUY/SELL to LONG/SHORT for internal processing
        action_mapping = {
            'BUY': 'LONG',
            'SELL': 'SHORT',
            'LONG': 'LONG',
            'SHORT': 'SHORT',
            'HOLD': 'HOLD'
        }
        if v_upper in action_mapping:
            return action_mapping[v_upper]
        valid_actions = ['LONG', 'SHORT', 'HOLD', 'BUY', 'SELL']
        raise ValueError(f'Invalid predicted_action. Valid options: {", ".join(valid_actions)}')
    
    @validator('user_feedback')
    def validate_feedback(cls, v):
        """Validate user feedback (accepts free text or correct/incorrect)"""
        if not v or not v.strip():
            raise ValueError('user_feedback cannot be empty')
        # Accept any text feedback, but also support correct/incorrect for backward compatibility
        return v.strip()
    
    @validator('actual_return')
    def validate_return_range(cls, v):
        """Validate actual return is within reasonable range"""
        if v is not None:
            # Check for NaN or Inf
            if v != v:  # NaN check
                raise ValueError('actual_return cannot be NaN')
            if abs(v) == float('inf'):
                raise ValueError('actual_return cannot be infinite')
        return v


class TrainRLRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20)
    horizon: str = Field(default="intraday")
    n_episodes: int = Field(default=10, ge=10, le=100)
    force_retrain: bool = False
    
    @validator('symbol')
    def validate_symbol_format(cls, v):
        """Normalize symbol to uppercase"""
        return v.upper().strip()
    
    @validator('horizon')
    def validate_horizon_value(cls, v):
        """Validate horizon is one of the allowed values"""
        valid_horizons = ['intraday', 'short', 'long']
        if v.lower() not in valid_horizons:
            raise ValueError(f'Invalid horizon. Valid options: {", ".join(valid_horizons)}')
        return v.lower()


class FetchDataRequest(BaseModel):
    symbols: List[str] = Field(..., min_items=1, max_items=100)
    period: str = Field(default="2y")
    include_features: bool = False
    refresh: bool = False
    
    @validator('symbols')
    def validate_symbols_list(cls, v):
        """Ensure symbols list is not empty and normalize"""
        if not v or len(v) == 0:
            raise ValueError('At least one symbol must be provided')
        return [s.upper().strip() for s in v]
    
    @validator('period')
    def validate_period_value(cls, v):
        """Validate period is one of the allowed values"""
        valid_periods = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max']
        if v not in valid_periods:
            raise ValueError(f'Invalid period. Valid options: {", ".join(valid_periods)}')
        return v


# ==================== Utility Functions ====================

def log_api_request(endpoint: str, request_data: Dict, response_data: Dict, status_code: int):
    """Log API request and response with detailed information"""
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'endpoint': endpoint,
        'method': 'POST',
        'request': request_data,
        'response_summary': {
            'status_code': status_code,
            'has_predictions': 'predictions' in response_data,
            'prediction_count': response_data.get('metadata', {}).get('count', 0) if 'metadata' in response_data else 0
        },
        'status_code': status_code
    }
    
    API_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    with open(API_LOG_PATH, 'a') as f:
        f.write(json.dumps(log_entry, default=str) + '\n')


def log_security_event(request: Request, event_type: str, details: Dict):
    """Log security-related events"""
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'event_type': event_type,
        'client_ip': request.client.host if request.client else 'unknown',
        'endpoint': request.url.path,
        'details': details
    }
    
    SECURITY_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    with open(SECURITY_LOG_PATH, 'a') as f:
        f.write(json.dumps(log_entry, default=str) + '\n')


# ==================== Exception Handlers ====================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            'error': str(exc),
            'type': type(exc).__name__
        }
    )


# ==================== API Routes ====================

@app.get("/")
async def index():
    """API information"""
    return {
        'name': 'Stock Prediction MCP API',
        'version': '4.0',
        'description': 'MCP-style REST API with open access, rate limiting, and validation',
        'authentication': 'DISABLED - Open access to all endpoints',
        'auth_status': 'disabled',
        'endpoints': {
            '/': 'GET - API information',
            '/auth/status': 'GET - Check rate limit status',
            '/tools/health': 'GET - System health',
            '/tools/predict': 'POST - Generate predictions (NO AUTH)',
            '/tools/scan_all': 'POST - Scan and rank symbols (NO AUTH)',
            '/tools/analyze': 'POST - Analyze with risk parameters (NO AUTH)',
            '/tools/feedback': 'POST - Provide feedback (NO AUTH)',
            '/tools/train_rl': 'POST - Train RL agent (NO AUTH)',
            '/tools/fetch_data': 'POST - Fetch batch data (NO AUTH)'
        },
        'rate_limits': {
            'per_minute': config.RATE_LIMIT_PER_MINUTE,
            'per_hour': config.RATE_LIMIT_PER_HOUR
        },
        'documentation': {
            'swagger_ui': '/docs',
            'redoc': '/redoc'
        }
    }


@app.get("/auth/status")
async def auth_status(request: Request):
    """Get rate limit status for current IP"""
    try:
        status = get_rate_limit_status(request=request)
        return status
    except Exception as e:
        logger.error(f"Status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/tools/health")
async def health_check():
    """System health and resource usage"""
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('.')
        
        health_data = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'system': {
                'cpu_usage_percent': cpu_percent,
                'memory_total_gb': round(memory.total / (1024**3), 2),
                'memory_used_gb': round(memory.used / (1024**3), 2),
                'memory_available_gb': round(memory.available / (1024**3), 2),
                'memory_percent': memory.percent,
                'disk_total_gb': round(disk.total / (1024**3), 2),
                'disk_used_gb': round(disk.used / (1024**3), 2),
                'disk_free_gb': round(disk.free / (1024**3), 2),
                'disk_percent': disk.percent
            },
            'models': {
                'available': True,
                'total_trained': len(list(Path('models').glob('*.pkl')))
            }
        }
        
        return health_data
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        raise HTTPException(status_code=500, detail={'status': 'error', 'message': str(e)})


@app.post("/tools/predict")
async def predict(
    request: Request,
    predict_data: PredictRequest,
    client_ip: str = Depends(check_rate_limit)
):
    """Generate predictions for symbols (NO AUTH REQUIRED)"""
    try:
        data = predict_data.dict()
        data = sanitize_input(data)
        
        validation = validate_symbols(data['symbols'])
        if not validation['valid']:
            raise HTTPException(status_code=400, detail=validation['error'])
        
        if not validate_horizon(data['horizon']):
            raise HTTPException(status_code=400, detail='Invalid horizon. Valid options: intraday, short, long')
        
        risk_validation = validate_risk_parameters(
            data.get('stop_loss_pct'), 
            data.get('capital_risk_pct'), 
            data.get('drawdown_limit_pct')
        )
        if not risk_validation['valid']:
            raise HTTPException(status_code=400, detail=risk_validation['error'])
        
        result = mcp_adapter.predict(
            symbols=data['symbols'],
            horizon=data['horizon'],
            risk_profile=data.get('risk_profile'),
            stop_loss_pct=data.get('stop_loss_pct'),
            capital_risk_pct=data.get('capital_risk_pct'),
            drawdown_limit_pct=data.get('drawdown_limit_pct')
        )
        
        log_api_request('/tools/predict', data, result, 200)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        error_response = {'error': str(e)}
        log_api_request('/tools/predict', predict_data.dict(), error_response, 500)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/tools/scan_all")
async def scan_all(
    request: Request,
    scan_data: ScanAllRequest,
    client_ip: str = Depends(check_rate_limit)
):
    """Scan and rank multiple symbols (NO AUTH REQUIRED)"""
    try:
        data = scan_data.dict()
        data = sanitize_input(data)
        
        validation = validate_symbols(data['symbols'], config.MAX_SCAN_SYMBOLS)
        if not validation['valid']:
            raise HTTPException(status_code=400, detail=validation['error'])
        
        if not validate_horizon(data['horizon']):
            raise HTTPException(status_code=400, detail='Invalid horizon. Valid options: intraday, short, long')
        
        if not validate_confidence(data['min_confidence']):
            raise HTTPException(status_code=400, detail='min_confidence must be between 0.0 and 1.0')
        
        result = mcp_adapter.scan_all(
            symbols=data['symbols'],
            horizon=data['horizon'],
            min_confidence=data['min_confidence'],
            stop_loss_pct=data.get('stop_loss_pct'),
            capital_risk_pct=data.get('capital_risk_pct')
        )
        
        log_api_request('/tools/scan_all', data, result, 200)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Scan error: {e}", exc_info=True)
        error_response = {'error': str(e)}
        log_api_request('/tools/scan_all', scan_data.dict(), error_response, 500)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/tools/analyze")
async def analyze(
    request: Request,
    analyze_data: AnalyzeRequest,
    client_ip: str = Depends(check_rate_limit)
):
    """Analyze custom tickers with risk parameters (NO AUTH REQUIRED)"""
    try:
        data = analyze_data.dict()
        data = sanitize_input(data)
        
        validation = validate_symbols([data['symbol']])
        if not validation['valid']:
            raise HTTPException(status_code=400, detail=validation['error'])
        
        horizons_validation = validate_horizons_list(data['horizons'])
        if not horizons_validation['valid']:
            raise HTTPException(status_code=400, detail=horizons_validation['error'])
        
        risk_validation = validate_risk_parameters(
            data['stop_loss_pct'], 
            data['capital_risk_pct'], 
            data['drawdown_limit_pct']
        )
        if not risk_validation['valid']:
            raise HTTPException(status_code=400, detail=risk_validation['error'])
        
        result = mcp_adapter.analyze(
            symbol=data['symbol'],
            horizons=data['horizons'],
            stop_loss_pct=data['stop_loss_pct'],
            capital_risk_pct=data['capital_risk_pct'],
            drawdown_limit_pct=data['drawdown_limit_pct']
        )
        
        log_api_request('/tools/analyze', data, result, 200)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}", exc_info=True)
        error_response = {'error': str(e)}
        log_api_request('/tools/analyze', analyze_data.dict(), error_response, 500)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/tools/feedback")
async def feedback(
    request: Request,
    feedback_data: FeedbackRequest,
    client_ip: str = Depends(check_rate_limit)
):
    """Process user feedback for RL fine-tuning (NO AUTH REQUIRED)"""
    try:
        data = feedback_data.dict()
        data = sanitize_input(data)
        
        validation = validate_symbols([data['symbol']])
        if not validation['valid']:
            raise HTTPException(status_code=400, detail=validation['error'])
        
        # Normalize action: BUY -> LONG, SELL -> SHORT
        action_mapping = {
            'BUY': 'LONG',
            'SELL': 'SHORT',
            'LONG': 'LONG',
            'SHORT': 'SHORT',
            'HOLD': 'HOLD'
        }
        normalized_action = action_mapping.get(data['predicted_action'].upper())
        if not normalized_action:
            valid_actions = ['LONG', 'SHORT', 'HOLD', 'BUY', 'SELL']
            raise HTTPException(status_code=400, detail=f'Invalid predicted_action. Valid: {", ".join(valid_actions)}')
        
        # Store original action for logging, but use normalized for processing
        original_action = data['predicted_action']
        user_feedback_text = data['user_feedback']
        
        # Determine if feedback is correct/incorrect based on text or explicit value
        # If user provides "correct" or "incorrect", use that; otherwise analyze the text
        feedback_lower = user_feedback_text.lower().strip()
        if feedback_lower in ['correct', 'incorrect']:
            feedback_sentiment = feedback_lower
        else:
            # Analyze text to determine sentiment (simple keyword-based)
            negative_keywords = ['wrong', 'incorrect', 'bad', 'failed', 'reversed', 'loss', 'down', 'fell', 'dropped']
            positive_keywords = ['correct', 'right', 'good', 'worked', 'profit', 'up', 'rose', 'gained']
            
            has_negative = any(keyword in feedback_lower for keyword in negative_keywords)
            has_positive = any(keyword in feedback_lower for keyword in positive_keywords)
            
            if has_negative and not has_positive:
                feedback_sentiment = 'incorrect'
            elif has_positive and not has_negative:
                feedback_sentiment = 'correct'
            else:
                # Default to incorrect if ambiguous (conservative approach)
                feedback_sentiment = 'incorrect'
        
        result = mcp_adapter.process_feedback(
            symbol=data['symbol'],
            predicted_action=normalized_action,  # Use normalized LONG/SHORT/HOLD
            user_feedback=feedback_sentiment,  # Use correct/incorrect for RL training
            actual_return=data.get('actual_return')
        )
        
        # Include original feedback text in response
        result['original_feedback_text'] = user_feedback_text
        result['original_action'] = original_action
        
        # Return 400 if feedback was rejected due to validation error
        if result.get('status') == 'error':
            log_api_request('/tools/feedback', data, result, 400)
            raise HTTPException(
                status_code=400,
                detail={
                    'error': result.get('error', 'Feedback validation failed'),
                    'validation_warning': result.get('validation_warning'),
                    'suggested_feedback': result.get('suggested_feedback')
                }
            )
        
        log_api_request('/tools/feedback', data, result, 200)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Feedback error: {e}", exc_info=True)
        error_response = {'error': str(e)}
        log_api_request('/tools/feedback', feedback_data.dict(), error_response, 500)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/tools/train_rl")
async def train_rl(
    request: Request,
    train_data: TrainRLRequest,
    client_ip: str = Depends(check_rate_limit)
):
    """Train RL agent and return reward statistics (NO AUTH REQUIRED)"""
    try:
        data = train_data.dict()
        data = sanitize_input(data)
        
        validation = validate_symbols([data['symbol']])
        if not validation['valid']:
            raise HTTPException(status_code=400, detail=validation['error'])
        
        if not validate_horizon(data['horizon']):
            raise HTTPException(status_code=400, detail='Invalid horizon. Valid options: intraday, short, long')
        
        try:
            n_episodes = int(data['n_episodes'])
            if not (10 <= n_episodes <= 100):
                raise HTTPException(status_code=400, detail='n_episodes must be between 10 and 100')
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail='n_episodes must be an integer')
        
        result = mcp_adapter.train_rl(
            symbol=data['symbol'],
            horizon=data['horizon'],
            n_episodes=n_episodes,
            force_retrain=data['force_retrain']
        )
        
        log_api_request('/tools/train_rl', data, result, 200)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"RL training error: {e}", exc_info=True)
        error_response = {'error': str(e)}
        log_api_request('/tools/train_rl', train_data.dict(), error_response, 500)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/tools/fetch_data")
async def fetch_data(
    request: Request,
    fetch_data_req: FetchDataRequest,
    client_ip: str = Depends(check_rate_limit)
):
    """Fetch batch data for symbols (NO AUTH REQUIRED)"""
    try:
        data = fetch_data_req.dict()
        data = sanitize_input(data)
        
        validation = validate_symbols(data['symbols'], config.MAX_SCAN_SYMBOLS)
        if not validation['valid']:
            raise HTTPException(status_code=400, detail=validation['error'])
        
        valid_periods = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max']
        if data['period'] not in valid_periods:
            raise HTTPException(status_code=400, detail=f'Invalid period. Valid options: {", ".join(valid_periods)}')
        
        result = mcp_adapter.fetch_data(
            symbols=data['symbols'],
            period=data['period'],
            include_features=data['include_features'],
            refresh=data['refresh']
        )
        
        log_api_request('/tools/fetch_data', data, result, 200)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fetch data error: {e}", exc_info=True)
        error_response = {'error': str(e)}
        log_api_request('/tools/fetch_data', fetch_data_req.dict(), error_response, 500)
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Main ====================

if __name__ == '__main__':
    import uvicorn
    
    print("\n" + "="*80)
    print(" " * 20 + "MCP API SERVER STARTING")
    print("="*80)
    print("\nSECURITY FEATURES:")
    print("  [ ] JWT Authentication: DISABLED (Open Access)")
    print(f"  [X] Rate Limiting ({config.RATE_LIMIT_PER_MINUTE}/min, {config.RATE_LIMIT_PER_HOUR}/hour)")
    print("  [X] Input Validation")
    print("  [X] Comprehensive Logging")
    print("\nFRAMEWORK:")
    print("  [X] FastAPI (Modern, Fast, Async)")
    print("  [X] Automatic OpenAPI Documentation")
    print("  [X] Pydantic Data Validation")
    print("\nENDPOINTS (ALL OPEN ACCESS - NO AUTH):")
    print("  GET  /                - API information")
    print("  GET  /auth/status     - Rate limit status")
    print("  GET  /tools/health    - System health")
    print("  POST /tools/predict   - Generate predictions")
    print("  POST /tools/scan_all  - Scan and rank symbols")
    print("  POST /tools/analyze   - Analyze with risk parameters")
    print("  POST /tools/feedback  - Human feedback")
    print("  POST /tools/train_rl  - Train RL agent")
    print("  POST /tools/fetch_data - Fetch batch data")
    print("\nDOCUMENTATION:")
    print(f"  Swagger UI: http://{config.UVICORN_HOST}:{config.UVICORN_PORT}/docs")
    print(f"  ReDoc: http://{config.UVICORN_HOST}:{config.UVICORN_PORT}/redoc")
    print("\nACCESS MODE:")
    print("  Status: OPEN ACCESS")
    print("  Authentication: None required")
    print("  All endpoints available without login")
    print(f"\nServer starting on http://{config.UVICORN_HOST}:{config.UVICORN_PORT}")
    print("="*80 + "\n")
    
    # Security warning for debug mode
    if config.DEBUG_MODE:
        print("!" * 80)
        print(" WARNING: DEBUG MODE IS ENABLED ".center(80, "!"))
        print("!" * 80)
        print(" Debug mode exposes sensitive information!".center(80))
        print(" NEVER use debug mode in production deployments!".center(80))
        print(" Set DEBUG_MODE=False in .env for production".center(80))
        print("!" * 80 + "\n")
        import time
        time.sleep(2)  # Force admin to see warning
    
    uvicorn.run(
        "api_server:app",
        host=config.UVICORN_HOST,
        port=config.UVICORN_PORT,
        reload=config.DEBUG_MODE,
        log_level="info"
    )
