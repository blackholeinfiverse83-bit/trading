# `/tools/analyze` Endpoint - Comprehensive Study

## 📋 Overview
The `/tools/analyze` endpoint is a **POST** request that analyzes custom stocks with advanced **risk parameters**. It provides detailed predictions across multiple time horizons with personalized risk management settings.

---

## 🔧 API Specification

### Endpoint Details
- **URL:** `/tools/analyze`
- **Method:** `POST`
- **Authentication:** NO AUTH REQUIRED (Open Access)
- **Rate Limiting:** Yes (500 req/min, 10000 req/hour)

### Request Schema

```json
{
  "symbol": "string",
  "horizons": ["string"],
  "stop_loss_pct": number,
  "capital_risk_pct": number,
  "drawdown_limit_pct": number
}
```

### Request Parameters

| Field | Type | Required | Default | Min | Max | Description |
|-------|------|----------|---------|-----|-----|-------------|
| `symbol` | string | Yes | - | 1 char | 20 chars | Stock ticker symbol (e.g., "AAPL", "MSFT.NS") |
| `horizons` | array | No | ["intraday"] | 1 item | 3 items | Time horizons for analysis: "intraday", "medium_term", "long_term" |
| `stop_loss_pct` | float | No | 2.0 | 0.1% | 50.0% | Stop-loss percentage for risk management |
| `capital_risk_pct` | float | No | 1.0 | 0.1% | 100.0% | Percentage of capital at risk per trade |
| `drawdown_limit_pct` | float | No | 5.0 | 0.1% | 100.0% | Maximum drawdown tolerance |

### Response Schema

```typescript
{
  symbol: string;
  predictions: PredictionItem[];
  metadata?: {
    consensus?: string;        // "LONG" | "SHORT" | "HOLD"
    average_confidence?: number; // 0.0 - 1.0
    horizons?: string[];
    [key: string]: unknown;
  };
  error?: string;
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `symbol` | string | The analyzed stock ticker |
| `predictions` | array | Array of predictions for each horizon |
| `metadata.consensus` | string | Overall recommendation: LONG, SHORT, or HOLD |
| `metadata.average_confidence` | number | Confidence level (0.0-1.0) for the consensus |
| `metadata.horizons` | array | Time horizons used in analysis |
| `error` | string | Error message if request failed |

---

## 📊 Example Usage

### Frontend Implementation

```typescript
// From MarketScanPage.tsx
const handleAnalyze = async (symbol: string) => {
  try {
    setLoading(true);
    setError(null);
    
    // Call analyze with risk parameters
    const response = await stockAPI.analyze(
      symbol, 
      [horizon],  // horizons array
      2.0,        // stop_loss_pct (default)
      1.0,        // capital_risk_pct (default)
      5.0         // drawdown_limit_pct (default)
    );
    
    setAnalyzeResults(response);
    console.log('Analysis Results:', response);
  } catch (err) {
    console.error('Analyze failed:', err);
    setError(err.message || 'Failed to analyze stock');
    setAnalyzeResults(null);
  }
};
```

### cURL Example

```bash
curl -X POST http://127.0.0.1:8000/tools/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "horizons": ["intraday", "medium_term"],
    "stop_loss_pct": 2.0,
    "capital_risk_pct": 1.0,
    "drawdown_limit_pct": 5.0
  }'
```

### Python Example

```python
import requests

response = requests.post(
    'http://127.0.0.1:8000/tools/analyze',
    json={
        'symbol': 'AAPL',
        'horizons': ['intraday', 'medium_term'],
        'stop_loss_pct': 2.0,
        'capital_risk_pct': 1.0,
        'drawdown_limit_pct': 5.0
    }
)

