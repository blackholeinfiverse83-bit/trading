# BACKEND API COMPREHENSIVE ANALYSIS
## Blackhole Infeverse Trading API v4.0

### 📊 ENDPOINT INVENTORY & SPECIFICATIONS

#### 1. **AUTHENTICATION ENDPOINTS**

##### POST `/auth/login`
- **Purpose**: User authentication
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response** (Success):
  ```json
  {
    "success": true,
    "token": "access_token_string",
    "email": "user@example.com",
    "username": "user",
    "user_id": "uuid"
  }
  ```
- **Response** (Failure):
  ```json
  {
    "success": false,
    "error": "Invalid email or password"
  }
  ```
- **Rate Limit**: 500/min, 10000/hour
- **Authentication**: Required (Supabase)

##### GET `/auth/status`
- **Purpose**: Check rate limit status
- **Response**:
  ```json
  {
    "auth_enabled": true,
    "auth_mode": "supabase",
    "message": "Supabase authentication is enabled"
  }
  ```

---

#### 2. **PREDICTION ENDPOINTS**

##### POST `/tools/predict`
- **Purpose**: Generate trading predictions for symbols
- **Request Body**:
  ```json
  {
    "symbols": ["AAPL", "GOOGL", "MSFT"],
    "horizon": "intraday",  // Options: intraday, short, long
    "risk_profile": "moderate"  // Optional: low, moderate, high
  }
  ```
- **Response**:
  ```json
  {
    "metadata": {
      "count": 3,
      "timestamp": "2026-01-20T13:30:00",
      "request_id": "predict_xxx"
    },
    "predictions": [
      {
        "symbol": "AAPL",
        "action": "LONG",
        "confidence": 0.7958,
        "price_target": null,
        "stop_loss": null,
        "horizon": "intraday"
      },
      // ... more predictions
    ]
  }
  ```
- **Validation Rules**:
  - Symbols: 1-100, uppercase letters only
  - Horizon: intraday, short, or long
  - Risk Profile: low, moderate, high
- **Error Response** (400):
  ```json
  {
    "detail": "Invalid horizon. Valid options: intraday, short, long"
  }
  ```

##### POST `/tools/scan_all`
- **Purpose**: Scan multiple symbols and rank them by trading strength
- **Request Body**:
  ```json
  {
    "symbols": ["AAPL", "GOOGL", "MSFT", "AMZN"],
    "horizon": "intraday",
    "min_confidence": 0.5,
    "stop_loss_pct": 2.0,
    "capital_risk_pct": 1.0
  }
  ```
- **Response**:
  ```json
  {
    "metadata": {
      "count": 4,
      "top_symbol": "AAPL",
      "timestamp": "2026-01-20T13:30:00"
    },
    "predictions": [
      {
        "symbol": "AAPL",
        "action": "LONG",
        "confidence": 0.8,
        "rank": 1
      },
      // ... ranked by confidence
    ]
  }
  ```

##### POST `/tools/analyze`
- **Purpose**: Detailed analysis of a single symbol with risk parameters
- **Request Body**:
  ```json
  {
    "symbol": "AAPL",
    "horizons": ["intraday", "short"],
    "stop_loss_pct": 2.0,
    "capital_risk_pct": 1.0,
    "drawdown_limit_pct": 5.0
  }
  ```
- **Response**:
  ```json
  {
    "symbol": "AAPL",
    "analysis": {
      "intraday": {
        "action": "LONG",
        "confidence": 0.7958
      },
      "short": {
        "action": "HOLD",
        "confidence": 0.6
      }
    },
    "risk_parameters": {
      "stop_loss_pct": 2.0,
      "capital_risk_pct": 1.0,
      "drawdown_limit_pct": 5.0
    }
  }
  ```

---

#### 3. **FEEDBACK & LEARNING ENDPOINTS**

##### POST `/tools/feedback`
- **Purpose**: Process user feedback for RL model training
- **Request Body**:
  ```json
  {
    "symbol": "AAPL",
    "predicted_action": "LONG",  // or BUY, SELL, SHORT, HOLD
    "user_feedback": "correct",  // or "incorrect" or text
    "actual_return": 2.5  // Optional: percentage return
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "symbol": "AAPL",
    "original_feedback_text": "The trade went well",
    "original_action": "LONG",
    "processing_timestamp": "2026-01-20T13:30:00"
  }
  ```
- **Action Mapping**:
  - BUY → LONG
  - SELL → SHORT
  - HOLD → HOLD
