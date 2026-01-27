# Stop-Loss & Portfolio Management Quick Reference

## Overview
The Blackhole Infeverse Trading Dashboard includes comprehensive stop-loss management integrated with portfolio tracking and risk assessment. All features are fully operational and accessible through intuitive UI components.

---

## Stop-Loss Management

### How to Set a Stop-Loss

#### Method 1: From Market Scan Page
1. Navigate to **Market Scan** from the sidebar
2. Search for or chart a stock symbol
3. Once a chart is active, the **Stop-Loss Calculator** panel appears on the right
4. Enter:
   - **Entry Price:** Current or target entry price
   - **Capital:** Amount of capital for the position
   - **Risk %:** Percentage of capital you're willing to risk (default: 2%)
5. Click **Calculate Stop-Loss**
6. The panel shows:
   - Stop-Loss Price
   - Risk Amount ($)
   - Position Size
   - Risk Level (Safe/Warning/Danger)
7. Click **Set Stop-Loss** to confirm

#### Method 2: From Portfolio Page
1. Navigate to **Portfolio** from the sidebar
2. Add a new position or manage existing ones
3. When adding/removing positions, the system auto-calculates stop-loss:
   - BUY positions: Stop-loss = Current Price × 0.95 (5% below)
   - SELL positions: Stop-loss = Current Price × 1.05 (5% above)
4. Review the **Risk Assessment** modal
5. If risk score < 5.0 → Position approved
6. If risk score > 5.0 → Position blocked with warning

### Stop-Loss Parameters

**Valid Timeframes:**
- `1m, 5m, 15m, 30m` - Intraday trading
- `1h, 4h` - Swing trading
- `1d, 1w, 1mo` - Position trading

**Sides:**
- `BUY` - Long position stop-loss
- `SELL` - Short position stop-loss

**Sources:**
- `chart` - From technical analysis chart
- `manual` - Manually entered

**Risk Levels:**
- 🟢 **Safe:** Risk < 2% (Recommended)
- 🟡 **Warning:** Risk 2-5% (Acceptable)
- 🔴 **Danger:** Risk > 5% (Blocked automatically)

### API Endpoint

```
POST /api/risk/stop-loss
```

**Request:**
```json
{
  "symbol": "AAPL",
  "stop_loss_price": 150.00,
  "side": "BUY",
  "timeframe": "1h",
  "source": "manual"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stop loss set for AAPL at 150.0",
  "stop_loss": {
    "symbol": "AAPL",
    "price": 150.0,
    "side": "BUY",
    "timeframe": "1h",
    "source": "manual",
    "timestamp": "2026-01-27T17:30:00"
  }
}
```

---

## Portfolio Management

### Supported Stocks

#### US Stocks (10)
AAPL, GOOGL, MSFT, TSLA, META, AMZN, NVDA, AMD, INTC, NFLX

#### Indian Stocks (40+)
- **Banking & Finance:** SBIN.NS, AXISBANK.NS, ICICIBANK.NS, KOTAKBANK.NS, HDFC.NS, BAJAJFINSV.NS
- **IT & Tech:** TCS.NS, INFY.NS, WIPRO.NS, HCLTECH.NS, TECHM.NS
- **Automobiles:** TATAMOTORS.NS, M&M.NS, MARUTI.NS, BAJAJ-AUTO.NS, EICHERMOT.NS
- **Steel & Metal:** TATASTEEL.NS, JSWSTEEL.NS, HINDALCO.NS, NMDC.NS
- **Energy:** GAIL.NS, POWERGRID.NS, NTPC.NS, COAL.NS, BPCL.NS
- **Infrastructure:** ADANIPORTS.NS, ADANIGREEN.NS, ADANITRANS.NS, LT.NS
- **Consumer:** ASIANPAINT.NS, ULTRACEMCO.NS, SUNPHARMA.NS, NESTLEIND.NS, BRITANNIA.NS, HINDUNILVR.NS, ITC.NS

### Adding a Position

1. Go to **Portfolio** page
2. Click the **+ New Position** button
3. Search for a stock symbol (autocomplete available)
4. Enter:
   - **Shares:** Number of shares
   - **Average Price:** Entry price per share
5. Click **Add to Portfolio**
6. System will:
   - Calculate stop-loss (5% below entry)
   - Run risk assessment
   - Show confirmation modal
7. Click **Confirm** to add

### Removing a Position

1. Go to **Portfolio** page
2. Find the position in the list
3. Click the **Remove** button
4. System will:
   - Calculate stop-loss (5% above current price)
   - Run risk assessment
   - Show confirmation modal
5. Click **Confirm** to remove

### Risk Assessment

The system automatically runs risk assessment before any portfolio action:

**Risk Score Calculation:**
```
Risk Score = (Capital at Risk / Total Portfolio) × 100
```

