# Complete API Endpoints Reference & Integration Guide

## Overview
Backend API running on `http://127.0.0.1:8000`
Frontend running on `http://localhost:5173`
All endpoints use JSON request/response format
CORS configured for frontend access

---

## Authentication Endpoints

### 1. POST /auth/signup
**Purpose:** User registration with Supabase
- **Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123"
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token"
    }
  }
  ```
- **Response (Error 400):** `{"error": "User already exists"}`
- **Frontend Integration:** SignUp.tsx → `authAPI.signup(email, password)`
- **Status:** ✅ Implemented

### 2. POST /auth/login
**Purpose:** User login and JWT token generation
- **Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123"
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "access_token": "jwt_token",
    "token_type": "Bearer",
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  }
  ```
- **Response (Error 401):** `{"detail": "Invalid credentials"}`
- **Frontend Integration:** LoginPage.tsx → `authAPI.login(email, password)`
- **Status:** ✅ Implemented

### 3. POST /auth/logout
**Purpose:** Invalidate user session
- **Headers Required:** `Authorization: Bearer {token}`
- **Request:** Empty body
- **Response (Success 200):**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- **Frontend Integration:** AuthContext → logout button triggers logout
- **Status:** ✅ Implemented

### 4. GET /auth/status
**Purpose:** Check authentication status and get user info
- **Headers Required:** `Authorization: Bearer {token}`
- **Request:** Query parameters (optional)
- **Response (Success 200):**
  ```json
  {
    "authenticated": true,
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  }
  ```
- **Response (Unauthenticated 401):** `{"authenticated": false}`
- **Frontend Integration:** AuthContext → periodic status checks
- **Status:** ✅ Implemented

---

## Trading/Prediction Endpoints

### 5. POST /tools/predict
**Purpose:** Predict stock price movement (Bull/Bear/Neutral)
- **Request:**
  ```json
  {
    "symbol": "SBIN",
    "timeframe": "1h",
    "indicators": ["RSI", "MACD", "SMA"]
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "prediction": "BULL",
    "confidence": 0.85,
    "signals": {
      "RSI": "OVERBOUGHT",
      "MACD": "BULLISH",
      "SMA": "ABOVE"
    },
    "recommendation": "BUY"
  }
  ```
- **Response (Error 400):** `{"detail": "Invalid stock symbol"}`
- **Frontend Integration:** PredictPage.tsx → `stockAPI.predict(symbol, timeframe, indicators)`
- **Status:** ✅ Implemented
- **Notes:** Uses technical indicators for signal generation

### 6. POST /tools/scan_all
**Purpose:** Scan all available stocks for trading opportunities
- **Request:**
  ```json
  {
    "min_volume": 1000000,
    "max_change": 5.0
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "opportunities": [
      {
        "symbol": "SBIN",
        "signal": "BULL",
        "confidence": 0.87,
        "volume": 5000000,
        "change_percent": 2.3
      }
    ],
    "scan_time": "2024-01-01T12:00:00Z"
  }
  ```
- **Frontend Integration:** ScanPage.tsx → `stockAPI.scanAll(minVolume, maxChange)`
- **Status:** ✅ Implemented
- **Notes:** Returns list of high-opportunity stocks

### 7. POST /tools/analyze
**Purpose:** Deep fundamental + technical analysis
- **Request:**
  ```json
  {
    "symbol": "SBIN",
    "analysis_type": "comprehensive"
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "technical": {
      "trend": "UPTREND",
      "support": 450.0,
      "resistance": 480.0,
      "indicators": {...}
    },
    "fundamental": {
      "pe_ratio": 15.2,
      "pb_ratio": 1.8,
      "roe": 12.5,
      "debt_ratio": 0.45
    },
    "overall_score": 8.2
  }
  ```
- **Frontend Integration:** AnalyzePage.tsx → `stockAPI.analyze(symbol)`
- **Status:** ✅ Implemented

### 8. POST /tools/train_rl
**Purpose:** Train reinforcement learning model for trading
- **Request:**
  ```json
  {
    "symbol": "SBIN",
    "episodes": 100,
    "learning_rate": 0.001
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "model_id": "rl_model_20240101_001",
    "episodes_completed": 100,
    "final_reward": 1250.5,
    "status": "completed"
  }
  ```
