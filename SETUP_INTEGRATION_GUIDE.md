# Trading Hub - Setup & Integration Guide

## 📋 Prerequisites

- Node.js 16+ installed
- Python 3.8+ with required packages
- Backend API server running
- Supabase account configured

## 🔧 Setup Instructions

### Step 1: Backend Setup

#### Ensure API Endpoints are Running
```bash
cd backend
python api_server.py
```

The following endpoints must be available:
- `POST /api/tools/predict` - Generate predictions
- `POST /api/tools/scan_all` - Scan multiple symbols
- `GET /api/market/search` - Search stocks
- `POST /api/trades/place-order` - Execute trades

#### Backend Dependencies
```python
# Ensure these are installed in backend/requirements.txt
fastapi>=0.100.0
pydantic>=2.0.0
python-multipart>=0.0.6
psutil>=5.9.0
```

### Step 2: Frontend Setup

#### Install Dependencies
```bash
cd trading-dashboard
npm install
```

#### Import New Components
The routing is already configured. Verify in `src/routes.tsx`:

```tsx
import TradingHubPage from './pages/TradingHubPage';

// In routes:
<Route path="/" element={<ProtectedRoute element={<TradingHubPage />} />} />
<Route path="/trading-hub" element={<ProtectedRoute element={<TradingHubPage />} />} />
```

#### Add Styles to Global CSS
In `src/index.css`, ensure imports exist:

```css
/* Already included in components */
@import './components/styles/TradingPanel.css';
@import './components/styles/MarketScanner.css';
@import './components/styles/RiskCalculator.css';
@import './styles/TradingHub.css';
```

### Step 3: Start the Application

#### Terminal 1 - Start Backend
```bash
cd backend
python api_server.py
# Runs on http://localhost:8000
```

#### Terminal 2 - Start Frontend
```bash
cd trading-dashboard
npm run dev
# Runs on http://localhost:5173
```

#### Terminal 3 (Optional) - Start Backend Watchdog
```bash
cd backend
python server_watchdog.py
```

## 🔌 API Integration Checklist

### Required Endpoints

#### 1. Market Search
- **Endpoint**: `GET /api/market/search`
- **Status**: ✅ Implement or mock
- **Expected Response**:
```json
{
  "results": [
    {
      "symbol": "AAPL",
      "price": 150.25,
      "change": 2.50,
      "changePercent": 1.69,
      "volume": 52000000,
      "marketCap": "2.4T",
      "pe": 28.5
    }
  ]
}
```

#### 2. Predictions
- **Endpoint**: `POST /api/tools/predict`
- **Status**: ✅ Existing (verify working)
- **Expected Response**:
```json
{
  "predictions": {
    "AAPL": {
      "expected_return": 0.05,
      "confidence": 0.75,
      "recommendation": "BUY"
    }
  }
}
```

#### 3. Market Scan
- **Endpoint**: `POST /api/tools/scan_all`
- **Status**: ✅ Existing (verify working)
- **Expected Response**:
```json
{
  "results": {
    "AAPL": {
      "current_price": 150.25,
      "change": 2.50,
      "change_percent": 1.69,
      "recommendation": "BUY",
      "confidence": 0.85,
      "risk_reward_ratio": 2.5,
      "technical_score": 0.78
    }
  }
}
```

#### 4. Place Order
- **Endpoint**: `POST /api/trades/place-order`
- **Status**: ⚠️ Needs implementation
- **Implementation Guide**:

```python
# In backend/api_server.py
from fastapi import FastAPI

@app.post("/api/trades/place-order")
async def place_order(
    request: Request,
    order_data: PlaceOrderRequest,
    client_ip: str = Depends(check_rate_limit),
    current_user: dict = Depends(get_current_user)
):
    """
    Place a buy/sell order with risk parameters
    
    Args:
        order_data: {
            "symbol": str,
            "type": "buy" | "sell",
            "quantity": int,
            "price": float,
            "stopLoss": float,
            "target": float
        }
    
    Returns: {
        "orderId": str,
        "status": "placed" | "pending" | "executed",
        "message": str,
        "riskAmount": float,
        "potentialProfit": float
    }
    """
    try:
        # Validate inputs
        if order_data.quantity <= 0:
            raise ValueError("Quantity must be positive")
        
        if order_data.type not in ['buy', 'sell']:
            raise ValueError("Invalid order type")
        
        # Calculate risk
        risk_amount = abs(order_data.price - order_data.stopLoss) * order_data.quantity
        potential_profit = abs(order_data.target - order_data.price) * order_data.quantity
        
        # Validate risk
        max_risk = 1000  # or calculate from user's account
        if risk_amount > max_risk:
            raise ValueError(f"Risk exceeds limit: {risk_amount}")
        
        # Store order (implement database integration)
        order_id = generate_order_id()
        
        # Log order
        log_order(current_user['id'], order_data, order_id)
        
        return {
            "orderId": order_id,
            "status": "placed",
            "message": f"Order placed successfully",
            "riskAmount": risk_amount,
            "potentialProfit": potential_profit
        }
    
    except Exception as e:
        logger.error(f"Order placement error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
```

