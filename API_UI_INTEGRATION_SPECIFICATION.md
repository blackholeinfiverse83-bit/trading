# 🔗 API-UI INTEGRATION SPECIFICATION

**Status:** Detailed Integration Plan Ready for Implementation  
**Date:** January 21, 2026  
**Priority:** Risk Visibility First

---

## 📋 Executive Summary

This document maps every FastAPI endpoint to specific UI components with clear integration points, data flows, and user feedback mechanisms. The goal is seamless data flow from API to UI with explicit error handling and success confirmation for every user action.

---

## 🎯 Endpoint-to-Component Integration Map

### 1. AUTHENTICATION ENDPOINTS
**⚙️ Backend Paths:** `/auth/login`, `/auth/logout`, `/auth/status`

#### 1.1 `/auth/login` (POST)
**UI Location:** [UserProfilePage.tsx](trading-dashboard/src/pages/UserProfilePage.tsx) - Top-right profile section

**Integration Points:**
```tsx
// LoginPage.tsx - Initial login
POST /auth/login
Request Body: { username: string, password: string }
Response: { success: boolean, username: string, token: string }

Actions on Success:
  1. Store token in localStorage (AuthContext)
  2. Trigger full UI refresh:
     - Load user profile data
     - Fetch all holdings/positions
     - Update dashboard statistics
     - Show success toast: "Welcome back, [username]!"

Actions on Failure:
  3. Display error toast: "Login failed: [error message]"
  4. Clear any partial auth state
  5. Keep user on login page
```

**Component Changes Required:**
- [x] AuthContext.tsx - Add token storage/management
- [x] LoginPage.tsx - Handle login response
- [ ] Layout.tsx - Trigger refresh after login
- [ ] Add login success handling to DashboardPage.tsx

**UI Feedback:**
- Success: Green toast "Login successful! Refreshing dashboard..."
- Failure: Red toast with specific error (e.g., "Invalid credentials")
- Loading: Disable login button, show spinner

---

#### 1.2 `/auth/logout` (GET)
**UI Location:** [UserProfilePage.tsx](trading-dashboard/src/pages/UserProfilePage.tsx) - Profile dropdown menu

**Integration Points:**
```tsx
// UserProfilePage.tsx - Logout button
GET /auth/logout
Response: { success: boolean, message: string }

Actions on Success:
  1. Clear token from localStorage
  2. Clear all app state:
     - Holdings = []
     - Trades = []
     - Risk assessments = {}
     - Watchlist = []
  3. Close any open modals
  4. Redirect to /login
  5. Show success toast: "Logged out successfully"

Actions on Failure:
  6. Show error toast: "Logout failed, try again"
  7. Still redirect to login after 2 seconds
```

**Component Changes Required:**
- [ ] Add logout button with confirmation to UserProfilePage.tsx
- [ ] Update AuthContext to clear all state
- [ ] Add route protection in routes.tsx
- [ ] Show confirmation modal before logout

**UI Feedback:**
- Confirmation: Modal - "Are you sure you want to logout?"
- Success: Toast + redirect animation
- Failure: Toast with error, manual redirect option

---

#### 1.3 `/auth/status` (GET)
**UI Location:** Not directly displayed, used by Navbar for rate limit info

**Integration Points:**
```tsx
// Internal use in Navbar.tsx
GET /auth/status
Response: {
  rate_limit_remaining: number,
  rate_limit_reset: timestamp,
  ip_address: string
}

Usage:
- Monitor rate limits
- Warn user if approaching limit
- Show in Settings page → API Usage section
```

---

### 2. HEALTH & STATUS ENDPOINTS
**⚙️ Backend Path:** `/tools/health`

#### 2.1 `/tools/health` (GET) - System Status Indicator
**UI Location:** [Sidebar.tsx](trading-dashboard/src/components/Sidebar.tsx) - Bottom status indicator

**Integration Points:**
```tsx
// Sidebar.tsx - Auto-updating health status
GET /tools/health
Response: {
  status: 'healthy' | 'unhealthy' | 'degraded',
  timestamp: ISO timestamp,
  system: {
    cpu_usage_percent: number,
    memory_used_gb: number,
    disk_free_gb: number
  },
  models: { available: boolean, total_trained: number }
}

Auto-update Mechanism:
- Fetch every 30 seconds (configurable)
- Update status indicator color:
  GREEN → status = 'healthy' (cpu < 80%, memory available > 1GB)
  YELLOW → status = 'degraded' (cpu < 95%, memory available > 500MB)
  RED → status = 'unhealthy' (offline or critical resources)
- No manual refresh needed (automatic polling)
- Show tooltip on hover: "API Server: [status] | Last updated: [time]"
```

