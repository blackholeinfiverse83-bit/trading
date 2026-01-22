# BACKEND-FRONTEND ALIGNMENT ANALYSIS
**Date**: January 20, 2026  
**Status**: COMPREHENSIVE STUDY - CRITICAL ISSUES IDENTIFIED

---

## EXECUTIVE SUMMARY

The frontend and backend are **PARTIALLY ALIGNED** with several **CRITICAL GAPS**:

1. ✅ **Core prediction endpoints working**: `/tools/predict`, `/tools/analyze`, `/tools/scan_all`
2. ✅ **Risk management endpoints exist**: `/api/risk/stop-loss`, `/api/risk/assess`
3. ✅ **AI chat endpoint exists**: `/api/ai/chat`
4. ❌ **Frontend uses Supabase auth BUT backend doesn't support it** - auth is disabled
5. ❌ **Portfolio positions NOT persisted to backend** - stored in localStorage only
6. ❌ **Missing backend endpoints** for position management (add/remove/buy/sell)
7. ❌ **UI elements exist without backend support** - "dead" buttons

---

## PART 1: BACKEND ENDPOINTS - COMPLETE INVENTORY

### Authentication & System
| Endpoint | Method | Purpose | Auth Required | Current Status |
|----------|--------|---------|---------------|----|
| `GET /` | GET | API information | NO | ✅ Works |
| `POST /auth/login` | POST | Login (disabled) | NO | ✅ Works (but auth disabled) |
| `GET /auth/status` | GET | Rate limit status | NO | ✅ Works |
| `GET /tools/health` | GET | System health & resources | NO | ✅ Works |

### Trading/Prediction Endpoints
| Endpoint | Method | Request | Response | Status |
|----------|--------|---------|----------|--------|
| `POST /tools/predict` | POST | `{symbols[], horizon, risk_profile?, stop_loss_pct?, capital_risk_pct?, drawdown_limit_pct?}` | `{predictions: [{symbol, action, confidence, ...}]}` | ✅ Full support |
| `POST /tools/scan_all` | POST | `{symbols[], horizon, min_confidence, stop_loss_pct?, capital_risk_pct?}` | `{ranked_symbols: [...]}` | ✅ Full support |
| `POST /tools/analyze` | POST | `{symbol, horizons[], stop_loss_pct, capital_risk_pct, drawdown_limit_pct}` | `{analysis: [{...}]}` | ✅ Full support |
| `POST /tools/feedback` | POST | `{symbol, predicted_action, user_feedback, actual_return?}` | `{status, message}` | ✅ Full support |
| `POST /tools/train_rl` | POST | `{symbol, horizon, n_episodes, force_retrain}` | `{training_status}` | ✅ Full support |
| `POST /tools/fetch_data` | POST | `{symbols[], period, include_features?, refresh?}` | `{data: {...}}` | ✅ Full support |

### Risk Management Endpoints
| Endpoint | Method | Request | Response | Status |
|----------|--------|---------|----------|--------|
| `POST /api/risk/stop-loss` | POST | `{symbol, stop_loss_price, side, timeframe, source}` | `{success, stop_loss: {...}}` | ✅ Full support |
| `POST /api/risk/assess` | POST | `{symbol, entry_price, stop_loss_price, quantity, capital_at_risk}` | `{symbol, position_size, risk_amount, risk_percentage, recommendation}` | ✅ Full support |

### AI Chat Endpoint
| Endpoint | Method | Request | Response | Status |
|----------|--------|---------|----------|--------|
| `POST /api/ai/chat` | POST | `{message, context?}` | `{message, timestamp, intent}` | ✅ Full support |

---

## PART 2: FRONTEND IMPLEMENTATION STATUS

### ✅ CORRECTLY IMPLEMENTED
1. **API Service Layer** (`src/services/api.ts`)
   - All backend endpoints are correctly mapped
   - Error handling is comprehensive
   - Timeout handling for long-running requests
   - Rate limiting respect