- **Response (In Progress 202):**
  ```json
  {
    "model_id": "rl_model_20240101_001",
    "progress": 45,
    "current_reward": 650.2
  }
  ```
- **Frontend Integration:** TrainModelPage.tsx → Tracks progress via polling
- **Status:** ✅ Implemented
- **Notes:** Long-running operation with progress tracking

### 9. POST /tools/execute
**Purpose:** Execute actual trading order
- **Request:**
  ```json
  {
    "symbol": "SBIN",
    "action": "BUY",
    "quantity": 10,
    "price": 455.0
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "order_id": "ORD_20240101_001",
    "symbol": "SBIN",
    "action": "BUY",
    "quantity": 10,
    "executed_price": 455.5,
    "status": "executed",
    "timestamp": "2024-01-01T12:00:00Z"
  }
  ```
- **Frontend Integration:** ExecutePage.tsx → `stockAPI.execute(symbol, action, quantity, price)`
- **Status:** ✅ Implemented

---

## Risk Management Endpoints

### 10. POST /api/risk/assess
**Purpose:** Assess portfolio risk and get risk metrics
- **Request:**
  ```json
  {
    "portfolio": [
      {"symbol": "SBIN", "quantity": 10},
      {"symbol": "INFY", "quantity": 5}
    ],
    "risk_level": "moderate"
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "portfolio_value": 50000.0,
    "var_95": 2500.0,
    "max_drawdown": 0.15,
    "sharpe_ratio": 1.2,
    "risk_score": 6.5,
    "recommendations": [
      "Reduce SBIN exposure",
      "Diversify with bonds"
    ]
  }
  ```
- **Frontend Integration:** RiskPage.tsx → `riskAPI.assessRisk(portfolio, riskLevel)`
- **Status:** ✅ Implemented

### 11. POST /api/risk/stop-loss
**Purpose:** Calculate optimal stop-loss and take-profit levels
- **Request:**
  ```json
  {
    "symbol": "SBIN",
    "entry_price": 455.0,
    "account_balance": 100000,
    "risk_percentage": 2.0
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "stop_loss": 443.2,
    "take_profit": 481.5,
    "position_size": 50,
    "risk_reward_ratio": 1.5,
    "max_loss": 2000
  }
  ```
- **Frontend Integration:** RiskPage.tsx → `riskAPI.calculateStopLoss(symbol, entryPrice, accountBalance, riskPercentage)`
- **Status:** ✅ Implemented

---

## Data & Features Endpoints

### 12. POST /tools/fetch_data
**Purpose:** Fetch historical price data (OHLCV)
- **Request:**
  ```json
  {
    "symbol": "SBIN",
    "from_date": "2024-01-01",
    "to_date": "2024-01-31",
    "interval": "1d"
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "symbol": "SBIN",
    "data": [
      {
        "date": "2024-01-01",
        "open": 450.0,
        "high": 455.5,
        "low": 448.0,
        "close": 452.5,
        "volume": 5000000
      }
    ]
  }
  ```
- **Frontend Integration:** Charts/Historical data components
- **Status:** ✅ Implemented

### 13. POST /tools/feedback
**Purpose:** Submit trade feedback for model improvement
- **Request:**
  ```json
  {
    "trade_id": "TRADE_001",
    "actual_outcome": "WIN",
    "profit_loss": 1500.0,
    "feedback": "Good signal accuracy"
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "feedback_id": "FB_20240101_001",
    "status": "recorded",
    "model_improvement": "Scheduled"
  }
  ```
- **Frontend Integration:** Trade History component → Submit feedback
- **Status:** ✅ Implemented

### 14. POST /api/ai/chat
**Purpose:** Chat with AI assistant about trading strategies
- **Request:**
  ```json
  {
    "message": "What's the best strategy for SBIN?",
    "context": {
      "symbol": "SBIN",
      "timeframe": "1h",
      "active_indicators": ["RSI", "MACD"]
    }
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "response": "Based on the current RSI and MACD signals, SBIN shows a bullish trend. Consider entering a long position with a stop-loss below 450.",
    "trading_tips": [
      "Monitor RSI above 70 for overbought conditions",
      "Wait for MACD crossover confirmation"
    ],
    "confidence": 0.82
  }
  ```