**Component Changes Required:**
- [x] Sidebar.tsx - Add health status indicator
- [ ] Create useHealthCheck hook for auto-polling
- [ ] Add health status context or state
- [ ] Update color logic based on resource usage

**UI Feedback:**
- Green dot (pulsing) = Healthy
- Yellow dot = Degraded
- Red dot = Down
- Tooltip shows detailed system info
- Gray = Unable to fetch (network issue)

**Code Location for Implementation:**
```tsx
// Add to Sidebar.tsx
const [healthStatus, setHealthStatus] = useState({
  status: 'unknown',
  cpu: 0,
  memory: 0
});

// useEffect for polling
useEffect(() => {
  const interval = setInterval(async () => {
    const health = await fetch('/tools/health').then(r => r.json());
    setHealthStatus({
      status: health.status,
      cpu: health.system.cpu_usage_percent,
      memory: health.system.memory_percent
    });
  }, 30000); // 30 second poll
  
  return () => clearInterval(interval);
}, []);
```

---

### 3. PREDICTION ENDPOINTS
**⚙️ Backend Paths:** `/tools/predict`, `/tools/scan_all`

#### 3.1 `/tools/predict` (POST) - Market Scan Page
**UI Location:** [MarketScanPage.tsx](trading-dashboard/src/pages/MarketScanPage.tsx) - Main search & results

**Integration Points:**
```tsx
// MarketScanPage.tsx - When user searches for symbols
POST /tools/predict
Request Body: {
  symbols: string[],           // e.g., ["AAPL", "TSLA", "SBIN.NS"]
  horizon: 'intraday' | 'short' | 'long',
  risk_profile?: 'conservative' | 'moderate' | 'aggressive'
}

Response: {
  symbol: string,
  prediction: 'BUY' | 'SELL' | 'HOLD',
  confidence: number (0-1),
  price_target: number,
  support_level: number,
  resistance_level: number,
  entry_point: number,
  risk_reward_ratio: number
}

User Flow:
1. User types symbol in search bar → calls /tools/predict
2. Display results in card format below search:
   ┌─────────────────────────────────────┐
   │ AAPL - Apple Inc.                   │
   │ Prediction: BUY (85% confidence)   │
   │ Price Target: $185.50              │
   │ Support: $170 | Resistance: $195   │
   │ R:R Ratio: 1:3 | Entry: $178.90   │
   │ [View Details] [Add to Watchlist] │
   └─────────────────────────────────────┘

3. User can click [Add to Watchlist] or [Add Position]
4. Risk assessment happens on position addition
```

**Component Changes Required:**
- [ ] Create PredictionCard component for individual prediction display
- [ ] Update MarketScanPage to call /tools/predict on search
- [ ] Add loading state while fetching predictions
- [ ] Add error handling and retry logic
- [ ] Display confidence color-coded (green > 80%, yellow 50-80%, red < 50%)

**Data Display Format:**
```tsx
// Prediction Card Example
<div className="prediction-card">
  <div className="symbol-header">
    <h3>{prediction.symbol}</h3>
    <span className={`signal ${prediction.prediction.toLowerCase()}`}>
      {prediction.prediction}
    </span>
  </div>
  <div className="confidence">
    <ProgressBar value={prediction.confidence * 100} />
    <span>{(prediction.confidence * 100).toFixed(0)}%</span>
  </div>
  <div className="levels">
    <Grid cols={3}>
      <div>
        <label>Target Price</label>
        <strong>${prediction.price_target.toFixed(2)}</strong>
      </div>
      <div>
        <label>Support</label>
        <strong>${prediction.support_level.toFixed(2)}</strong>
      </div>
      <div>
        <label>Resistance</label>
        <strong>${prediction.resistance_level.toFixed(2)}</strong>
      </div>
    </Grid>
  </div>
  <div className="risk-reward">
    <span>R:R Ratio: {prediction.risk_reward_ratio}</span>
  </div>
</div>
```