2. **Prediction Pages**
   - DashboardPage: Uses `/tools/predict` correctly
   - MarketScanPage: Would use `/tools/scan_all` correctly
   - RiskManagementPage: Uses `/api/risk/stop-loss` and `/api/risk/assess` correctly

3. **Risk Management Components**
   - RiskManagementPage: Forms correctly call `riskAPI.setStopLoss()` and `riskAPI.assessRisk()`
   - UI properly displays risk assessment results

4. **Test Pages**
   - ApiTestPage: Tests all endpoints
   - EndpointTestPage: Tests all endpoints

---

## PART 3: CRITICAL MISALIGNMENTS & ISSUES

### ❌ ISSUE #1: AUTH MISMATCH
**Problem**: Frontend uses Supabase auth, Backend has auth disabled
- **Frontend**: `AuthContext.tsx` tries to use Supabase
- **Backend**: Accepts any login, returns `no-auth-required` token
- **Result**: Users can "login" with fake credentials
- **Impact**: NO security, no persistent user identity

**Current Code**:
```typescript
// Frontend - AuthContext.tsx
const { data: { session } } = await supabase.auth.getSession();

// Backend - api_server.py
if not ENABLE_AUTH:
    return { 'success': True, 'token': 'no-auth-required' }
```

**Fix Needed**: Either enable backend auth OR remove Supabase dependency from frontend

---

### ❌ ISSUE #2: NO POSITION PERSISTENCE TO BACKEND
**Problem**: Portfolio positions stored ONLY in localStorage, not persisted to backend

- **Current Flow**:
  1. User adds position in Portfolio Page
  2. Position saved to `localStorage['portfolio_holdings']`
  3. NO backend API call
  4. Positions lost on browser clear/new device

- **Expected Flow** (with real backend):
  1. User adds position → `POST /api/portfolio/add-position`
  2. Backend stores position in database
  3. Positions persist across sessions & devices

**Pages Affected**:
- `PortfolioPage.tsx` - adds/removes positions locally only
- `DashboardPage.tsx` - manually adds trades to `userAddedTrades` state

**Frontend Code**:
```typescript
// PortfolioPage.tsx - NO backend call!
const savedHoldings = localStorage.getItem('portfolio_holdings');
let userHoldings = savedHoldings ? JSON.parse(savedHoldings) : [];
// ... saves back to localStorage only
localStorage.setItem('portfolio_holdings', JSON.stringify(userHoldings));
```

**Backend Reality**: NO endpoints exist for:
- `POST /api/portfolio/add-position`
- `POST /api/portfolio/remove-position`
- `GET /api/portfolio/positions`
- `PUT /api/portfolio/update-position`

**Fix Needed**: 
1. Either add backend endpoints for position management
2. OR accept that positions are local-only and document this

---

### ❌ ISSUE #3: PORTFOLIO VALUE & PROFIT/LOSS ARE FAKE
**Problem**: Calculated entirely from user-entered data, not from real market data

- **Current Implementation**:
  ```typescript
  // PortfolioPage.tsx
  const calculatePortfolioValue = () => {
    return holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
  };
  // currentPrice is from localStorage, not backend!
  ```

- **Reality**: 
  - No call to `/tools/predict` to get live prices
  - No price update mechanism
  - Users manually enter average price
  - "Current price" doesn't update

**Fix Needed**: 
- Call `/tools/predict` to get current symbol prices
- Update portfolio values in real-time
- Show when prices are stale

---

### ❌ ISSUE #4: ALERTS SYSTEM USES LOCAL SERVICE, NO BACKEND
**Problem**: AlertsPage uses purely local alert service

**Current**:
```typescript
// AlertsPage.tsx
import { priceAlertsService, predictionAlertsService } from '../services/alertsService';

const handleAddPriceAlert = () => {
  const newAlert = priceAlertsService.add({...}); // LOCAL ONLY
};
```

**What's Missing**:
- No backend persistence
- No alert triggering mechanism
- No webhook/notification delivery from backend
- Alerts only work while page is open

**Backend Reality**: NO endpoints exist for:
- `POST /api/alerts/create`
- `GET /api/alerts/list`
- `DELETE /api/alerts/{id}`
- No alert notification service