**Maximum Allowed Risk:** 5.0
- Trades with risk > 5.0 are **automatically blocked**
- A warning message explains why
- You can reduce position size and try again

### Portfolio Calculations

**For Each Position:**
- **Position Value** = Shares × Current Price
- **Entry Value** = Shares × Average Price
- **P&L** = Position Value - Entry Value
- **P&L %** = (P&L / Entry Value) × 100

**Portfolio Totals:**
- **Total Value** = Sum of all position values
- **Total P&L** = Sum of all position P&L
- **Risk Score** = (Capital at Risk / Total Value) × 100

### Auto-Refresh

Portfolio data automatically refreshes every 120 seconds (2 minutes) to keep it up-to-date while respecting API rate limits.

---

## Risk Assessment Endpoint

### API Endpoint

```
POST /api/risk/assess
```

**Request:**
```json
{
  "symbol": "AAPL",
  "quantity": 100,
  "entry_price": 150.00,
  "stop_loss": 142.50,
  "risk_percent": 1.0
}
```

**Response:**
```json
{
  "success": true,
  "risk_score": 2.5,
  "risk_level": "safe",
  "capital_at_risk": "$750.00",
  "position_value": "$15,000.00",
  "reward_ratio": 2.5,
  "recommendation": "Safe to proceed"
}
```

---

## Page Navigation

### Main Navigation Routes

| Page | Path | Purpose |
|------|------|---------|
| Dashboard | `/` or `/dashboard` | Home page with overview |
| Market Scan | `/market-scan` | Chart analysis + stop-loss |
| Portfolio | `/portfolio` | Position management |
| Analytics | `/analytics` | Performance charts |
| Alerts | `/alerts` | Alert configuration |
| Watchlist | `/watchlist` | Tracked stocks |
| Settings | `/settings` | User preferences |
| Profile | `/profile` | User information |
| Train Model | `/train-model` | Model training |

### Navigation Features

1. **Sidebar Menu** - Quick access to all pages
2. **Search Bar** - Find stocks by symbol
3. **Asset Type Filter** - Switch between stocks/crypto/commodities
4. **Quick Navigation** - Links in dashboard components

### Page Redirects After Actions

- ✅ **After Login** → Dashboard (/)
- ✅ **After Add Position** → Portfolio (stays on page)
- ✅ **After Set Stop-Loss** → Market Scan (stays on page)
- ✅ **After Settings Change** → Settings (stays on page)
- ✅ **On Error** → Same page with error message

---

## System Status

### Backend API
- **URL:** http://localhost:8000
- **Status:** ✅ Running
- **Documentation:** http://localhost:8000/docs (Swagger UI)
- **Health Check:** GET http://localhost:8000/tools/health

### Frontend App
- **URL:** http://localhost:5173
- **Status:** ✅ Running
- **Connection:** ✅ Connected to backend
- **Hot Reload:** ✅ Enabled

### API Rate Limits
- **Per Minute:** 500 requests
- **Per Hour:** 10,000 requests
- **Status:** Current usage within limits

---

## Troubleshooting

### Stop-Loss Panel Not Appearing
- ✅ Ensure you're on the Market Scan page
- ✅ Make sure a chart is active (search for a symbol)
- ✅ The panel should appear on the right side

### Portfolio Showing Empty
- ✅ Click "Refresh Portfolio" to reload data
- ✅ Check if you've added any positions
- ✅ Ensure backend is running (check http://localhost:8000/tools/health)

### Risk Assessment Failed
- ✅ Check if all required fields are filled
- ✅ Verify the symbol is valid
- ✅ Ensure backend is responding (http://localhost:8000/)

### Cannot Connect to Backend
- ✅ Verify backend is running: `python api_server.py`
- ✅ Check backend port: Should be 8000
- ✅ Verify frontend config: Should use `http://localhost:8000`
- ✅ Check CORS headers in responses

---

## Quick Commands

### Start Backend
```bash
cd backend
.\venv\Scripts\python.exe api_server.py
```

### Start Frontend
```bash
cd trading-dashboard
npm run dev
```

### Check Backend Status
```bash
curl http://localhost:8000/tools/health
```

### View API Documentation
Open browser: `http://localhost:8000/docs`

### View Frontend App
Open browser: `http://localhost:5173`

---

## Key Features Verification ✅

- ✅ Stop-Loss Calculation
- ✅ Risk Assessment
- ✅ Portfolio Management
- ✅ Position Tracking
- ✅ P&L Calculation
- ✅ Auto-Refresh
- ✅ Error Handling
- ✅ Navigation
- ✅ API Integration
- ✅ Real-time Updates

---

**Last Updated:** January 27, 2026
**Version:** 4.0
**Status:** Production Ready