**UI Feedback:**
- Loading: Spinner with "Fetching predictions..."
- Success: Show prediction cards with color-coded signals
- Failure: Red error message "Failed to fetch predictions: [reason]"
- Empty: "No results found for [symbol]"

---

#### 3.2 `/tools/scan_all` (POST) - Bulk Market Scan
**UI Location:** [MarketScanPage.tsx](trading-dashboard/src/pages/MarketScanPage.tsx) - Scan button or Market Overview

**Integration Points:**
```tsx
// MarketScanPage.tsx - "Scan All Markets" button
POST /tools/scan_all
Request Body: {
  symbols: string[],           // Multiple symbols
  horizon: 'intraday' | 'short' | 'long',
  min_confidence: number,      // Minimum confidence threshold (0.5-1.0)
  stop_loss_pct?: number,
  capital_risk_pct?: number
}

Response: {
  predictions: [{symbol, prediction, confidence, ...}, ...],
  summary: {
    buy_count: number,
    sell_count: number,
    hold_count: number,
    avg_confidence: number
  },
  ranked: [{symbol, score: number}, ...]
}

User Flow:
1. Click "Scan Markets" button
2. Show loading dialog with progress
3. Display ranked results table:
   │ Rank │ Symbol │ Signal │ Confidence │ R:R Ratio │ Action │
   │──────┼────────┼────────┼────────────┼───────────┼────────│
   │ 1.   │ AAPL   │ BUY    │ 89%        │ 1:3.2     │ [+]    │
   │ 2.   │ MSFT   │ HOLD   │ 72%        │ 1:2.1     │ [+]    │
   │ 3.   │ TSLA   │ SELL   │ 85%        │ 1:4.5     │ [+]    │
4. User can filter by signal type (BUY only, etc.)
5. User can add multiple to watchlist/positions
```

**Component Changes Required:**
- [ ] Add "Scan Markets" button to MarketScanPage
- [ ] Create ScanResultsTable component for displaying ranked predictions
- [ ] Add filtering options (by signal, confidence threshold)
- [ ] Add bulk add-to-watchlist functionality
- [ ] Show summary statistics above table

**UI Feedback:**
- Loading: Progress bar "Scanning 50 symbols..."
- Success: Show table + summary cards (X BUY | Y SELL | Z HOLD)
- Failure: "Scan failed: [reason]. Retry?" button
- Empty: "No symbols met the confidence threshold"

---

### 4. ANALYTICS ENDPOINTS
**⚙️ Backend Paths:** `/tools/analyze`, `/tools/compare_all`

#### 4.1 `/tools/analyze` (POST) - Single Symbol Deep Dive
**UI Location:** [AnalyticsPage.tsx](trading-dashboard/src/pages/AnalyticsPage.tsx) - Main analysis view

**Integration Points:**
```tsx
// AnalyticsPage.tsx - When user selects a symbol
POST /tools/analyze
Request Body: {
  symbol: string,
  horizons: ['intraday', 'short', 'long'],
  risk_parameters: {
    stop_loss_pct: number,
    capital_at_risk: number,
    max_position_size: number
  }
}

Response: {
  symbol: string,
  analysis: {
    technical: {trends, support_resistance, indicators},
    fundamental: {earnings, pe_ratio, growth},
    sentiment: {market_sentiment, news_count}
  },
  predictions_by_horizon: {
    intraday: {signal, confidence, targets},
    short: {...},
    long: {...}
  },
  risk_metrics: {
    volatility: number,
    sharpe_ratio: number,
    max_drawdown: number
  }
}

Display Format:
┌──────────────────────────────────────────┐
│ AAPL - In-depth Analysis                 │
├──────────────────────────────────────────┤
│ Technical Analysis:                      │
│ ├─ Trend: UPTREND (Strong)              │
│ ├─ Support: $170.00                     │
│ ├─ Resistance: $195.00                  │
│ └─ Indicators: RSI=72, MACD=positive   │
│                                          │
│ Predictions (Multi-Horizon):             │
│ ├─ Intraday: BUY (88%)  → $180.50      │
│ ├─ Short: BUY (82%)    → $185.75      │
│ └─ Long: HOLD (65%)    → $200.00      │
│                                          │
│ Risk Metrics:                            │
│ ├─ Volatility: 2.3%                    │
│ ├─ Sharpe Ratio: 2.15                  │
│ └─ Max Drawdown: -8.5%                 │
│                                          │
│ [Add to Watchlist] [Set Alert] [Trade] │
└──────────────────────────────────────────┘
```