data = response.json()
print(f"Consensus: {data['metadata']['consensus']}")
print(f"Confidence: {data['metadata']['average_confidence']}")
```

---

## 🛡️ Input Validation

### Symbol Validation
- ✅ Converted to uppercase automatically
- ✅ Whitespace trimmed
- ✅ Length: 1-20 characters
- ✅ Not empty after trimming

### Horizons Validation
- ✅ Array with 1-3 items
- ✅ Valid values: "intraday", "medium_term", "long_term"
- ✅ Duplicate horizons removed

### Risk Parameters Validation
- ✅ `stop_loss_pct`: 0.1% - 50.0%
- ✅ `capital_risk_pct`: 0.1% - 100.0%
- ✅ `drawdown_limit_pct`: 0.1% - 100.0%

---

## 🎯 Frontend Integration

### Used In:
- **MarketScanPage.tsx** ✅ (Active)
  - Button: "Analyze" on search results
  - Displays: Consensus, Confidence, Risk Parameters
  - Shows: Detailed predictions for each horizon

### Flow:
1. User enters stock symbol in search
2. User clicks "Analyze" button
3. Frontend calls `/tools/analyze` with symbol + default risk params
4. Backend returns predictions + metadata
5. UI displays:
   - 🔵 **Consensus** (LONG/SHORT/HOLD)
   - 📊 **Confidence** (percentage)
   - 📈 **Predictions** by horizon
   - ⚠️ **Risk Parameters** used

---

## 📈 Response Status Codes

| Code | Status | Description |
|------|--------|-------------|
| **200** | Success | Analysis completed successfully |
| **400** | Bad Request | Invalid symbol or parameters |
| **422** | Validation Error | Malformed request or parameter validation failed |
| **500** | Server Error | Backend processing error |

### Error Response (422)
```json
{
  "detail": [
    {
      "loc": ["body", "stop_loss_pct"],
      "msg": "ensure this value is greater than or equal to 0.1",
      "type": "value_error.number.not_ge"
    }
  ]
}
```

---

## 🔒 Backend Implementation

### Route Handler (api_server.py:491)
```python
@app.post("/tools/analyze")
async def analyze(
    request: Request,
    analyze_data: AnalyzeRequest,
    client_ip: str = Depends(check_rate_limit)
):
    """Analyze custom tickers with risk parameters (NO AUTH REQUIRED)"""
```

### Processing Steps:
1. **Input Sanitization** - Clean/normalize input
2. **Symbol Validation** - Check validity
3. **Horizons Validation** - Verify time horizons
4. **Risk Validation** - Check parameter ranges
5. **MCP Analysis** - Call adapter.analyze()
6. **Logging** - Log request/response for audit
7. **Response Return** - Send predictions + metadata

---

## 💡 Key Features

### ✅ Risk Management Parameters
- **Stop Loss %**: Automatic exit if loss exceeds percentage
- **Capital Risk %**: Max percentage of portfolio at risk
- **Drawdown Limit %**: Max acceptable peak-to-trough loss

### ✅ Multi-Horizon Analysis
- **Intraday**: Short-term trading (hours)
- **Medium-term**: Weeks to months
- **Long-term**: Months to years

### ✅ Consensus & Confidence
- Aggregates multiple model predictions
- Provides confidence score (0-1)
- Returns overall recommendation

---

## 📱 Frontend UI Components

### MarketScanPage.tsx
- **Result Display**: Card showing consensus + confidence
- **Risk Info**: Shows applied risk parameters
- **Predictions**: Detailed breakdown by horizon

### Example Output:
```
Consensus: LONG ✓
Confidence: 78.5%
Models Agreement: 3 out of 4

Intraday: LONG (82%)
Medium-term: HOLD (65%)
Long-term: LONG (88%)

Risk Parameters Applied:
- Stop Loss: 2.0%
- Capital Risk: 1.0%
- Drawdown Limit: 5.0%
```

---

## 🚀 Performance Characteristics

- **Timeout**: 30 seconds (long-running request)
- **Response Time**: 20-50ms typically
- **Rate Limits**: 500 requests/min, 10000/hour
- **Caching**: Uses cached data when available

---

## ⚡ Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend Endpoint | ✅ Working | Fully implemented and tested |
| Frontend Integration | ✅ Working | Active in MarketScanPage |
| API Validation | ✅ Complete | Full input validation |
| Documentation | ✅ Complete | Swagger/ReDoc available |
| Error Handling | ✅ Complete | Proper error responses |
| Rate Limiting | ✅ Enabled | 500/min, 10000/hour |

---

## 📚 Related Endpoints

- **POST /tools/predict** - Simple prediction for symbol
- **POST /tools/scan_all** - Scan multiple symbols
- **POST /tools/fetch_data** - Fetch historical data
- **POST /tools/train_rl** - Train RL agent
- **GET /tools/health** - Health check

---

## 🔗 Access Points

- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc
- **Frontend**: MarketScanPage.tsx (Analyze button)

---

## 📝 Notes

- ✅ No authentication required
- ✅ Supports global stocks (AAPL, MSFT) and Indian stocks (SBIN.NS, TCS.NS)
- ✅ Risk parameters are customizable per analysis
- ✅ Predictions use ensemble of 4 ML models
- ✅ Confidence scores help evaluate prediction reliability
