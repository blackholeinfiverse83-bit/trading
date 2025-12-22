# Backend API Integration Guide

## 🔌 API Service Created

All mock data has been removed and replaced with real API calls to your backend server.

### API Configuration

**Base URL**: `http://localhost:8002`

**Location**: `/src/services/api.ts`

---

## 📡 Available Endpoints

### 1. Health Check
```typescript
GET /tools/health
```
**Usage**: Check if backend is running

---

### 2. Status Check
```typescript
GET /api/status
```
**Usage**: Get API status

---

### 3. Predict
```typescript
POST /tools/predict
Body: {
  symbols: string[],
  horizon: string  // 'intraday' | 'short' | 'medium'
}
```
**Used in**: `LivePredictionsFeed.tsx`
**Response Expected**:
```typescript
{
  predictions: [
    {
      symbol: string,
      direction: 'long' | 'short',
      confidence: number,  // 0-100
      entry_price: number,
      timestamp: string,
      timeframe: string
    }
  ]
}
```

---

### 4. Scan All
```typescript
POST /tools/scan_all
Body: {
  symbols: string[],
  horizon: string  // 'intraday' | 'short' | 'medium'
}
```
**Used in**: `MarketPage.tsx` (if manually integrated)
**Response Expected**:
```typescript
{
  results: [
    {
      symbol: string,
      name: string,
      price: number,
      change: number,
      change_percent: number,
      volume: string
    }
  ]
}
```

---

### 5. Analyze
```typescript
POST /tools/analyze
Body: {
  symbol: string,
  horizons: string[]  // ['intraday', 'short', 'medium']
}
```
**Used in**: `TradingChart.tsx`
**Response Expected**:
```typescript
{
  symbol: string,
  horizons: {
    intraday: {
      price_data: [
        {
          time: string,
          open: number,
          high: number,
          low: number,
          close: number,
          volume: number
        }
      ],
      indicators: {
        rsi: number,
        macd: number,
        bollinger: string
      }
    }
  }
}
```

---

### 6. Confirm Trade
```typescript
POST /tools/confirm
Body: {
  stopLoss: number,
  targetProfit: number,
  amount: number,
  riskMode: boolean
}
```
**Used in**: `InputPanel.tsx`
**Response Expected**:
```typescript
{
  success: boolean,
  trade_id?: string,
  message: string
}
```

---

### 7. Chat Query
```typescript
POST /chat/query
Body: {
  message: string
}
```
**Used in**: `ChatPanel.tsx`
**Response Expected**:
```typescript
{
  message: string,
  timestamp: string
}
```

---

## 🔄 Component Integration Status

| Component | Endpoint | Status | Auto-Refresh |
|-----------|----------|--------|--------------|
| LivePredictionsFeed | `/tools/predict` | ✅ Integrated | 30 seconds |
| ExecutionConsole | N/A | ⚠️ Mock data | - |
| InputPanel | `/tools/confirm` | ✅ Integrated | On submit |
| ChatPanel | `/chat/query` | ✅ Integrated | On send |
| TradingChart | `/tools/analyze` | ✅ Integrated | On change |
| MarketPage | `/tools/scan_all` | 📝 Manual edit needed | - |
| PortfolioPage | Custom endpoint | 📝 Manual edit needed | - |

---

## ⚠️ Error Handling

All components now include:

1. **Loading States**: Shows spinner while fetching data
2. **Error States**: Shows error message with backend connection hint
3. **Graceful Degradation**: Displays helpful messages when backend is offline

Example error UI:
```
❌ Failed to load predictions
Make sure backend is running on http://localhost:8002
```

---

## 🚀 How to Use

### Step 1: Start Your Backend
```bash
cd /path/to/backend
python server.py  # or python api_server.py
```

Make sure it's running on **port 8002**.

### Step 2: Start Frontend
```bash
npm run dev
```

### Step 3: Test Connection

The dashboard will automatically:
- Fetch live predictions
- Load chart data when changing symbols/timeframes
- Send chat messages to AI
- Confirm trade parameters

---

## 🔧 Customizing Base URL

If your backend runs on a different port, edit `/src/services/api.ts`:

```typescript
const BASE_URL = 'http://localhost:YOUR_PORT';
```

Or add environment variable support:

```typescript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';
```

Then create `.env` file:
```
VITE_API_URL=http://localhost:8002
```

---

## 📊 Data Flow

```
Frontend Component
    ↓
apiService.method()
    ↓
Axios POST/GET
    ↓
Backend (localhost:8002)
    ↓
Response
    ↓
Transform Data
    ↓
Update State
    ↓
Render UI
```

---

## 🐛 Debugging Tips

### Check Network Tab
Open DevTools > Network to see API calls:
- Request URL
- Request payload
- Response status
- Response data

### Console Logs
All API errors are logged to console:
```javascript
console.error('API Error:', error);
```

### Test Backend Directly
Use your test scripts:
```bash
python test_endpoints.py
python test_mongo.py
```

---

## 📝 Adding New Endpoints

1. **Add to `/src/services/api.ts`**:
```typescript
export const apiService = {
  // ... existing methods
  
  async yourNewEndpoint(params: any) {
    const response = await api.post('/your/endpoint', params);
    return response.data;
  }
};
```

2. **Use in component**:
```typescript
import { apiService } from '../src/services/api';

const data = await apiService.yourNewEndpoint({ ... });
```

---

## ⚡ Performance Considerations

- **Auto-refresh intervals**:
  - LivePredictionsFeed: 30 seconds
  - MarketPage: 60 seconds (if integrated)
  
- **Request timeout**: 10 seconds
- **Error retry**: Not implemented (add if needed)

---

## 🔐 Future Enhancements

1. **Authentication**: Add token-based auth
2. **WebSocket**: Real-time updates instead of polling
3. **Caching**: Cache responses to reduce API calls
4. **Request queuing**: Prevent duplicate requests
5. **Retry logic**: Auto-retry failed requests

---

## 📞 Backend Team Notes (Krishna)

### Expected Response Formats

Please ensure your endpoints return data in these formats for seamless integration.

### Error Responses

Return errors in this format:
```json
{
  "error": true,
  "message": "Error description here"
}
```

### Success Responses

Return success data directly or with a wrapper:
```json
{
  "success": true,
  "data": { ... }
}
```

---

## ✅ Testing Checklist

- [ ] Backend running on port 8002
- [ ] `/tools/health` returns 200 OK
- [ ] `/tools/predict` returns predictions array
- [ ] `/tools/analyze` returns price_data
- [ ] `/tools/confirm` handles trade parameters
- [ ] `/chat/query` returns AI responses
- [ ] Error messages display correctly
- [ ] Loading states show during fetch
- [ ] Auto-refresh works

---

**Last Updated**: December 18, 2025  
**API Version**: v1.0  
**Frontend**: React + TypeScript + Axios  
**Backend**: FastAPI (Python) on port 8002
