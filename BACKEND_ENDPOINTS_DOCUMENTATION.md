# Backend Endpoints Documentation

This document provides a comprehensive overview of all backend API endpoints and their connections to the frontend.

## Base URL
- **Development**: `http://127.0.0.1:8000`
- **Production**: Configure via `VITE_API_BASE_URL` environment variable

## Authentication
- **Status**: DISABLED (Open Access)
- **Rate Limiting**: Enabled (per IP address)
  - Per Minute: 60 requests
  - Per Hour: 1000 requests

---

## API Endpoints

### 1. **GET /** - API Information
**Endpoint**: `/`  
**Method**: `GET`  
**Auth Required**: No

**Description**: Returns API information, available endpoints, and rate limit details.

**Response**:
```json
{
  "name": "Stock Prediction MCP API",
  "version": "4.0",
  "description": "MCP-style REST API with open access, rate limiting, and validation",
  "authentication": "DISABLED - Open access to all endpoints",
  "endpoints": { ... },
  "rate_limits": {
    "per_minute": 60,
    "per_hour": 1000
  }
}
```

**Frontend Usage**: Not directly used in frontend components.

---

### 2. **POST /auth/login** - User Authentication
**Endpoint**: `/auth/login`  
**Method**: `POST`  
**Auth Required**: No

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "username": "username",
  "expires_in_hours": 24
}
```

**Frontend Connection**:
- **File**: `src/pages/LoginPage.tsx`
- **Service**: `src/services/api.ts` → `authAPI.login()`
- **Usage**: User login functionality

---

### 3. **GET /auth/status** - Rate Limit Status
**Endpoint**: `/auth/status`  
**Method**: `GET`  
**Auth Required**: No

**Description**: Returns rate limit status for the current IP address.

**Response**:
```json
{
  "requests_remaining_minute": 59,
  "requests_remaining_hour": 999,
  "reset_time_minute": "2024-01-01T12:01:00",
  "reset_time_hour": "2024-01-01T13:00:00"
}
```

**Frontend Connection**:
- **Service**: `src/services/api.ts` → `stockAPI.getRateLimitStatus()`
- **Usage**: Currently not actively used in UI (available for future implementation)

---

### 4. **GET /tools/health** - System Health Check
**Endpoint**: `/tools/health`  
**Method**: `GET`  
**Auth Required**: No

**Description**: Returns system health metrics including CPU, memory, and disk usage.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00",
  "system": {
    "cpu_usage_percent": 9.8,
    "memory_percent": 88.1,
    "memory_total_gb": 16.0,
    "memory_used_gb": 14.1,
    "disk_percent": 45.2
  },
  "models": {
    "available": true,
    "total_trained": 10
  }
}
```

**Frontend Connection**:
- **File**: `src/pages/DashboardPage.tsx`
- **Service**: `src/services/api.ts` → `stockAPI.health()`
- **Usage**: 
  - Displayed in Dashboard header as "System Healthy" banner
  - Shows CPU and Memory usage percentages
  - Auto-refreshes every 60 seconds

---

### 5. **POST /tools/predict** - Generate Predictions
**Endpoint**: `/tools/predict`  
**Method**: `POST`  
**Auth Required**: No

**Description**: Generates AI-powered predictions for one or more symbols.

**Request Body**:
```json
{
  "symbols": ["AAPL", "GOOGL"],
  "horizon": "intraday",  // "intraday" | "short" | "long"
  "risk_profile": "moderate",  // Optional: "low" | "moderate" | "high"
  "stop_loss_pct": 2.0,  // Optional: 0.1-50.0
  "capital_risk_pct": 1.0,  // Optional: 0.1-100.0
  "drawdown_limit_pct": 5.0  // Optional: 0.1-100.0
}
```

**Response**:
```json
{
  "metadata": {
    "count": 2,
    "horizon": "intraday",
    "timestamp": "2024-01-01T12:00:00"
  },
  "predictions": [
    {
      "symbol": "AAPL",
      "action": "LONG",  // "LONG" | "SHORT" | "HOLD"
      "current_price": 150.25,
      "predicted_price": 155.50,
      "predicted_return": 3.5,
      "confidence": 0.85,
      "reason": "Strong technical indicators suggest upward movement",
      "ensemble_details": { ... },
      "individual_predictions": { ... }
    }
  ]
}
```