**Component Changes Required:**
- [ ] Add symbol selector/search in AnalyticsPage
- [ ] Create AnalysisCard component with tabs (Technical/Fundamental/Risk)
- [ ] Add multi-horizon comparison view
- [ ] Create risk metrics visualization (gauge or sparkline)
- [ ] Add action buttons (Add to Watchlist, Set Alert, Trade)

**UI Feedback:**
- Loading: "Analyzing AAPL..." with spinner
- Success: Display all analysis sections
- Failure: "Analysis failed: [reason]"
- Network timeout: "Request timed out, please retry"

---

#### 4.2 `/tools/compare_all` (POST) - Multi-Symbol Comparison
**UI Location:** [ComparePage.tsx](trading-dashboard/src/pages/ComparePage.tsx) - Side-by-side comparison

**Integration Points:**
```tsx
// ComparePage.tsx - User selects multiple symbols to compare
POST /tools/compare_all
Request Body: {
  symbols: string[],  // e.g., ["AAPL", "MSFT", "GOOGL"]
  metrics: [
    'price_trend',
    'volatility',
    'performance',
    'technical_score',
    'sentiment'
  ],
  time_range: '1M' | '3M' | '6M' | '1Y'
}

Response: {
  comparison: {
    symbols: [
      {
        symbol: 'AAPL',
        metrics: {price_trend: 5, volatility: 2.3, ...},
        ranking: 1,
        score: 85
      },
      ...
    ]
  },
  winner: 'AAPL',
  insights: ['AAPL has strongest momentum', ...]
}

Display Format (Table + Chart):
┌─────────────────────────────────────────┐
│ Symbol │ Trend │ Vol │ Perf │ Score      │
├─────────────────────────────────────────┤
│ AAPL   │ ↑↑    │ 2.3%│+12% │ ★★★★★ (85)│
│ MSFT   │ ↑     │ 1.8%│ +8% │ ★★★★☆ (78)│
│ GOOGL  │ ↑     │ 2.1%│ +5% │ ★★★☆☆ (72)│
└─────────────────────────────────────────┘

Chart (Line Chart):
- X-axis: Time periods
- Y-axis: Performance %
- 3 lines (one per symbol) with different colors
- Legend with ranking
```

**Component Changes Required:**
- [ ] Create ComparisonTable component
- [ ] Create ComparisonChart component (Recharts)
- [ ] Add multi-select symbol picker
- [ ] Add metric selector checkboxes
- [ ] Add time range selector
- [ ] Display winner badge + insights

**UI Feedback:**
- Loading: "Comparing [symbols]..."
- Success: Display table + chart + insights
- Failure: "Comparison failed: [reason]"
- Empty: "Select at least 2 symbols to compare"

---

### 5. RISK MANAGEMENT ENDPOINTS
**⚙️ Backend Paths:** `/api/risk/stop-loss`, `/api/risk/assess`

#### 5.1 `/api/risk/stop-loss` (POST) - Set Stop Loss
**UI Location:** [PortfolioPage.tsx](trading-dashboard/src/pages/PortfolioPage.tsx) - Risk panel on positions

**Integration Points:**
```tsx
// PortfolioPage.tsx - Click on position's "Set Stop Loss" button
POST /api/risk/stop-loss
Request Body: {
  symbol: string,           // e.g., "AAPL"
  stop_loss_price: number,  // e.g., 170.00
  side: 'BUY' | 'SELL',
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w',
  source: 'chart' | 'manual'
}

Response: {
  success: boolean,
  message: string,
  stop_loss: {
    symbol: string,
    price: number,
    set_at: timestamp
  }
}

User Flow:
1. User views position in portfolio
2. Clicks "Set Stop Loss" button
3. Modal opens with:
   - Current price: $185.50
   - Entry price: $180.00
   - Stop loss % selector: [1%] [2%] [3%] [5%] [Custom]
   - Stop loss price input: [170.00]
   - Risk amount display: $5.50 per share
   - Timeframe dropdown: [Select timeframe]
   - [Set] [Cancel] buttons
4. Click [Set] to submit
5. Success: Green toast "Stop loss set at $170.00"
6. Stop loss now shows inline on position:
   ├─ AAPL | Entry: $180 | Current: $185 | ⛔ Stop: $170
```