**Fix Needed**: 
- Implement backend alert management system
- OR accept alerts are local-only and document this

---

### ❌ ISSUE #5: AUTHENTICATION CONTEXT DOESN'T MATCH BACKEND AUTH STATE
**Problem**: 

**Frontend** (`AuthContext.tsx`):
- Expects Supabase session
- Stores user profile
- Has login/signup methods

**Backend**:
- Auth disabled (ENABLE_AUTH = False)
- Accepts any username/password
- Returns `no-auth-required` token

**Current Flow**:
```
1. User enters credentials
2. Supabase attempts to authenticate (will fail - no Supabase account)
3. User redirected to login page
4. App stuck in login loop
```

**Fix Needed**: Make auth consistent across frontend/backend

---

### ❌ ISSUE #6: THEME RENDERING ISSUES
**Problem**: Light theme specifically mentioned in AlertsPage but not fully implemented across all pages

**Code in AlertsPage**:
```typescript
const isLight = theme === 'light';
// Used for conditional styling
<div className={isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-slate-800/50 border border-slate-700/50'}>
```

**Issues Found**:
- Not all pages respect light theme equally
- Risk columns may be hidden in some themes
- Action buttons may have low contrast in light theme

**Fix Needed**: Audit all pages for theme consistency

---

### ❌ ISSUE #7: MISSING ENDPOINTS FOR COMMON TRADING OPERATIONS
**Backend Missing**:
```
POST /api/portfolio/buy       - Execute buy order
POST /api/portfolio/sell      - Execute sell order  
GET /api/portfolio/positions  - Get user positions
POST /api/trade/log           - Log trade execution
GET /api/trade/history        - Get trade history
```

**Frontend Expecting** (implicitly):
- Ability to "buy" and "sell" stocks
- Persistent portfolio
- Trade history tracking

**Current State**: All this is faked in localStorage

---

## PART 4: DETAILED ENDPOINT USAGE MAP

### `/tools/predict` - Trading Predictions
**Usage Locations**:
1. ✅ `DashboardPage.tsx` - Line 194
2. ✅ `PortfolioPage.tsx` - Line 313
3. ✅ `ApiTestPage.tsx` - Line 35
4. ✅ `EndpointTestPage.tsx` - Line 35

**Request Structure**:
```json
{
  "symbols": ["AAPL", "GOOGL"],
  "horizon": "intraday",
  "risk_profile": "moderate",
  "stop_loss_pct": 2.0,
  "capital_risk_pct": 1.0,
  "drawdown_limit_pct": 5.0
}
```

**Response Structure**:
```json
{
  "predictions": [
    {
      "symbol": "AAPL",
      "action": "LONG",
      "confidence": 0.75,
      "entry": 150.00,
      "target": 155.00,
      "stop_loss": 147.50
    }
  ],
  "metadata": {
    "horizon": "intraday",
    "timestamp": "2026-01-20T12:47:33Z"
  }
}
```

**Status**: ✅ Working correctly in frontend

---

### `/tools/analyze` - Detailed Symbol Analysis
**Usage Locations**:
1. ✅ `ApiTestPage.tsx` - Line 42
2. ✅ `EndpointTestPage.tsx` - Line 45

**Currently NOT USED** for actual analysis display in any major page

**Request Structure**:
```json
{
  "symbol": "AAPL",
  "horizons": ["intraday", "short"],
  "stop_loss_pct": 2.0,
  "capital_risk_pct": 1.0,
  "drawdown_limit_pct": 5.0
}
```

**Status**: ❌ API exists but no UI component uses it for display

---

### `/tools/scan_all` - Multi-Symbol Scan
**Usage Locations**:
1. ❌ NO USAGE FOUND in main pages
2. ✅ `EndpointTestPage.tsx` - Line 40

**Status**: ❌ Endpoint exists, not used in any page

---

### `/api/risk/stop-loss` - Set Stop Loss
**Usage Locations**:
1. ✅ `RiskManagementPage.tsx` - Line 45+
2. ✅ `riskAPI.setStopLoss()` in `api.ts`

