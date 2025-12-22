# Backend Integration Guide for TradeAI Dashboard

## Overview
This document provides API specifications for the backend team to implement three endpoints required by the TradeAI Dashboard frontend.

---

## Required Endpoints

### 1. Trading Chart Data
**Endpoint:** `GET /chart/data`

**Description:** Returns historical OHLCV (Open, High, Low, Close, Volume) data for charting

**Query Parameters:**
- `symbol` - Trading pair (e.g., "BTC/USDT", "ETH/USDT", "SPX")
- `timeframe` - Candle interval ("15M", "1H", "4H", "1D")
- `limit` - Number of candles to return (default: 100)

**Example Request:**
```
GET /chart/data?symbol=BTC/USDT&timeframe=1H&limit=50
```

**Response Format:**
```json
[
  {
    "time": "2025-11-13T10:00:00Z",  // ISO 8601 format
    "open": 43100.50,
    "high": 43350.75,
    "low": 43050.20,
    "close": 43250.50,
    "volume": 750000.00,
    "ma7": 43180.25,      // Optional: 7-period moving average
    "ma25": 42950.80      // Optional: 25-period moving average
  },
  {
    "time": "2025-11-13T11:00:00Z",
    "open": 43250.50,
    "high": 43500.00,
    "low": 43200.00,
    "close": 43450.25,
    "volume": 820000.00,
    "ma7": 43200.50,
    "ma25": 42980.40
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error

**Notes:**
- Return candles in chronological order (oldest first)
- Frontend polls this endpoint every 10 seconds
- Moving averages are optional but recommended

---

### 2. Live Predictions Feed
**Endpoint:** `GET /feed/live`

**Description:** Returns real-time AI trading predictions/signals

**Request:** No body required

**Response Format:**
```json
[
  {
    "id": "string",           // Unique identifier
    "asset": "string",        // Asset name (e.g., "Bitcoin", "Ethereum")
    "symbol": "string",       // Trading symbol (e.g., "BTC/USDT")
    "direction": "long" | "short",  // Trade direction
    "confidence": number,     // Confidence score (0-100)
    "entryPrice": number,     // Entry price point
    "timestamp": "string",    // ISO 8601 format
    "timeframe": "string"     // e.g., "5m", "15m", "1h", "4h"
  }
]
```

**Example Response:**
```json
[
  {
    "id": "pred_123456",
    "asset": "Bitcoin",
    "symbol": "BTC/USDT",
    "direction": "long",
    "confidence": 87.5,
    "entryPrice": 43250.50,
    "timestamp": "2025-11-13T10:30:00Z",
    "timeframe": "15m"
  },
  {
    "id": "pred_123457",
    "asset": "Ethereum",
    "symbol": "ETH/USDT",
    "direction": "short",
    "confidence": 82.3,
    "entryPrice": 2285.75,
    "timestamp": "2025-11-13T10:28:00Z",
    "timeframe": "5m"
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Server error

**Notes:**
- Frontend polls this endpoint every 5 seconds
- Return array of predictions (most recent first)
- Recommend returning 5-10 most recent predictions

---

### 3. Confirm Trade Parameters
**Endpoint:** `POST /tools/confirm`

**Description:** Saves user's trade configuration parameters

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "stopLoss": number,      // Stop loss percentage (0.5 - 10)
  "targetProfit": number,  // Target profit percentage (1 - 20)
  "amount": number,        // Trade amount in USD
  "riskMode": boolean      // Aggressive risk mode enabled/disabled
}
```

**Example Request:**
```json
{
  "stopLoss": 2.0,
  "targetProfit": 5.0,
  "amount": 1000,
  "riskMode": false
}
```

**Response Format:**
```json
{
  "success": boolean,
  "message": "string",
  "data": {
    "id": "string",          // Configuration ID
    "timestamp": "string"    // ISO 8601 format
  }
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Trade parameters confirmed successfully",
  "data": {
    "id": "config_789012",
    "timestamp": "2025-11-13T10:30:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error

**Validation Rules:**
- `stopLoss`: Must be between 0.5 and 10
- `targetProfit`: Must be between 1 and 20
- `amount`: Must be positive number
- `riskMode`: Must be boolean

---

### 4. Chat Query (Uniguru AI)
**Endpoint:** `POST /chat/query`

**Description:** Processes user chat messages and returns AI assistant responses

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "string"      // User's chat message
}
```

**Example Request:**
```json
{
  "message": "What's the current market sentiment for BTC?"
}
```

**Response Format:**
```json
{
  "message": "string",     // AI assistant response
  "timestamp": "string"    // ISO 8601 format
}
```

**Example Response:**
```json
{
  "message": "Based on the current market conditions, BTC is showing strong support at $43,000. The RSI indicates oversold conditions on the 4H timeframe, suggesting a potential reversal.",
  "timestamp": "2025-11-13T10:30:00Z"
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Empty message
- `500 Internal Server Error` - Server error

**Notes:**
- Response should be conversational and helpful
- Include market analysis, trading insights, or strategy recommendations
- Average response time should be under 2 seconds

---

## CORS Configuration

Since frontend and backend may be on different domains, enable CORS:

```javascript
// Example for Express.js
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  methods: ['GET', 'POST'],
  credentials: true
}));
```

---

## Authentication (Optional)

If implementing authentication, use Bearer token:

**Request Headers:**
```
Authorization: Bearer <token>
```

**Unauthorized Response:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

**Status Code:** `401 Unauthorized`

---

## Error Response Format

All errors should follow this format:

```json
{
  "error": "string",       // Error type
  "message": "string",     // Human-readable message
  "details": "string"      // Optional: additional details
}
```

**Example:**
```json
{
  "error": "ValidationError",
  "message": "Stop loss percentage must be between 0.5 and 10",
  "details": "Received value: 15"
}
```

---

## Rate Limiting Recommendations

- `/chart/data`: 30 requests per minute per user
- `/feed/live`: 20 requests per minute per user
- `/tools/confirm`: 10 requests per minute per user
- `/chat/query`: 30 requests per minute per user

---

## Testing Endpoints

### cURL Examples

**1. Test Chart Data:**
```bash
curl -X GET https://api.yourcompany.com/chart/data \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC/USDT",
    "timeframe": "1H",
    "limit": 50
  }'
```

**2. Test Live Feed:**
```bash
curl -X GET https://api.yourcompany.com/feed/live \
  -H "Content-Type: application/json"
```

**3. Test Confirm Trade:**
```bash
curl -X POST https://api.yourcompany.com/tools/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "stopLoss": 2.0,
    "targetProfit": 5.0,
    "amount": 1000,
    "riskMode": false
  }'
```

**4. Test Chat Query:**
```bash
curl -X POST https://api.yourcompany.com/chat/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the current market sentiment?"
  }'
```

---

## Frontend Integration Checklist

Once backend is ready, provide frontend team with:

- [ ] Base API URL (e.g., `https://api.yourcompany.com`)
- [ ] Authentication method (if required)
- [ ] API keys/tokens (if required)
- [ ] Rate limit information
- [ ] Any specific headers needed
- [ ] Staging/testing environment URL

---

## Database Schema Suggestions

### Predictions Table
```sql
CREATE TABLE predictions (
  id VARCHAR(50) PRIMARY KEY,
  asset VARCHAR(50),
  symbol VARCHAR(20),
  direction ENUM('long', 'short'),
  confidence DECIMAL(5,2),
  entry_price DECIMAL(12,2),
  timeframe VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Trade Configs Table
```sql
CREATE TABLE trade_configs (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  stop_loss DECIMAL(5,2),
  target_profit DECIMAL(5,2),
  amount DECIMAL(12,2),
  risk_mode BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chat History Table
```sql
CREATE TABLE chat_history (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  message TEXT,
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Performance Requirements

- **Response Time:** < 500ms for `/feed/live` and `/tools/confirm`
- **Response Time:** < 2s for `/chat/query`
- **Availability:** 99.9% uptime
- **Concurrent Users:** Support at least 1000 simultaneous connections

---

## Security Recommendations

1. **Input Validation:** Validate all incoming data
2. **SQL Injection:** Use parameterized queries
3. **XSS Protection:** Sanitize user inputs
4. **Rate Limiting:** Implement per-user rate limits
5. **HTTPS Only:** Enforce SSL/TLS
6. **API Keys:** Rotate regularly if used
7. **Logging:** Log all API requests (exclude sensitive data)

---

## Support Contact

**Frontend Team Lead:** [Your Name]
**Email:** [your-email@company.com]

For questions about data format or integration issues, contact the frontend team.

---

## Version History

- **v1.0** (2025-11-13) - Initial API specification

---

**Next Steps:**
1. Backend team implements three endpoints
2. Backend team provides base URL and credentials
3. Frontend team updates axios calls
4. Integration testing
5. Production deployment