**Component Changes Required:**
- [ ] Create StopLossModal component
- [ ] Add "Set Stop Loss" button to each position row
- [ ] Display stop loss price inline with position
- [ ] Add % shortcut buttons (1%, 2%, 3%, 5%)
- [ ] Show risk amount calculated in real-time
- [ ] Update position display to show ⛔ stop loss indicator

**Stop Loss Display:**
```tsx
// Inline position with stop loss
<PositionRow>
  <Symbol>AAPL</Symbol>
  <Entry>$180.00</Entry>
  <Current>$185.50</Current>
  <StopLoss role="alert" className="text-red-500">
    ⛔ $170.00  {/* 5.5% below entry */}
  </StopLoss>
  <ChangePercent change={3.06} />
  <RiskPercent risk={2.84} />  {/* (185.50-170)/170*100 */}
</PositionRow>
```

**UI Feedback:**
- Loading: "Setting stop loss..."
- Success: Green toast "Stop loss set at $170.00 for AAPL"
- Failure: Red toast "Failed to set stop loss: [reason]"
- Invalid: "Stop loss must be below current price"

---

#### 5.2 `/api/risk/assess` (POST) - Assess Position Risk
**UI Location:** [PortfolioPage.tsx](trading-dashboard/src/pages/PortfolioPage.tsx) - Before adding position & on portfolio view

**Integration Points:**
```tsx
// PortfolioPage.tsx - Called when:
// 1. User clicks "Add Position" → Assess before adding
// 2. User views existing position → Show risk assessment
POST /api/risk/assess
Request Body: {
  symbol: string,
  entry_price: number,
  stop_loss_price: number,
  quantity: number,
  capital_at_risk: number (0.01 - 0.05, e.g., 0.02 for 2%)
}

Response: {
  symbol: string,
  position_size: number,          // entry_price * quantity
  risk_amount: number,            // abs(entry - stop) * quantity
  risk_percentage: number,        // (risk_amount / position_size) * 100
  capital_at_risk: number,
  max_capital_at_risk: number,
  recommendation: 'ACCEPTABLE' | 'HIGH_RISK' | 'UNACCEPTABLE',
  suggestions: string[]
}

User Flow (Add Position):
1. User clicks "Add Position" button
2. Modal opens:
   ┌───────────────────────────────┐
   │ Add New Position               │
   ├───────────────────────────────┤
   │ Symbol: [AAPL___]              │
   │ Entry Price: [180.00]          │
   │ Stop Loss: [170.00]            │
   │ Quantity: [100]                │
   │ Capital at Risk: [2%] dropdown │
   └───────────────────────────────┘
3. User fills form → Click "Assess Risk"
4. Call /api/risk/assess with above data
5. Display assessment:
   ┌──────────────────────────────┐
   │ Risk Assessment               │
   ├──────────────────────────────┤
   │ Position Size: $18,000        │
   │ Risk Amount: $1,000           │
   │ Risk %: 5.56% ⚠️ HIGH        │
   │ Status: HIGH_RISK             │
   ├──────────────────────────────┤
   │ ⚠️  Risk level is high        │
   │    Consider reducing position │
   │    size to lower risk         │
   └──────────────────────────────┘
6. If risk is ACCEPTABLE:
   - [Execute Trade] button enabled (green)
   - Show: "Risk is acceptable. Proceed?"
7. If risk is HIGH_RISK:
   - [Execute Trade] button disabled (gray)
   - Show warning: "Risk exceeds 5%, adjust position"
   - User must adjust quantities to lower risk
8. If risk is UNACCEPTABLE:
   - [Execute Trade] button disabled (red background)
   - Show error: "Risk exceeds maximum tolerance"

Portfolio View (Risk Indicator):
┌────────────────────────────────┐
│ AAPL - Apple Inc.              │
│ Entry: $180 | Current: $185    │
│ Quantity: 100 | Value: $18,500│
│ Risk Indicator:                │
│ ├─ Risk Amount: $1,000 (5.56%)│
│ ├─ Status: 🟡 HIGH_RISK       │
│ └─ Suggestion: Reduce qty by 30│
│                                │
│ [Adjust] [View Details] [×]    │
└────────────────────────────────┘
```

