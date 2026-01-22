# Trading Hub - Quick Reference Guide

## 🎯 Component Structure

```
TradingHubPage (Main Container)
├── Header
│   └── Title & Logo
├── Tab Navigation
│   ├── Trading Panel (Tab 1)
│   ├── Market Scanner (Tab 2)
│   └── Risk Calculator (Tab 3)
└── Content Area
    ├── TradingPanel Component
    │   ├── Search Bar
    │   ├── Stock Details Card
    │   ├── Trading Form
    │   ├── Risk/Reward Analysis
    │   ├── Action Buttons (Buy/Sell)
    │   └── Confirmation Modal
    │
    ├── MarketScanner Component
    │   ├── Filters Section
    │   ├── Results Table
    │   ├── Export Button
    │   └── Symbol Selection
    │
    └── RiskCalculator Component
        ├── Input Parameters
        ├── Metrics Grid
        ├── Trade Breakdown
        └── Recommendation Card
```

## 📁 File Structure

```
src/
├── pages/
│   └── TradingHubPage.tsx           # Main trading hub page
│
├── components/
│   ├── TradingPanel.tsx             # Trading execution
│   ├── MarketScannerNew.tsx         # Market screening
│   ├── RiskCalculatorNew.tsx        # Risk management
│   │
│   └── styles/
│       ├── TradingPanel.css         # Trading panel styling
│       ├── MarketScanner.css        # Scanner styling
│       └── RiskCalculator.css       # Calculator styling
│
└── styles/
    └── TradingHub.css               # Hub layout styling
```

## 🎛️ Key Components Details

### TradingPanel.tsx
**Purpose**: Execute trades with real-time analysis

**Props**: None (uses Context hooks)

**State**:
- `searchQuery: string` - Search input value
- `selectedSymbol: Stock | null` - Currently selected stock
- `stocks: Stock[]` - Search results
- `tradeData: TradeData` - Trade parameters
- `showBuyModal: boolean` - Buy confirmation visibility
- `showSellModal: boolean` - Sell confirmation visibility
- `orderType: 'buy' | 'sell'` - Trade direction
- `loading: boolean` - API call status

**Key Functions**:
- `handleSearch(query)` - API call to search stocks
- `calculateMetrics(qty, entry, target, sl)` - Update risk metrics
- `handleSelectStock(stock)` - Stock selection handler
- `handleSubmitTrade()` - Place order API call

---

### MarketScanner.tsx
**Purpose**: Screen multiple stocks for opportunities

**Props**: None (uses Context hooks)

**State**:
- `results: ScanResult[]` - Scan results
- `loading: boolean` - Scanning status
- `filters: ScanFilters` - Current filter values
- `selectedSymbols: string[]` - Checked symbols

**Filter Interface**:
```typescript
{
  horizon: 'intraday' | 'short' | 'long',
  minConfidence: number (0-1),
  minRiskReward: number (0.5-5),
  minVolume: number,
  recommendation: 'ALL' | 'BUY' | 'SELL' | 'HOLD'
}
```

**Key Functions**:
- `handleScan()` - Execute market scan
- `handleExport()` - Export results as CSV
- `Filter updates` - Real-time result filtering

---

### RiskCalculator.tsx
**Purpose**: Calculate position sizing and risk metrics

**Props**: None

**State**:
- `capital: number` - Trading capital
- `entryPrice: number` - Entry price
- `exitPrice: number` - Target price
- `stopLossPrice: number` - Stop loss price
- `quantity: number` - Position size
- `riskPercentage: number` - % risk per trade
- `expectedWinRate: number` - Expected win %
- `averageRR: number` - Average R:R ratio

**Calculated Metrics**:
```typescript
{
  positionSize: number,
  accountRisk: number,
  maxDrawdown: number,
  sharpeRatio: number,
  expectedValue: number,
  profitFactor: number,
  winRate: number
}
```

---

## 🎨 Styling Reference

### CSS Classes Used

#### Containers
- `.trading-hub` - Main container
- `.trading-panel` - Panel wrapper
- `.market-scanner` - Scanner wrapper
- `.risk-calculator` - Calculator wrapper

#### Headers
- `.trading-header` - Section headers
- `.scanner-header` - Scanner header
- `.calculator-header` - Calculator header

#### Cards
- `.stock-details-card` - Stock info display
- `.trading-form-card` - Form container
- `.metric-card` - Metric display card
- `.breakdown-card` - Breakdown section

#### Inputs
- `.form-input` - Text input
- `.filter-select` - Dropdown select
- `.filter-slider` - Range slider
- `.input-with-unit` - Currency input