- **Feedback Interpretation**:
  - Keywords analyzed: correct/incorrect, loss/profit, up/down, etc.

##### POST `/tools/train_rl`
- **Purpose**: Train RL agent for a symbol
- **Request Body**:
  ```json
  {
    "symbol": "AAPL",
    "horizon": "intraday",
    "n_episodes": 50,
    "force_retrain": false
  }
  ```
- **Response**:
  ```json
  {
    "symbol": "AAPL",
    "training_status": "completed",
    "episodes": 50,
    "reward_statistics": {
      "mean_reward": 0.45,
      "std_reward": 0.12
    },
    "training_time": "2.34s"
  }
  ```

---

#### 4. **DATA ENDPOINTS**

##### POST `/tools/fetch_data`
- **Purpose**: Fetch historical data for symbols
- **Request Body**:
  ```json
  {
    "symbols": ["AAPL", "GOOGL"],
    "period": "1y",  // Options: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
    "include_features": true,
    "refresh": false
  }
  ```
- **Response**:
  ```json
  {
    "metadata": {
      "count": 2,
      "period": "1y"
    },
    "data": {
      "AAPL": {
        "prices": [...],
        "features": {...}  // if include_features=true
      }
    }
  }
  ```

##### GET `/tools/health`
- **Purpose**: Get system health status
- **Response**:
  ```json
  {
    "status": "healthy",
    "system": {
      "cpu_usage_percent": 25.3,
      "memory_percent": 45.2,
      "timestamp": "2026-01-20T13:30:00"
    }
  }
  ```

---

#### 5. **RISK MANAGEMENT ENDPOINTS**

##### POST `/api/risk/stop-loss`
- **Purpose**: Set or update stop-loss for a symbol
- **Request Body**:
  ```json
  {
    "symbol": "AAPL",
    "stop_loss_price": 150.25,
    "side": "BUY",  // or "SELL"
    "timeframe": "1d",
    "source": "manual"  // or "chart"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Stop loss set for AAPL at 150.25",
    "stop_loss": {
      "symbol": "AAPL",
      "price": 150.25,
      "side": "BUY",
      "timeframe": "1d",
      "source": "manual",
      "timestamp": "2026-01-20T13:30:00"
    }
  }
  ```

##### POST `/api/risk/assess`
- **Purpose**: Assess risk metrics for a position
- **Request Body**:
  ```json
  {
    "symbol": "AAPL",
    "entry_price": 150.0,
    "stop_loss_price": 147.0,
    "quantity": 10,
    "capital_at_risk": 0.02  // 2% of capital
  }
  ```
- **Response**:
  ```json
  {
    "symbol": "AAPL",
    "position_size": 1500.0,
    "risk_amount": 30.0,
    "risk_percentage": 2.0,
    "capital_at_risk": 0.02,
    "max_capital_at_risk": 30.0,
    "recommendation": "ACCEPTABLE",
    "suggestions": []
  }
  ```

---

#### 6. **AI CHAT ENDPOINT**

##### POST `/api/ai/chat`
- **Purpose**: AI trading assistant
- **Request Body**:
  ```json
  {
    "message": "What's a good stop loss for swing trades?",
    "context": {
      "current_symbol": "AAPL",
      "portfolio_value": 10000
    }
  }
  ```
- **Response**:
  ```json
  {
    "message": "For swing trades, I recommend setting stop losses at 5-8% below entry price...",
    "timestamp": "2026-01-20T13:30:00",
    "context": {...},
    "intent": "trading_assistance"
  }
  ```

---

### 🔐 SECURITY & RATE LIMITING
- **Authentication**: Supabase Auth (Email/Password)
- **Rate Limits**: 
  - 500 requests per minute
  - 10000 requests per hour
- **Input Validation**: All inputs sanitized and validated
- **Error Handling**: Comprehensive error messages

### 📊 RESPONSE STRUCTURE PATTERNS
All responses follow a consistent structure:
- **Success**: `{ "metadata": {...}, "predictions": [...] }`
- **Error**: `{ "detail": "Error message" }`
- **Timestamp**: All responses include ISO8601 timestamps

### 🎯 FRONTEND INTEGRATION REQUIREMENTS
1. **Token Management**: Store JWT token from `/auth/login`
2. **Rate Limit Handling**: Implement exponential backoff
3. **Error Handling**: Display user-friendly error messages
4. **Real-time Updates**: Use periodic requests or WebSocket
5. **Caching**: Cache predictions for 2-5 minutes
6. **Loading States**: Show spinners for async operations