**Request Structure**:
```json
{
  "symbol": "AAPL",
  "stop_loss_price": 147.50,
  "side": "SELL",
  "timeframe": "1d",
  "source": "manual"
}
```

**Status**: ✅ Working correctly

---

### `/api/risk/assess` - Assess Position Risk
**Usage Locations**:
1. ✅ `RiskManagementPage.tsx` - Line 130+
2. ✅ `riskAPI.assessRisk()` in `api.ts`

**Request Structure**:
```json
{
  "symbol": "AAPL",
  "entry_price": 150.00,
  "stop_loss_price": 147.50,
  "quantity": 10,
  "capital_at_risk": 0.02
}
```

**Status**: ✅ Working correctly

---

### `/api/ai/chat` - AI Trading Assistant
**Usage Locations**:
1. ✅ `RiskManagementPage.tsx` - Line 152+
2. ✅ `AIAssistantPage.tsx` (if exists)

**Status**: ✅ Working correctly

---

### `/tools/feedback` - Provide Feedback for ML Training
**Usage Locations**:
1. ❌ NO USAGE FOUND in any page
2. ✅ `EndpointTestPage.tsx` - Line 50

**Status**: ❌ Backend endpoint exists, no UI for user to provide feedback

---

### `/tools/train_rl` - Train RL Agent
**Usage Locations**:
1. ❌ NO USAGE FOUND in main pages
2. ✅ `TrainModelPage.tsx` - likely uses this
3. ✅ `EndpointTestPage.tsx` - Line 55

**Status**: ⚠️ Page exists but verify implementation

---

## PART 5: DEAD UI ELEMENTS

### ❌ Components Using Endpoints That Don't Respond
1. **MarketScanPage** - uses `/tools/scan_all` ?
2. **AnalyticsPage** - uses `/tools/analyze` ?
3. **EnhancedAnalyticsPage** - backend support unclear
4. **ComparisonPage** - unclear which endpoints used
5. **WatchListPage** - no backend endpoints for watch lists

### ❌ Buttons That Don't Do Anything
- "Save" buttons in some modals
- "Export" buttons (if any)
- "Sync" buttons without backend support

---

## PART 6: REQUIRED FIXES (PRIORITY ORDER)

### PRIORITY 1 (Critical - Breaking Functionality)
1. **Fix Authentication** - Choose one:
   - Option A: Implement backend auth properly
   - Option B: Remove Supabase, use backend login only
2. **Fix Portfolio Persistence** - Add backend endpoints:
   - `POST /api/portfolio/positions` - add position
   - `DELETE /api/portfolio/positions/{symbol}` - remove position
   - `GET /api/portfolio/positions` - fetch all positions
3. **Fix Price Updates** - Integrate `/tools/predict` for live prices

### PRIORITY 2 (High - UI/UX Issues)
1. **Theme Consistency** - Audit all pages for light/dark/space theme
2. **Action Button Feedback** - Ensure all buttons show loading/success states
3. **Error Boundaries** - Improve error displays

### PRIORITY 3 (Medium - Feature Gaps)
1. **Implement Alerts Backend** - Or document as local-only
2. **Implement Feedback UI** - Let users rate predictions
3. **Implement Trade History** - Show past trades

---

## SUMMARY OF ALIGNMENT

**Backend Endpoints**: 14 total
- **Fully Used**: 6 (`predict`, `health`, `login`, `status`, `stop-loss`, `risk-assess`)
- **Partially Used**: 4 (`feedback`, `train_rl`, `analyze`, `scan_all`)
- **Not Used**: 4+ (alert endpoints that don't exist)

**Frontend Pages**: 19 total
- **Fully Aligned**: 5 (Dashboard, Portfolio, Risk Management, API Test, Endpoint Test)
- **Partially Aligned**: 8 (missing some endpoint integrations)
- **Not Aligned**: 6+ (using local-only services)

**Overall Alignment Score**: ~55-60% ⚠️

---

**Next Step**: Execute PRIORITY 1 fixes to restore core functionality