- **Response (Error 500):** `{"detail": "AI service unavailable"}`
- **Frontend Integration:** TrainModelPage.tsx → `aiAPI.chat(userMessage, context)`
- **Status:** ✅ Implemented
- **Fallback:** Graceful error handling if backend unavailable

---

## System & Health Endpoints

### 15. GET /tools/health
**Purpose:** Check API server health and status
- **Request:** No body required
- **Response (Success 200):**
  ```json
  {
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00Z",
    "version": "1.0.0",
    "uptime_seconds": 3600,
    "endpoints_available": 14
  }
  ```
- **Response (Degraded 503):** `{"status": "degraded", "issues": ["Database connection slow"]}`
- **Frontend Integration:** ConnectionContext → periodic health checks
- **Status:** ✅ Implemented

### 16. GET /
**Purpose:** API root endpoint (documentation redirect)
- **Response (Success 200):**
  ```json
  {
    "message": "Multi-Asset Trading API",
    "version": "1.0.0",
    "documentation": "/docs",
    "endpoints": 14
  }
  ```
- **Frontend Integration:** Optional, mainly for API documentation
- **Status:** ✅ Implemented

---

## Integration Status & Checklist

### Frontend Components Integration:
- ✅ **LoginPage.tsx** - POST /auth/login
- ✅ **SignUp.tsx** - POST /auth/signup
- ✅ **TrainModelPage.tsx** - POST /tools/train_rl, POST /api/ai/chat
- ✅ **PredictPage.tsx** - POST /tools/predict
- ✅ **ScanPage.tsx** - POST /tools/scan_all
- ✅ **AnalyzePage.tsx** - POST /tools/analyze
- ✅ **ExecutePage.tsx** - POST /tools/execute
- ✅ **RiskPage.tsx** - POST /api/risk/assess, POST /api/risk/stop-loss
- ✅ **HistoryPage.tsx** - GET /tools/fetch_data
- ⏳ **PerformancePage.tsx** - POST /tools/feedback

### Authentication Flow:
1. User registers via SignUp.tsx → POST /auth/signup
2. System gets JWT token from response
3. Token stored in localStorage via AuthContext
4. All subsequent API calls inject token in Authorization header
5. Backend validates token on protected endpoints
6. User logout clears token and calls POST /auth/logout

### Error Handling:
- 400 Bad Request: Invalid parameters
- 401 Unauthorized: Missing/invalid token
- 403 Forbidden: Insufficient permissions
- 500 Internal Server Error: Server-side error

---

## Testing Endpoints

### Quick cURL Tests:

```bash
# Health check
curl http://127.0.0.1:8000/tools/health

# Login
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# Predict
curl -X POST http://127.0.0.1:8000/tools/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"symbol":"SBIN","timeframe":"1h","indicators":["RSI"]}'
```

---

## Performance Optimization

### Connection Pooling:
- Backend uses connection pooling for database
- Frontend uses Axios instance with keep-alive

### Caching Strategy:
- Health check: Cache for 30 seconds
- Stock data: Cache for 5 minutes
- Technical indicators: Cache for 1 minute
- Auth status: Cache for session duration

### Rate Limiting:
- 100 requests per minute per user
- 1000 requests per minute per IP
- Backoff strategy: Exponential with 1s base

---

## Deployment Checklist

- ✅ Backend running on :8000
- ✅ Frontend running on :5173
- ✅ CORS enabled between frontend and backend
- ✅ Supabase authentication configured
- ✅ All 14 endpoints responding
- ✅ Error handling implemented
- ✅ Token injection working
- ✅ Health checks passing

---

## Next Steps

1. **Integration Testing**: Test each endpoint from frontend
2. **Load Testing**: Verify performance with concurrent requests
3. **Security Audit**: Validate token handling and input validation
4. **Documentation API**: Generate OpenAPI/Swagger docs
5. **Monitoring**: Add request/response logging
6. **Analytics**: Track endpoint usage and performance metrics