**Frontend Connection**:
- **Files**: 
  - `src/pages/MarketScanPage.tsx` (primary usage)
  - `src/pages/WatchListPage.tsx`
  - `src/pages/PortfolioPage.tsx`
  - `src/components/StocksView.tsx`
  - `src/components/CryptoView.tsx`
  - `src/components/CommoditiesView.tsx`
- **Service**: `src/services/api.ts` → `stockAPI.predict()`
- **Usage**: 
  - Main prediction generation for all asset types
  - Used in search functionality
  - Powers watchlist and portfolio price updates

---

### 6. **POST /tools/scan_all** - Scan and Rank Multiple Symbols
**Endpoint**: `/tools/scan_all`  
**Method**: `POST`  
**Auth Required**: No

**Description**: Scans multiple symbols and returns ranked predictions based on confidence.

**Request Body**:
```json
{
  "symbols": ["AAPL", "GOOGL", "MSFT", "TSLA"],
  "horizon": "intraday",
  "min_confidence": 0.3,  // 0.0-1.0
  "stop_loss_pct": 2.0,  // Optional
  "capital_risk_pct": 1.0  // Optional
}
```

**Response**:
```json
{
  "metadata": {
    "total_symbols": 4,
    "predictions_generated": 4,
    "shortlist_count": 3,
    "horizon": "intraday"
  },
  "shortlist": [
    // Top predictions sorted by confidence
  ],
  "all_predictions": [
    // All predictions including lower confidence ones
  ]
}
```

**Frontend Connection**:
- **Files**: 
  - `src/pages/DashboardPage.tsx` (primary usage)
  - `src/pages/AnalyticsPage.tsx`
  - `src/pages/MarketScanPage.tsx`
- **Service**: `src/services/api.ts` → `stockAPI.scanAll()`
- **Usage**: 
  - Dashboard: Loads top 4 stocks for portfolio overview
  - Analytics: Scans multiple symbols for analysis
  - Market Scan: Bulk scanning functionality

---

### 7. **POST /tools/analyze** - Deep Analysis
**Endpoint**: `/tools/analyze`  
**Method**: `POST`  
**Auth Required**: No

**Description**: Performs deep analysis with multiple horizons and risk parameters.

**Request Body**:
```json
{
  "symbol": "AAPL",
  "horizons": ["intraday", "short", "long"],
  "stop_loss_pct": 2.0,
  "capital_risk_pct": 1.0,
  "drawdown_limit_pct": 5.0
}
```

**Response**:
```json
{
  "metadata": {
    "symbol": "AAPL",
    "consensus": "LONG",
    "average_confidence": 0.82,
    "horizons": ["intraday", "short", "long"]
  },
  "predictions": [
    // Predictions for each horizon
  ]
}
```

**Frontend Connection**:
- **Files**: 
  - `src/pages/MarketScanPage.tsx`
  - `src/components/StopLoss.tsx`
- **Service**: `src/services/api.ts` → `stockAPI.analyze()`
- **Usage**: 
  - "Deep Analyze" button in Market Scan
  - Stop-loss calculator integration
  - Multi-horizon analysis

---

### 8. **POST /tools/feedback** - User Feedback
**Endpoint**: `/tools/feedback`  
**Method**: `POST`  
**Auth Required**: No

**Description**: Submits user feedback on predictions for RL model fine-tuning.

**Request Body**:
```json
{
  "symbol": "AAPL",
  "predicted_action": "LONG",
  "user_feedback": "correct",  // "correct" | "incorrect"
  "actual_return": 3.5  // Optional
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Feedback recorded",
  "symbol": "AAPL"
}
```

**Frontend Connection**:
- **File**: `src/pages/MarketScanPage.tsx`
- **Service**: `src/services/api.ts` → `stockAPI.feedback()`
- **Usage**: 
  - Feedback modal in predictions
  - "Correct" / "Incorrect" buttons
  - RL model training data collection

---

### 9. **POST /tools/train_rl** - Train RL Agent
**Endpoint**: `/tools/train_rl`  
**Method**: `POST`  
**Auth Required**: No

**Description**: Trains the reinforcement learning agent for a specific symbol.