**Component Changes Required:**
- [ ] Create RiskAssessmentPanel component
- [ ] Update PortfolioPage to show risk on each position
- [ ] Add risk badge (GREEN=ACCEPTABLE, YELLOW=HIGH_RISK, RED=UNACCEPTABLE)
- [ ] Show suggested adjustment (qty reduction or new stop loss)
- [ ] Block trade execution if risk is too high
- [ ] Add real-time risk recalculation as user adjusts inputs

**Risk Display Colors:**
```css
/* Risk Assessment Color Scheme */
.risk-acceptable { background: #10b981; } /* Green */
.risk-high { background: #f59e0b; }       /* Amber */
.risk-critical { background: #ef4444; }   /* Red */
```

**Risk Calculation Helper:**
```tsx
function calculateRiskMetrics(entry, stop, qty, capital_at_risk) {
  const position_size = entry * qty;
  const risk_amount = Math.abs(entry - stop) * qty;
  const risk_pct = (risk_amount / position_size) * 100;
  
  let status = 'ACCEPTABLE';
  if (risk_pct > 5) status = 'HIGH_RISK';
  if (risk_pct > 10) status = 'UNACCEPTABLE';
  
  return { position_size, risk_amount, risk_pct, status };
}
```

**UI Feedback:**
- Loading: "Assessing risk..."
- Success (Acceptable): Green badge + [Execute Trade] enabled
- Success (High Risk): Yellow badge + [Execute Trade] disabled + suggestions
- Success (Unacceptable): Red badge + [Execute Trade] disabled
- Failure: "Risk assessment failed: [reason]"

---

### 6. TRADE EXECUTION ENDPOINT
**⚙️ Backend Path:** `/tools/execute` (or similar)

#### 6.1 Trade Execution Flow (Integrated with Risk)
**UI Location:** [PortfolioPage.tsx](trading-dashboard/src/pages/PortfolioPage.tsx) - Add Position → Execute button

**Integration Points:**
```tsx
// PortfolioPage.tsx - After risk assessment approved
POST /tools/execute (assumed endpoint)
Request Body: {
  symbol: string,
  quantity: number,
  entry_price: number,
  stop_loss_price: number,
  side: 'BUY' | 'SELL',
  order_type: 'market' | 'limit',
  risk_assessment: { /* from /api/risk/assess */ }
}

Response: {
  success: boolean,
  order_id: string,
  symbol: string,
  quantity: number,
  execution_price: number,
  timestamp: ISO timestamp,
  message: string
}

CRITICAL FLOW (Risk Must Be Assessed First):
Step 1: User clicks "Add Position"
  └─→ Modal shows: Symbol, Entry, Stop Loss, Qty inputs

Step 2: User clicks "Assess Risk"
  └─→ Call POST /api/risk/assess
  └─→ Display risk metrics + recommendation

Step 3: Based on risk assessment:
  If ACCEPTABLE:
    ├─ [Execute Trade] button is ENABLED (green)
    ├─ Show: "Risk is acceptable (X.XX%). Ready to execute?"
    └─ User clicks [Execute Trade]
  
  If HIGH_RISK:
    ├─ [Execute Trade] button is DISABLED (gray)
    ├─ Show: "Risk exceeds 5%. Adjust position to proceed."
    └─ User must reduce qty or increase stop loss
  
  If UNACCEPTABLE:
    ├─ [Execute Trade] button is DISABLED (red)
    ├─ Show: "Risk too high. Cannot execute."
    └─ User must make significant adjustments

Step 4: If user clicks [Execute Trade]:
  ├─ Show confirmation modal:
  │  ┌─────────────────────────────────┐
  │  │ Confirm Trade Execution          │
  │  ├─────────────────────────────────┤
  │  │ Symbol: AAPL                    │
  │  │ Quantity: 100                   │
  │  │ Entry Price: $180.00            │
  │  │ Stop Loss: $170.00              │
  │  │ Risk Amount: $1,000 (5.56%)     │
  │  │ Position Size: $18,000          │
  │  │                                 │
  │  │ ⚠️  This action will execute     │
  │  │     a new position order.        │
  │  │                                 │
  │  │ [Confirm] [Cancel]              │
  │  └─────────────────────────────────┘
  └─ User clicks [Confirm]

Step 5: Execute trade
  ├─ Show: "Executing order..."
  ├─ Call POST /tools/execute
  └─ Wait for response

Step 6: Handle response:
  If Success:
    ├─ Show green toast: "Order executed! AAPL (100) @ $180"
    ├─ Add to holdings in local state
    ├─ Update portfolio total value
    ├─ Show position in portfolio with stop loss
    └─ Close modal
  
  If Failure:
    ├─ Show red toast: "Execution failed: [error]"
    ├─ Show [Retry] button
    └─ Keep modal open for adjustment
```

