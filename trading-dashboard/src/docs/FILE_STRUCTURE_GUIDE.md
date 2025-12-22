# TradeAI Dashboard - Complete File Structure Guide

This document lists all 80+ files you need to copy from Figma Make to your local VS Code project.

## 📋 Quick Start Instructions

1. In VS Code, create these folders if they don't exist:
   - `/src`
   - `/components`
   - `/components/ui`
   - `/components/figma`
   - `/components/pages`
   - `/styles`
   - `/guidelines`

2. Copy each file below from Figma Make to your VS Code project
3. Maintain the exact same file paths
4. Run `npm install` then `npm run dev`

---

## 🔧 Configuration Files (Root Level)

### package.json
**Location**: `/package.json`
**Purpose**: Dependencies and project configuration
**Key Dependencies**:
- react, react-dom (^18.2.0)
- axios (^1.6.2) - For API calls
- motion (^10.16.4) - Framer Motion for animations
- recharts (^2.10.3) - For trading charts
- lucide-react (^0.300.0) - Icon library
- sonner (^1.2.3) - Toast notifications
- Tailwind CSS v4.0

### vite.config.ts
**Location**: `/vite.config.ts`
**Purpose**: Vite bundler configuration
**Features**: 
- Path aliases (@/ for src/)
- Dev server on port 3000
- Auto-open browser

### tsconfig.json
**Location**: `/tsconfig.json`
**Purpose**: TypeScript configuration
**Settings**: Strict mode, path aliases

### tsconfig.node.json
**Location**: `/tsconfig.node.json`
**Purpose**: TypeScript config for Node.js files

### index.html
**Location**: `/index.html`
**Purpose**: HTML entry point
**Title**: TradeAI Dashboard - Professional Multi-Asset Trading Interface

---

## 🎨 Styles

### styles/globals.css
**Location**: `/styles/globals.css`
**Purpose**: Global CSS with Tailwind v4, theme tokens, and typography
**Size**: 190 lines
**Features**:
- Dark theme variables
- Custom color tokens for charts
- Typography system (h1-h4, p, button, input)
- Sidebar tokens

---

## ⚛️ Main Application Files

### src/main.tsx
**Location**: `/src/main.tsx`
**Purpose**: React entry point, renders App component
**Imports**: App.tsx and globals.css

### App.tsx
**Location**: `/App.tsx`
**Purpose**: Main dashboard layout component with navigation and routing
**Size**: 100+ lines
**Layout**:
- Sidebar navigation (collapsible)
- Page routing system (Dashboard, Market, Portfolio, etc.)
- Header with market status and account value
- Dynamic page rendering based on navigation

---

## 🧭 Navigation & Layout Components (NEW)

### components/Sidebar.tsx
**Location**: `/components/Sidebar.tsx`
**Size**: 120 lines
**Purpose**: Collapsible sidebar navigation
**Features**:
- TradeX Pro branding
- 8 navigation items (Dashboard, Market, Portfolio, History, Predictions, Watchlist, Test, Chart)
- Active state highlighting
- User profile section with avatar
- Collapse/expand toggle
- Logout button
- Smooth transitions

### components/pages/DashboardPage.tsx
**Location**: `/components/pages/DashboardPage.tsx`
**Size**: 35 lines
**Purpose**: Main dashboard page container
**Components**:
- TradingChart (9 cols) + InputPanel (3 cols)
- LivePredictionsFeed (4 cols) + ExecutionConsole (5 cols) + ChatPanel (3 cols)

### components/pages/MarketPage.tsx
**Location**: `/components/pages/MarketPage.tsx`
**Size**: 180 lines
**Purpose**: Stock market explorer with live data
**Features**:
- Search functionality for stocks
- Real-time stock table (Symbol, Name, Price, Change, Volume)
- Color-coded price changes (green/red)
- Trade buttons for each stock
- Animated row entries
- Mock data for 8+ stocks (AAPL, GOOGL, MSFT, TSLA, etc.)

**Data Structure**:
```typescript
interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
}
```

### components/pages/PortfolioPage.tsx
**Location**: `/components/pages/PortfolioPage.tsx`
**Size**: 210 lines
**Purpose**: Portfolio tracking and performance monitoring
**Features**:
- Portfolio summary cards (Total Invested, Current Value, Total P&L)
- Holdings table with detailed position data
- P&L tracking per holding
- Average price vs. current price comparison
- Trade buttons for each position
- Animated stats cards

**Data Structure**:
```typescript
interface Holding {
  stock: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalCost: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
}
```

### components/pages/ComingSoonPage.tsx
**Location**: `/components/pages/ComingSoonPage.tsx`
**Size**: 45 lines
**Purpose**: Placeholder for upcoming features
**Used for**: History, Predictions, Watchlist, Test, Chart pages
**Features**:
- Animated icon display
- Custom title and description
- Loading animation
- Gradient background