### Implementation Checklist

- [ ] Market Search endpoint created/mocked
- [ ] Predictions endpoint verified
- [ ] Market Scan endpoint verified
- [ ] Place Order endpoint created
- [ ] All endpoints have proper error handling
- [ ] Rate limiting configured
- [ ] CORS headers configured
- [ ] Authentication on all endpoints
- [ ] Input validation on all endpoints

## 🧪 Testing the Integration

### 1. Test Market Search
```bash
curl -X GET "http://localhost:8000/api/market/search?q=AAPL" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Test Predictions
```bash
curl -X POST "http://localhost:8000/api/tools/predict" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "symbols": ["AAPL"],
    "horizon": "intraday",
    "risk_profile": "moderate"
  }'
```

### 3. Test Market Scan
```bash
curl -X POST "http://localhost:8000/api/tools/scan_all" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "symbols": ["AAPL", "MSFT", "GOOGL"],
    "horizon": "intraday",
    "min_confidence": 0.5,
    "stop_loss_pct": 2
  }'
```

### 4. Test Order Placement
```bash
curl -X POST "http://localhost:8000/api/trades/place-order" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "symbol": "AAPL",
    "type": "buy",
    "quantity": 10,
    "price": 150.25,
    "stopLoss": 148.25,
    "target": 155.50
  }'
```

## 🛠️ Troubleshooting

### Issue: Components Not Loading
**Solution**: 
1. Check import paths in routes.tsx
2. Verify CSS files are in correct locations
3. Clear browser cache: Ctrl+Shift+Delete

### Issue: API Calls Failing
**Solution**:
1. Verify backend is running: `curl http://localhost:8000/docs`
2. Check CORS configuration
3. Verify authentication tokens
4. Check browser console for errors

### Issue: Styling Looks Wrong
**Solution**:
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Rebuild CSS: `npm run build`
3. Check CSS import order

### Issue: Performance Issues
**Solution**:
1. Enable Redux DevTools to check state
2. Use React DevTools profiler
3. Check API response times
4. Optimize images and assets

## 📊 Environment Variables

Create `.env` file in frontend root:
```
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_MAX_SCAN_SYMBOLS=50
VITE_ENABLE_MOCK_DATA=false
```

Create `.env` file in backend root:
```
BACKEND_PORT=8000
DEBUG_MODE=false
ENABLE_AUTH=true
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

## 🚀 Production Deployment

### Frontend Build
```bash
cd trading-dashboard
npm run build
# Output: dist/ folder
# Deploy to Vercel, Netlify, or your server
```

### Backend Production
```bash
# Use gunicorn or similar
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 api_server:app

# Or use Docker
docker build -t trading-api .
docker run -p 8000:8000 trading-api
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [TradingView API Reference](https://www.tradingview.com/pine-script-docs/)
- [Backend README](./backend/README.md)

## ✅ Final Verification

Before considering setup complete:

- [ ] Frontend loads without errors
- [ ] Login page accessible
- [ ] Trading Hub page loads
- [ ] Search bar returns results
- [ ] Market Scanner displays results
- [ ] Risk Calculator updates in real-time
- [ ] All buttons are responsive
- [ ] Mobile layout works correctly
- [ ] Network requests visible in DevTools
- [ ] No console errors

## 📞 Support

For detailed component documentation, see:
- [Trading Hub Documentation](./TRADING_HUB_DOCUMENTATION.md)
- Component JSDoc comments
- Backend API documentation at `/docs` endpoint