**Component Changes Required:**
- [ ] Create ConfirmTradeModal component
- [ ] Add conditional logic to enable/disable [Execute Trade] button
- [ ] Integrate all three endpoints: predict → risk/assess → execute
- [ ] Add order confirmation with full details
- [ ] Add visual feedback during execution
- [ ] Update portfolio display after successful execution
- [ ] Add trade to TradingHistory automatically

**Execution Flow Diagram:**
```
┌─────────────────┐
│  Add Position   │
│     Button      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   Form Modal Opens       │
│ - Symbol                │
│ - Entry Price           │
│ - Stop Loss             │
│ - Quantity              │
└────────┬────────────────┘
         │
         ▼
    [Assess Risk]
         │
         ▼
    POST /api/risk/assess
         │
         ├─ ACCEPTABLE
         │   ▼
         │  [Execute Trade] ENABLED ✓
         │
         ├─ HIGH_RISK
         │   ▼
         │  [Execute Trade] DISABLED ⚠️
         │
         └─ UNACCEPTABLE
             ▼
            [Execute Trade] DISABLED ❌

    If ACCEPTABLE + User clicks [Execute]:
         │
         ▼
    [Confirm Trade Modal]
         │
         ▼
    [Confirm] Button
         │
         ▼
    POST /tools/execute
         │
         ├─ Success
         │   ▼
         │  Green Toast + Update Portfolio
         │
         └─ Failure
             ▼
            Red Toast + [Retry]
```

**UI Feedback:**
- Before Assess: [Assess Risk] button active, [Execute Trade] disabled
- After Assess (Acceptable): [Execute Trade] button green, enabled
- After Assess (High Risk): [Execute Trade] button gray, disabled
- On Execute Click: Confirmation modal required
- During Execution: "Executing order..." with spinner
- On Success: Green toast "Order executed! Position added to portfolio"
- On Failure: Red toast "Execution failed: [reason]"

---

## 📊 Summary Table: All Endpoints

| Endpoint | Location | Method | Trigger | Feedback |
|----------|----------|--------|---------|----------|
| `/auth/login` | LoginPage | POST | Button click | Toast + Redirect |
| `/auth/logout` | UserProfile | GET | Menu click | Confirmation + Toast |
| `/auth/status` | Internal | GET | On-demand | Rate limit display |
| `/tools/health` | Sidebar | GET | Auto-poll 30s | Status dot + tooltip |
| `/tools/predict` | MarketScan | POST | Search/Input | Prediction cards |
| `/tools/scan_all` | MarketScan | POST | Scan button | Results table |
| `/tools/analyze` | Analytics | POST | Symbol select | Analysis cards |
| `/tools/compare_all` | Compare | POST | Compare button | Table + Chart |
| `/api/risk/stop-loss` | Portfolio | POST | Button click | Toast + Inline display |
| `/api/risk/assess` | Portfolio | POST | Before Execute | Risk badge + Suggestions |
| `/tools/execute` | Portfolio | POST | Confirm click | Toast + Portfolio update |

---

## 🎨 UI Component Checklist

### New Components to Create
- [ ] PredictionCard.tsx - Individual prediction display
- [ ] ScanResultsTable.tsx - Ranked predictions table
- [ ] AnalysisCard.tsx - Analysis display with tabs
- [ ] RiskAssessmentPanel.tsx - Risk metrics display
- [ ] StopLossModal.tsx - Set stop loss interface
- [ ] ConfirmTradeModal.tsx - Trade execution confirmation
- [ ] HealthIndicator.tsx - System status dot (can be part of Sidebar)
- [ ] RiskBadge.tsx - Color-coded risk status badge
- [ ] ComparisonTable.tsx - Multi-symbol comparison
- [ ] ComparisonChart.tsx - Comparison visualization