---

## 🧩 Main Components (5 Files)

### components/LivePredictionsFeed.tsx
**Location**: `/components/LivePredictionsFeed.tsx`
**Size**: 143 lines
**Purpose**: Real-time AI trading signals feed
**API Endpoint**: `/feed/live` (currently mocked)
**Features**:
- Live predictions with confidence scores
- Long/short indicators
- Entry price display
- Auto-refresh every 5 seconds
- Framer Motion animations

**Data Structure**:
```typescript
interface Prediction {
  id: string;
  asset: string;
  symbol: string;
  direction: 'long' | 'short';
  confidence: number;
  entryPrice: number;
  timestamp: string;
  timeframe: string;
}
```

### components/ExecutionConsole.tsx
**Location**: `/components/ExecutionConsole.tsx`
**Size**: 208 lines
**Purpose**: AI decision log and trade execution history
**Features**:
- Entry/exit events
- Analysis notifications
- Alert system
- P&L tracking
- Status indicators (success/pending/failed)
- Auto-updates with new events

**Data Structure**:
```typescript
interface ExecutionEvent {
  id: string;
  timestamp: string;
  type: 'entry' | 'exit' | 'analysis' | 'alert';
  status: 'success' | 'pending' | 'failed';
  asset: string;
  action: string;
  details: string;
  price?: number;
  pnl?: number;
}
```

### components/InputPanel.tsx
**Location**: `/components/InputPanel.tsx`
**Size**: 169 lines
**Purpose**: Trade parameter configuration panel
**API Endpoint**: `/tools/confirm` (currently mocked)
**Features**:
- Trade amount input
- Stop-loss slider (0.5% - 10%)
- Target profit slider (1% - 20%)
- Aggressive risk mode toggle
- Risk/Reward calculator
- Toast notifications on confirm

### components/ChatPanel.tsx
**Location**: `/components/ChatPanel.tsx`
**Size**: 197 lines
**Purpose**: Uniguru AI trading assistant chatbot
**API Endpoint**: `/chat/query` (currently mocked)
**Features**:
- Chat interface with user/assistant messages
- Typing indicator animation
- Auto-scroll to latest message
- Enter to send
- Mock AI responses about market analysis