#### Tables
- `.results-table` - Scanner results table
- `.result-row` - Individual row styling
- `.metric-cell` - Cell styling

#### Modals
- `.modal-overlay` - Overlay background
- `.modal-content` - Modal box
- `.modal-details` - Details section
- `.modal-actions` - Button group

#### Buttons
- `.btn-buy` - Buy button (green)
- `.btn-sell` - Sell button (red)
- `.btn-scan` - Scan button (blue)
- `.btn-export` - Export button (gray)

---

## 🎯 Color Reference

| Element | Color | Usage |
|---------|-------|-------|
| Primary Action | #3b82f6 | Buttons, links, focus |
| Success/Buy | #10b981 | Buy signals, positive |
| Danger/Sell | #ef4444 | Sell signals, negative |
| Warning | #f59e0b | Cautions, warnings |
| Dark BG | #0f172a | Primary background |
| Secondary BG | #1a202c | Alternative background |
| Text Primary | #e2e8f0 | Main text |
| Text Secondary | #cbd5e1 | Secondary text |
| Text Tertiary | #94a3b8 | Subtle text |

---

## 📱 Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Desktop | >1400px | 2-column grid |
| Tablet | 1024-1400px | Single column |
| Mobile | 768-1024px | Optimized mobile |
| Small | <768px | Compact layout |

---

## 🔌 Context & Hooks Used

### useConnection()
```typescript
const { isConnected, connectionStatus } = useConnection();
```
Provides backend connectivity status.

### useAuth()
```typescript
const { isAuthenticated, user, logout } = useAuth();
```
Provides user authentication status.

### useTheme()
```typescript
const { theme, toggleTheme } = useTheme();
```
Provides theme switching capability.

### useNotification()
```typescript
const { showNotification } = useNotification();
```
Provides toast notifications.

---

## 🚀 Common Tasks

### Add a New Symbol to Scanner
```typescript
const topSymbols = [
  'AAPL', 'MSFT', 'GOOGL', // ... existing
  'NEW_SYMBOL'  // Add here
];
```

### Change Button Colors
```css
.btn-buy {
  background: linear-gradient(135deg, #new-color1 0%, #new-color2 100%);
}
```

### Add New Metrics to Risk Calculator
```typescript
const metrics = calculateMetrics();
// Add new calculation to calculateMetrics() function
// Add new metric card to JSX
```

### Modify API Endpoints
```typescript
// In component, update fetch URL:
const response = await fetch('/api/new/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

---

## 🧪 Testing Examples

### Test Search Functionality
```typescript
// In browser console
const search = new URLSearchParams({ q: 'AAPL' });
fetch(`/api/market/search?${search}`)
  .then(r => r.json())
  .then(console.log);
```

### Test Market Scan
```typescript
fetch('/api/tools/scan_all', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbols: ['AAPL', 'MSFT'],
    horizon: 'intraday',
    min_confidence: 0.5
  })
}).then(r => r.json()).then(console.log);
```

### Test Risk Calculation
```typescript
// Open calculator and input:
capital: 100000
risk: 2%
entry: 150
stopLoss: 148
target: 156

// Should calculate:
positionSize: ~1000 units
riskRewardRatio: 1:3
expectedValue: positive if win rate > 25%
```

---

## 📊 Data Types Reference

### Stock Interface
```typescript
interface Stock {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: string;
  pe?: number;
}
```

### ScanResult Interface
```typescript
interface ScanResult {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  riskRewardRatio: number;
  technicalScore: number;
}
```

### TradeData Interface
```typescript
interface TradeData {
  symbol: string;
  quantity: number;
  entryPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  riskRewardRatio: number;
  potentialProfit: number;
  potentialLoss: number;
  riskPercentage: number;
}
```

---

## 📞 Troubleshooting Quick Tips

| Issue | Solution |
|-------|----------|
| Components not rendering | Check imports in routes.tsx |
| Styles look broken | Clear cache & rebuild: `npm run build` |
| API calls failing | Verify backend running on :8000 |
| Search not working | Check `/api/market/search` endpoint |
| Modals not showing | Check modal CSS and overlay |
| Numbers not updating | Verify calculateMetrics() function |
| Colors wrong | Check CSS variables and Tailwind config |

---

## 📚 Related Documentation

- [Trading Hub Documentation](./TRADING_HUB_DOCUMENTATION.md)
- [Setup & Integration Guide](./SETUP_INTEGRATION_GUIDE.md)
- [Backend API Docs](./backend/README.md)
- [Component Storybook](./STORYBOOK.md) (if available)

---

**Last Updated**: 2024
**Version**: 1.0.0