### Existing Components to Modify
- [ ] LoginPage.tsx - Add login success refresh logic
- [ ] UserProfilePage.tsx - Add logout functionality
- [ ] Sidebar.tsx - Add health check polling
- [ ] MarketScanPage.tsx - Integrate /tools/predict + /tools/scan_all
- [ ] AnalyticsPage.tsx - Integrate /tools/analyze
- [ ] ComparePage.tsx - Integrate /tools/compare_all
- [ ] PortfolioPage.tsx - Integrate all risk + execution endpoints
- [ ] Layout.tsx - Add refresh trigger on login
- [ ] AuthContext.tsx - Token and state management

---

## 🔄 State Management Strategy

### AuthContext (Token + User Data)
```tsx
interface AuthState {
  token: string | null;
  user: { id, username, email } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Actions
- setToken(token)
- clearToken()
- setUser(user)
- clearAll()
```

### HealthContext (Auto-polling)
```tsx
interface HealthState {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  cpu: number;
  memory: number;
  lastUpdated: timestamp;
}
```

### PortfolioContext (Positions + Risk)
```tsx
interface PortfolioState {
  holdings: Holding[];
  riskAssessments: { [symbol]: RiskMetrics };
  stopLosses: { [symbol]: number };
  loading: boolean;
}

// Actions
- addHolding(holding)
- updateRiskAssessment(symbol, metrics)
- setStopLoss(symbol, price)
```

---

## ⚠️ Error Handling Strategy

**All endpoints must have:**

1. **Try-Catch blocks** in components
2. **User-facing error messages** (not technical details)
3. **Retry logic** for network failures
4. **Timeout handling** (5-second default)
5. **Rate limit warnings** (if approaching limit)
6. **Graceful degradation** (UI still functional without non-critical data)

**Error Toast Template:**
```tsx
// Generic format
toast.error(`Failed to [action]: [user-friendly reason]`);

// Examples
toast.error("Failed to login: Invalid credentials");
toast.error("Failed to add position: Risk exceeds maximum tolerance");
toast.error("Failed to fetch predictions: Network timeout");
```

---

## 🎯 Priority Implementation Order

### Phase 1 (Week 1) - Core Authentication + Health
1. `/auth/login` + LoginPage integration
2. `/auth/logout` + UserProfilePage integration
3. `/tools/health` + Sidebar polling
4. Update AuthContext for state management

### Phase 2 (Week 2) - Market & Prediction
1. `/tools/predict` + MarketScanPage
2. `/tools/scan_all` + ScanResultsTable
3. PredictionCard component

### Phase 3 (Week 3) - Risk Management
1. `/api/risk/assess` + PortfolioPage
2. `/api/risk/stop-loss` + StopLossModal
3. RiskAssessmentPanel + RiskBadge components

### Phase 4 (Week 4) - Analytics & Execution
1. `/tools/analyze` + AnalyticsPage
2. `/tools/compare_all` + ComparePage
3. `/tools/execute` + ConfirmTradeModal
4. End-to-end testing

---

## ✅ Testing Checklist

### Functional Tests
- [ ] Login/logout cycles work correctly
- [ ] Health indicator updates every 30 seconds
- [ ] Predictions display correctly formatted
- [ ] Risk assessment blocks high-risk trades
- [ ] Stop loss appears inline on positions
- [ ] Trade execution requires confirmation
- [ ] Portfolio updates after successful trade

### User Experience Tests
- [ ] All success/failure messages clear and actionable
- [ ] Loading states visible during API calls
- [ ] No invisible actions (all feedback explicit)
- [ ] Risk is always visible (never hidden)
- [ ] Buttons disabled appropriately (high-risk trades)
- [ ] Modals require confirmation for destructive actions

### Error Handling Tests
- [ ] Network timeout handled gracefully
- [ ] Rate limit warning displayed
- [ ] Invalid inputs rejected with clear messages
- [ ] Retry logic works for failed requests
- [ ] Partial failures don't crash UI

---

**Next Action:** Review this specification, then begin Phase 1 implementation with login/logout integration.