**Data Structure**:
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
```

### components/TradingChart.tsx
**Location**: `/components/TradingChart.tsx`
**Size**: 443 lines
**Purpose**: Advanced trading chart with candlesticks, volume, and indicators
**Features**:
- Price action chart with moving averages (MA7, MA25)
- Technical indicators tab (RSI, MACD, Bollinger)
- Volume analysis tab
- Multiple timeframes (15M, 1H, 4H, 1D)
- Asset switcher (BTC/USDT, ETH/USDT, SPX)
- Custom candlestick component
- Recharts library integration

**Data Structure**:
```typescript
interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma7: number;
  ma25: number;
}
```

---

## 🎨 UI Components (47 Files in /components/ui/)

All UI components are production-ready Shadcn-style components with Tailwind CSS styling.

### Form Components
1. `input.tsx` - Text input field
2. `textarea.tsx` - Multi-line text input
3. `label.tsx` - Form labels
4. `checkbox.tsx` - Checkbox input
5. `radio-group.tsx` - Radio button groups
6. `switch.tsx` - Toggle switch
7. `slider.tsx` - Range slider
8. `select.tsx` - Dropdown select
9. `form.tsx` - Form wrapper with validation
10. `input-otp.tsx` - OTP input fields

### Layout Components
11. `card.tsx` - Card container
12. `separator.tsx` - Divider line
13. `tabs.tsx` - Tab navigation
14. `accordion.tsx` - Collapsible sections
15. `collapsible.tsx` - Expandable content
16. `scroll-area.tsx` - Custom scrollable area
17. `resizable.tsx` - Resizable panels
18. `aspect-ratio.tsx` - Aspect ratio container
19. `sidebar.tsx` - Sidebar navigation

### Navigation Components
20. `navigation-menu.tsx` - Navigation menu
21. `menubar.tsx` - Menu bar
22. `breadcrumb.tsx` - Breadcrumb navigation
23. `pagination.tsx` - Pagination controls

### Overlay Components
24. `dialog.tsx` - Modal dialog
25. `alert-dialog.tsx` - Alert/confirm dialog
26. `sheet.tsx` - Slide-out panel
27. `drawer.tsx` - Bottom drawer
28. `popover.tsx` - Popover overlay
29. `tooltip.tsx` - Tooltip component
30. `hover-card.tsx` - Hover card
31. `context-menu.tsx` - Right-click menu
32. `dropdown-menu.tsx` - Dropdown menu

### Feedback Components
33. `alert.tsx` - Alert messages
34. `badge.tsx` - Badge/tag component
35. `progress.tsx` - Progress bar
36. `skeleton.tsx` - Loading skeleton
37. `sonner.tsx` - Toast notifications
38. `avatar.tsx` - User avatar

### Interactive Components
39. `button.tsx` - Button component
40. `toggle.tsx` - Toggle button
41. `toggle-group.tsx` - Toggle button group
42. `command.tsx` - Command palette
43. `calendar.tsx` - Date picker calendar
44. `carousel.tsx` - Image carousel
45. `chart.tsx` - Chart configuration
46. `table.tsx` - Data table

### Utilities
47. `use-mobile.ts` - Hook for mobile detection
48. `utils.ts` - Utility functions (cn, etc.)

---

## 🖼️ Protected System Component

### components/figma/ImageWithFallback.tsx
**Location**: `/components/figma/ImageWithFallback.tsx`
**Purpose**: Image component with fallback support
**Status**: ⚠️ PROTECTED - Do NOT modify or copy this file
**Note**: This file is auto-generated by Figma Make

---

## 📚 Documentation Files (12 Files)

All documentation files are in the root directory:

1. **README.md** - Main project documentation
2. **START_HERE.md** - Quick start guide
3. **INSTALLATION.md** - Installation instructions
4. **QUICK_START.md** - Quick start tutorial
5. **PROJECT_STRUCTURE.md** - File structure overview
6. **FILE_MANIFEST.md** - Complete file listing
7. **DOWNLOAD_INSTRUCTIONS.md** - How to download project
8. **FRONTEND_UPDATE_GUIDE.md** - Frontend update instructions
9. **BACKEND_INTEGRATION.md** - API integration guide for Krishna
10. **COMMANDS.md** - Useful command reference
11. **Attributions.md** - Credits and licenses
12. **guidelines/Guidelines.md** - Development guidelines

---

## 🔌 API Integration Points

### Current Mock Data (Replace with Real APIs)

1. **Live Predictions Feed**
   - Endpoint: `GET /feed/live`
   - Component: `LivePredictionsFeed.tsx`
   - Update: Line 24

2. **Trade Parameters Confirmation**
   - Endpoint: `POST /tools/confirm`
   - Component: `InputPanel.tsx`
   - Update: Lines 23-28

3. **AI Chat Query**
   - Endpoint: `POST /chat/query`
   - Component: `ChatPanel.tsx`
   - Update: Lines 52-53

---

## ✅ Verification Checklist

After copying all files, verify:

- [ ] All 80+ files copied to correct locations
- [ ] `package.json` exists in root
- [ ] All config files (tsconfig, vite.config) present
- [ ] `/src/main.tsx` exists
- [ ] `/App.tsx` exists in root
- [ ] All 5 main components in `/components/`
- [ ] Navigation components: Sidebar.tsx in `/components/`
- [ ] All 4 page components in `/components/pages/`
- [ ] All 48 UI components in `/components/ui/`
- [ ] `/styles/globals.css` exists
- [ ] `/index.html` exists
- [ ] Run `npm install` successfully
- [ ] Run `npm run dev` and see dashboard at http://localhost:3000
- [ ] Test navigation between pages
- [ ] Verify sidebar collapse/expand functionality

---

## 🚀 Next Steps After Copying

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **When Krishna provides APIs**, update these files:
   - `LivePredictionsFeed.tsx` - Line 24
   - `InputPanel.tsx` - Lines 23-28
   - `ChatPanel.tsx` - Lines 52-53

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📦 File Count Summary

- **Config Files**: 5
- **Style Files**: 1
- **Main App Files**: 2
- **Main Components**: 5
- **Navigation Components**: 1 (Sidebar)
- **Page Components**: 4 (Dashboard, Market, Portfolio, ComingSoon)
- **UI Components**: 48
- **Protected Components**: 1
- **Documentation**: 12
- **Total**: 79 files

---

## 🎯 Important Notes

1. **Do NOT modify** `/components/figma/ImageWithFallback.tsx`
2. **All mock data** is ready to be replaced with real API calls
3. **Axios is configured** and ready for backend integration
4. **Environment** uses Vite + React + TypeScript + Tailwind v4
5. **Port**: Development server runs on http://localhost:3000
6. **New Features Added**:
   - ✅ Collapsible sidebar navigation with TradeX Pro branding
   - ✅ Market page with searchable stock table
   - ✅ Portfolio page with P&L tracking
   - ✅ Coming Soon placeholders for future pages
   - ✅ Account value display in header
   - ✅ Market open/closed status indicator

---

Generated: December 18, 2025
Project: TradeAI Dashboard v1.0.0
Environment: Figma Make → VS Code Migration