**Request Body**:
```json
{
  "symbol": "AAPL",
  "horizon": "intraday",
  "n_episodes": 50,  // 10-100
  "force_retrain": false
}
```

**Response**:
```json
{
  "status": "success",
  "symbol": "AAPL",
  "episodes": 50,
  "average_reward": 0.75,
  "training_time_seconds": 120
}
```

**Frontend Connection**:
- **Service**: `src/services/api.ts` → `stockAPI.trainRL()`
- **Usage**: Currently not used in UI (available for admin/advanced features)

---

### 10. **POST /tools/fetch_data** - Fetch Historical Data
**Endpoint**: `/tools/fetch_data`  
**Method**: `POST`  
**Auth Required**: No

**Description**: Fetches historical price data and optionally technical features.

**Request Body**:
```json
{
  "symbols": ["AAPL", "GOOGL"],
  "period": "2y",  // "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "10y" | "ytd" | "max"
  "include_features": false,
  "refresh": false
}
```

**Response**:
```json
{
  "data": {
    "AAPL": {
      "symbol": "AAPL",
      "history": [
        {
          "Date": "2024-01-01",
          "Open": 150.0,
          "High": 152.0,
          "Low": 149.0,
          "Close": 151.0,
          "Volume": 1000000
        }
      ],
      "features": { ... }  // If include_features=true
    }
  },
  "metadata": {
    "count": 1,
    "period": "2y"
  }
}
```

**Frontend Connection**:
- **Files**: 
  - `src/pages/AnalyticsPage.tsx`
  - `src/components/CandlestickChart.tsx` (NEW)
- **Service**: `src/services/api.ts` → `stockAPI.fetchData()`
- **Usage**: 
  - Analytics page: Loads features for technical analysis
  - Candlestick chart: Fetches historical OHLC data
  - Chart visualization

---

## Frontend Service Layer

All API calls are centralized in `src/services/api.ts`:

### API Client Configuration
- **Base URL**: Configured in `src/config.ts`
- **Timeout**: 60 seconds (for long-running requests)
- **Headers**: `Content-Type: application/json`
- **Interceptors**: 
  - Request: Adds JWT token if available
  - Response: Handles errors and formats messages

### Error Handling
- Network errors: "Unable to connect to server"
- Server errors: Extracts error message from response
- Timeout errors: Handled by axios timeout

---

## Data Flow Summary

### Dashboard Page
1. `DashboardPage.tsx` → `stockAPI.scanAll()` → `/tools/scan_all`
2. `DashboardPage.tsx` → `stockAPI.health()` → `/tools/health`

### Market Scan Page
1. `MarketScanPage.tsx` → `stockAPI.predict()` → `/tools/predict`
2. `MarketScanPage.tsx` → `stockAPI.analyze()` → `/tools/analyze`
3. `MarketScanPage.tsx` → `stockAPI.feedback()` → `/tools/feedback`
4. `MarketScanPage.tsx` → `stockAPI.scanAll()` → `/tools/scan_all`

### Analytics Page
1. `AnalyticsPage.tsx` → `stockAPI.scanAll()` → `/tools/scan_all`
2. `AnalyticsPage.tsx` → `stockAPI.fetchData()` → `/tools/fetch_data`

### Portfolio Page
1. `PortfolioPage.tsx` → `stockAPI.predict()` → `/tools/predict`

### Watch List Page
1. `WatchListPage.tsx` → `stockAPI.predict()` → `/tools/predict`

### Candlestick Chart (NEW)
1. `CandlestickChart.tsx` → `stockAPI.fetchData()` → `/tools/fetch_data`

---

## Rate Limiting

- **Per Minute**: 60 requests
- **Per Hour**: 1000 requests
- **Enforcement**: Per IP address
- **Status Check**: Available via `/auth/status`

---

## Notes

1. **No Authentication**: All endpoints are open access (authentication disabled)
2. **Input Validation**: All inputs are validated and sanitized
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **Logging**: All API requests are logged for debugging
5. **CORS**: Enabled for all origins (development setup)

---

## Future Enhancements

1. **Real-time Data**: WebSocket support for live price updates
2. **Options Chain**: Dedicated endpoint for options data
3. **Chart Data**: Optimized endpoint for candlestick data
4. **Authentication**: Re-enable JWT authentication if needed
5. **Caching**: Implement response caching for frequently accessed data

