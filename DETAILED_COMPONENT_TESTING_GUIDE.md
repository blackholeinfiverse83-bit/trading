# Detailed Component Testing Guide
## Multi-Asset Trading Dashboard

**Generated:** 2025-12-29

This guide provides comprehensive testing instructions for all components, buttons, hooks, and backend integrations in the Trading Dashboard application.

---

## Test Prerequisites

1. ✅ Backend server running on `http://127.0.0.1:8000`
2. ✅ Frontend server running on `http://localhost:5173`
3. ✅ Browser developer tools open (F12) to monitor console errors
4. ✅ Network tab open to monitor API requests

---

## 1. Authentication & Layout Components

### 1.1 Login Page (`LoginPage.tsx`)

**Components to Test:**
- Login form
- Username input field
- Password input field
- Login button
- Signup link

**Hooks Used:**
- `useState` - form state management
- `useNavigate` - navigation
- `useAuth` - authentication context

**Test Steps:**
1. [ ] Navigate to `/login`
2. [ ] Enter username (any value if auth disabled)
3. [ ] Enter password (any value if auth disabled)
4. [ ] Click "Login" button
5. [ ] Verify redirect to dashboard
6. [ ] Check localStorage for token (if auth enabled)
7. [ ] Test signup link navigation

**Expected Behavior:**
- Form submission works
- Navigation occurs after login
- Error messages display if login fails
- Auto-redirect if already authenticated

---

### 1.2 Sidebar Component (`Sidebar.tsx`)

**Components to Test:**
- Dashboard navigation link
- Market Scan navigation link
- Portfolio navigation link
- Trading History navigation link
- Watch List navigation link
- Analytics navigation link
- Logout button
- Welcome message display

**Hooks Used:**
- `useLocation` - active route detection
- `useAuth` - user data and logout function
- `useTheme` - theme context

**Test Steps:**
1. [ ] Click each navigation link (6 total)
2. [ ] Verify correct page loads
3. [ ] Verify active page is highlighted
4. [ ] Click logout button
5. [ ] Verify redirect to login page
6. [ ] Verify token removed from localStorage
7. [ ] Check welcome message displays user name

**Expected Behavior:**
- All navigation links work
- Active page highlighted correctly
- Logout clears session and redirects
- Theme styling applied correctly

---

### 1.3 Navbar Component (`Navbar.tsx`)

**Components to Test:**
- Search input field
- Search suggestions dropdown
- Search submit button
- Stocks/Crypto/Commodities tab switcher
- Theme selector dropdown
- Theme change buttons (Light/Dark/Space)

**Hooks Used:**
- `useState` - search query, suggestions, theme menu
- `useRef` - DOM references
- `useEffect` - click outside handlers
- `useTheme` - theme context

**Test Steps:**
1. [ ] Type in search input field
2. [ ] Verify suggestions appear as you type
3. [ ] Click on a suggestion
4. [ ] Verify navigation to Market Scan page with query
5. [ ] Press Enter in search field
6. [ ] Switch between Stocks/Crypto/Commodities tabs
7. [ ] Click theme selector button
8. [ ] Change theme to Light
9. [ ] Change theme to Dark
10. [ ] Change theme to Space
11. [ ] Verify theme persists on page refresh

**Expected Behavior:**
- Search autocomplete works
- Suggestions filter correctly based on active tab
- Theme changes apply immediately
- Theme persists in localStorage
- Tab switching updates search suggestions

---

## 2. Dashboard Page (`DashboardPage.tsx`)

### Components & Buttons to Test:

1. **Refresh Button**
   - Location: Top right of page
   - Function: `loadDashboardData()`
   - Hook: `useState` for loading state

2. **Portfolio Stats Cards**
   - Portfolio Value card
   - Daily Change card
   - Total Gain card

3. **Top Performers Table**
   - Stock symbols
   - Predicted prices
   - Confidence scores
   - Actions (LONG/SHOLD/SELL)

4. **Chart Component**
   - Area chart with portfolio data
   - Responsive sizing
   - Tooltips on hover

### Hooks Used:
- `useState` - portfolioValue, dailyChange, topStocks, loading, error, healthStatus
- `useEffect` - initial data load, auto-refresh interval (60s)

### Backend API Calls:
- `stockAPI.scanAll()` - fetch top performers
- `stockAPI.health()` - system health status

### Test Steps:

1. **Initial Load:**
   - [ ] Navigate to `/dashboard`
   - [ ] Verify loading state displays
   - [ ] Verify data loads successfully
   - [ ] Check portfolio stats display correctly
   - [ ] Verify top performers table populated
   - [ ] Check chart renders with data

2. **Refresh Button:**
   - [ ] Click refresh button
   - [ ] Verify loading spinner appears
   - [ ] Verify data updates after refresh
   - [ ] Check "Last Updated" timestamp updates

3. **Error Handling:**
   - [ ] Stop backend server
   - [ ] Refresh dashboard
   - [ ] Verify error message displays
   - [ ] Click retry button (if available)
   - [ ] Start backend server
   - [ ] Verify data loads successfully

4. **Auto-refresh:**
   - [ ] Wait 60 seconds
   - [ ] Verify data refreshes automatically
   - [ ] Check console for API calls

5. **Backend Integration:**
   - [ ] Monitor Network tab
   - [ ] Verify `/tools/scan_all` endpoint called
   - [ ] Verify `/tools/health` endpoint called
   - [ ] Check response data structure matches expected format

---

## 3. Market Scan Page (`MarketScanPage.tsx`)

### Components & Buttons to Test:

1. **Search Input Field**
   - Function: `handleSearch()`
   - Hook: `useState` for searchQuery

2. **Search Button**
   - Function: `handleSearch()`
   - Triggers: `stockAPI.predict()`

3. **Horizon Selector Dropdown**
   - Options: intraday, short, long
   - Hook: `useState` for horizon
   - Function: `setHorizon()`

4. **Deep Analyze Button**
   - Function: `handleAnalyze()`
   - API: `stockAPI.analyze()`
   - Displays: Analysis results modal/section

5. **Feedback Button** (on each prediction)
   - Function: Opens feedback modal
   - Hook: `setShowFeedbackModal(true)`, `setSelectedPrediction()`

6. **Feedback Modal:**
   - Correct button: `handleFeedback('correct')`
   - Incorrect button: `handleFeedback('incorrect')`
   - API: `stockAPI.feedback()`

7. **Chart Toggle Button**
   - Function: `setShowChart(true)`, `setChartSymbol()`
   - Displays: CandlestickChart component

8. **Expand/Collapse Prediction Details**
   - Function: `setExpandedPredictions()`
   - Shows: Detailed prediction information

9. **Asset Type View Switcher**
   - StocksView component
   - CryptoView component
   - CommoditiesView component
   - Hook: `useAssetType()` context

### Hooks Used:
- `useState` - searchQuery, predictions, loading, error, horizon, analyzeResults, showFeedbackModal, expandedPredictions, showChart
- `useEffect` - URL parameter loading, asset type changes
- `useSearchParams` - URL query parameters
- `useAssetType` - active asset type context

### Backend API Calls:
- `stockAPI.predict()` - single symbol search
- `stockAPI.analyze()` - deep analysis
- `stockAPI.feedback()` - submit feedback

### Test Steps:

1. **Single Symbol Search:**
   - [ ] Navigate to `/market-scan`
   - [ ] Enter "AAPL" in search field
   - [ ] Select "intraday" horizon
   - [ ] Click Search button
   - [ ] Verify loading state
   - [ ] Verify prediction results display
   - [ ] Check symbol, action, price, confidence displayed

2. **Horizon Selection:**
   - [ ] Change horizon to "short"
   - [ ] Search for same symbol
   - [ ] Verify different predictions returned
   - [ ] Change horizon to "long"
   - [ ] Verify predictions match horizon

3. **Deep Analyze:**
   - [ ] Enter a symbol (e.g., "TSLA")
   - [ ] Click "Deep Analyze" button
   - [ ] Verify loading state
   - [ ] Check analysis results display
   - [ ] Verify consensus and confidence metrics shown

4. **Feedback Submission:**
   - [ ] Find a prediction in results
   - [ ] Click "Feedback" button
   - [ ] Verify modal opens
   - [ ] Click "Correct" button
   - [ ] Verify success message
   - [ ] Verify modal closes
   - [ ] Repeat with "Incorrect" button
   - [ ] Check Network tab for `/tools/feedback` API call

5. **Chart Display:**
   - [ ] Click chart icon/button on a prediction
   - [ ] Verify chart displays
   - [ ] Verify correct symbol loaded in chart
   - [ ] Test chart interactions (zoom, pan if available)

6. **Expand/Collapse:**
   - [ ] Click expand button on a prediction
   - [ ] Verify detailed information shows
   - [ ] Click collapse button
   - [ ] Verify details hidden

7. **Asset Type Switching:**
   - [ ] Switch to Stocks tab
   - [ ] Verify StocksView component loads
   - [ ] Switch to Crypto tab
   - [ ] Verify CryptoView component loads
   - [ ] Switch to Commodities tab
   - [ ] Verify CommoditiesView component loads

8. **URL Parameters:**
   - [ ] Navigate to `/market-scan?q=AAPL&type=stocks`
   - [ ] Verify search query pre-filled
   - [ ] Verify search executes automatically
   - [ ] Verify correct asset type selected

9. **Error Handling:**
   - [ ] Search for invalid symbol (e.g., "INVALID123")
   - [ ] Verify error message displays
   - [ ] Stop backend server
   - [ ] Try to search
   - [ ] Verify connection error message

10. **Backend Integration:**
    - [ ] Monitor Network tab during search
    - [ ] Verify `/tools/predict` endpoint called with correct payload
    - [ ] Check response structure: `{ metadata, predictions }`
    - [ ] Verify error handling for failed predictions

---

## 4. Portfolio Page (`PortfolioPage.tsx`)

### Components & Buttons to Test:

1. **Add Position Button**
   - Function: `setShowAddModal(true)`
   - Opens: Add Position Modal

2. **Add Position Modal:**
   - Symbol input field
   - Shares input field
   - Average Price input field
   - Add button: `handleAddPosition()`
   - Cancel button: `setShowAddModal(false)`

3. **Buy Button** (for existing positions)
   - Function: Opens modal with pre-filled data
   - Updates: Shares count and average price

4. **Sell Button** (for existing positions)
   - Function: `onClick` handler decreases shares by 1
   - Updates: Portfolio value
   - Removes: Position if shares reach 0

5. **Remove Button**
   - Function: `removePosition(index)`
   - Removes: Position from portfolio
   - Updates: Portfolio totals

6. **Portfolio Table**
   - Displays: Symbol, Shares, Avg Price, Current Price, Value, Gain/Loss
   - Updates: Real-time price updates

### Hooks Used:
- `useState` - holdings, loading, totalValue, totalGain, showAddModal, newPosition
- `useEffect` - initial portfolio load

### Backend API Calls:
- `stockAPI.predict()` - fetch real-time prices for holdings

### LocalStorage:
- `portfolio_holdings` - stores portfolio data

### Test Steps:

1. **Add New Position:**
   - [ ] Navigate to `/portfolio`
   - [ ] Click "Add Position" button
   - [ ] Verify modal opens
   - [ ] Enter: Symbol "AAPL", Shares "10", Avg Price "150"
   - [ ] Click "Add" button
   - [ ] Verify position appears in table
   - [ ] Verify totals update correctly
   - [ ] Check localStorage for saved data

2. **Buy More Shares:**
   - [ ] Find existing position
   - [ ] Click "Buy" button
   - [ ] Verify modal opens with pre-filled data
   - [ ] Modify shares or price
   - [ ] Click "Add"
   - [ ] Verify position updates
   - [ ] Verify average price recalculated correctly
   - [ ] Verify totals update

3. **Sell Shares:**
   - [ ] Find position with multiple shares
   - [ ] Click "Sell" button
   - [ ] Verify shares decrease by 1
   - [ ] Verify value updates
   - [ ] Verify position remains if shares > 0
   - [ ] Test with 1 share - verify position removed

4. **Remove Position:**
   - [ ] Click "Remove" button on a position
   - [ ] Verify position disappears
   - [ ] Verify totals recalculate
   - [ ] Check localStorage updated

5. **Real-time Price Updates:**
   - [ ] Add multiple positions
   - [ ] Verify current prices load from backend
   - [ ] Verify Gain/Loss calculations correct
   - [ ] Monitor Network tab for API calls
   - [ ] Check `/tools/predict` endpoint called with correct symbols

6. **Empty State:**
   - [ ] Remove all positions
   - [ ] Verify "No holdings found" message
   - [ ] Verify totals show $0

7. **Persistence:**
   - [ ] Add positions
   - [ ] Refresh page
   - [ ] Verify positions persist
   - [ ] Verify prices reload

8. **Backend Integration:**
   - [ ] Monitor Network tab
   - [ ] Verify `/tools/predict` called with portfolio symbols
   - [ ] Check response structure matches expected format
   - [ ] Verify error handling if backend unavailable

---

## 5. Watch List Page (`WatchListPage.tsx`)

### Components & Buttons to Test:

1. **Add Symbol Input Field**
   - Hook: `useState` for newSymbol
   - Function: `addToWatchlist()`

2. **Add Button**
   - Function: `addToWatchlist()`
   - Validates: Symbol not already in list

3. **Remove Button** (X icon)
   - Function: `removeFromWatchlist(symbol)`
   - Updates: Watchlist state and localStorage

4. **Quick Add Buttons**
   - Pre-defined popular symbols
   - Function: Adds symbol to watchlist
   - Disables: If already in watchlist

5. **Watchlist Table**
   - Displays: Symbol, Prediction, Confidence, Action
   - Updates: Auto-refresh on watchlist changes

### Hooks Used:
- `useState` - watchlist, predictions, loading, newSymbol
- `useEffect` - save to localStorage, load predictions when watchlist changes

### Backend API Calls:
- `stockAPI.predict()` - fetch predictions for watchlist symbols

### LocalStorage:
- `watchlist` - stores watchlist symbols

### Test Steps:

1. **Add Symbol:**
   - [ ] Navigate to `/watchlist`
   - [ ] Enter "TSLA" in input field
   - [ ] Click "Add" button
   - [ ] Verify symbol appears in watchlist
   - [ ] Verify prediction loads automatically
   - [ ] Check localStorage for saved symbol

2. **Remove Symbol:**
   - [ ] Click X button on a symbol
   - [ ] Verify symbol removed from list
   - [ ] Verify prediction removed
   - [ ] Check localStorage updated

3. **Quick Add:**
   - [ ] Click on a quick add button (e.g., "AAPL")
   - [ ] Verify symbol added to watchlist
   - [ ] Verify button becomes disabled
   - [ ] Click disabled button - verify no action

4. **Duplicate Prevention:**
   - [ ] Try to add same symbol twice
   - [ ] Verify error message or no action
   - [ ] Verify symbol only appears once

5. **Auto-refresh:**
   - [ ] Add multiple symbols
   - [ ] Verify predictions load for all
   - [ ] Modify watchlist
   - [ ] Verify predictions update automatically

6. **Persistence:**
   - [ ] Add symbols to watchlist
   - [ ] Refresh page
   - [ ] Verify watchlist persists
   - [ ] Verify predictions reload

7. **Empty State:**
   - [ ] Remove all symbols
   - [ ] Verify empty state message
   - [ ] Verify no API calls made

8. **Backend Integration:**
   - [ ] Monitor Network tab
   - [ ] Verify `/tools/predict` called with watchlist symbols
   - [ ] Check response structure
   - [ ] Verify error handling

---

## 6. Analytics Page (`AnalyticsPage.tsx`)

### Components & Buttons to Test:

1. **Period Selector Dropdown**
   - Options: 7d, 30d, 90d, 1y, All
   - Hook: `useState` for period
   - Function: Filters analytics data

2. **Signal Distribution Chart** (Pie Chart)
   - Displays: Buy/Sell/Hold distribution
   - Colors: Green (Buy), Red (Sell), Yellow (Hold)

3. **Performance Trend Chart** (Bar/Line Chart)
   - Displays: Performance over time
   - Tooltips: On hover

4. **Analytics Cards**
   - Total Signals
   - Average Confidence
   - Success Rate (if available)

### Hooks Used:
- `useState` - analytics, loading, error, period
- `useEffect` - load analytics data when period changes

### Backend API Calls:
- May use portfolio/watchlist data or dedicated analytics endpoint

### Test Steps:

1. **Initial Load:**
   - [ ] Navigate to `/analytics`
   - [ ] Verify loading state
   - [ ] Verify charts render
   - [ ] Check data displays correctly

2. **Period Filter:**
   - [ ] Change period to "7d"
   - [ ] Verify data updates
   - [ ] Change period to "30d"
   - [ ] Verify charts update
   - [ ] Test all period options

3. **Chart Interactions:**
   - [ ] Hover over pie chart segments
   - [ ] Verify tooltips display
   - [ ] Hover over bar chart bars
   - [ ] Verify data displays in tooltip

4. **Data Accuracy:**
   - [ ] Verify percentages add up to 100%
   - [ ] Check color coding correct
   - [ ] Verify chart legends display

5. **Empty State:**
   - [ ] Clear portfolio/watchlist
   - [ ] Navigate to analytics
   - [ ] Verify appropriate empty state message

6. **Backend Integration:**
   - [ ] Monitor Network tab
   - [ ] Verify API calls made correctly
   - [ ] Check response data structure

---

## 7. Trading History Page (`TradingHistoryPage.tsx`)

### Components & Buttons to Test:

1. **History Table**
   - Displays: Date, Symbol, Action, Price, Quantity
   - Sorted: By date (newest first)

2. **Filter Controls** (if implemented)
   - Date range selector
   - Symbol filter

### Hooks Used:
- `useState` - history data
- `useEffect` - load history

### LocalStorage/Backend:
- May use localStorage or backend API

### Test Steps:

1. **View History:**
   - [ ] Navigate to `/trading-history`
   - [ ] Verify history table displays
   - [ ] Check data loads correctly

2. **Data Accuracy:**
   - [ ] Perform trades in Portfolio
   - [ ] Navigate to Trading History
   - [ ] Verify trades appear in history

3. **Sorting:**
   - [ ] Verify newest trades appear first
   - [ ] Check date formatting correct

---

## 8. Layout Components

### 8.1 Layout Component (`Layout.tsx`)

**Components to Test:**
- Sidebar rendering
- Navbar rendering
- Main content area
- FloatingAIButton component
- Theme background (UniGuruBackground)

**Hooks Used:**
- `useAssetType` - asset type context
- `useTheme` - theme context
- `useNavigate` - navigation
- `useState` - force update on theme change
- `useEffect` - theme change listener

**Test Steps:**
- [ ] Verify layout renders correctly
- [ ] Check sidebar and navbar display
- [ ] Verify children content renders
- [ ] Test theme changes reflect in layout

---

### 8.2 Floating AI Button (`FloatingAIButton.tsx`)

**Components to Test:**
- Floating button (bottom right)
- Click handler: `setIsOpen(true)`
- Hover effects
- AI Chat Panel component

**Hooks Used:**
- `useState` - isOpen, isHovered, imageError

**Test Steps:**
1. [ ] Verify button displays (bottom right corner)
2. [ ] Hover over button
3. [ ] Verify tooltip appears
4. [ ] Click button
5. [ ] Verify AI Chat Panel opens
6. [ ] Test close button in chat panel
7. [ ] Verify button image loads (jarvis-logo.png)

---

### 8.3 AI Chat Panel (`AIChatPanel.tsx`)

**Components to Test:**
- Chat message list
- Input field
- Send button
- Close/Minimize buttons
- Message rendering

**Hooks Used:**
- `useState` - messages, input, isLoading
- `useRef` - message container, input field
- `useEffect` - auto-scroll, focus input

**Test Steps:**
1. [ ] Open chat panel
2. [ ] Type a message
3. [ ] Click Send button or press Enter
4. [ ] Verify message appears in chat
5. [ ] Verify auto-scroll to bottom
6. [ ] Test close button
7. [ ] Test minimize button
8. [ ] Verify placeholder response (backend not implemented)

---

## 9. Context Providers

### 9.1 AuthContext (`AuthContext.tsx`)

**Functions to Test:**
- `login()` - authentication
- `logout()` - clear session
- `isAuthenticated` - auth state

**Test Steps:**
- [ ] Verify login function works
- [ ] Verify logout clears token
- [ ] Check authentication state updates
- [ ] Verify token stored in localStorage

---

### 9.2 ThemeContext (`ThemeContext.tsx`)

**Functions to Test:**
- `setTheme()` - change theme
- `theme` - current theme

**Test Steps:**
- [ ] Change theme via context
- [ ] Verify theme persists in localStorage
- [ ] Check theme applies to all components
- [ ] Test all three themes (light, dark, space)

---

### 9.3 AssetTypeContext (`AssetTypeContext.tsx`)

**Functions to Test:**
- `setAssetType()` - change asset type
- `assetType` - current asset type

**Test Steps:**
- [ ] Switch asset types
- [ ] Verify context updates
- [ ] Check components react to changes
- [ ] Test all three types (stocks, crypto, commodities)

---

## 10. Error Handling Tests

### General Error Handling:

1. **Backend Unavailable:**
   - [ ] Stop backend server
   - [ ] Perform actions that require backend
   - [ ] Verify error messages display
   - [ ] Check error messages are user-friendly

2. **Network Timeout:**
   - [ ] Simulate slow network (Chrome DevTools)
   - [ ] Perform API calls
   - [ ] Verify timeout handling
   - [ ] Check retry options (if available)

3. **Invalid Data:**
   - [ ] Enter invalid symbols
   - [ ] Verify error handling
   - [ ] Check no crashes occur

4. **Rate Limiting:**
   - [ ] Make rapid API calls
   - [ ] Verify rate limit error handling
   - [ ] Check retry after message

---

## 11. Performance Tests

1. **Page Load:**
   - [ ] Initial page load < 3 seconds
   - [ ] Navigation is instant
   - [ ] No lag when typing

2. **API Response:**
   - [ ] Predictions load within 10-30 seconds
   - [ ] Loading indicators show
   - [ ] App remains responsive

3. **Memory Leaks:**
   - [ ] Navigate between pages multiple times
   - [ ] Check for memory leaks in DevTools
   - [ ] Verify cleanup in useEffect hooks

---

## 12. Browser Compatibility

Test in multiple browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if available)

For each browser:
- [ ] All features work
- [ ] No console errors
- [ ] Responsive design works
- [ ] Charts render correctly

---

## 13. Responsive Design

1. **Mobile View (< 768px):**
   - [ ] Layout adapts correctly
   - [ ] All buttons accessible
   - [ ] Tables scroll horizontally
   - [ ] Navigation menu works

2. **Tablet View (768px - 1024px):**
   - [ ] Layout optimal
   - [ ] All features usable
   - [ ] Charts sized correctly

3. **Desktop View (> 1024px):**
   - [ ] Full layout displays
   - [ ] All features accessible
   - [ ] Optimal use of space

---

## Summary Checklist

### Critical Tests (Must Pass):
- [ ] All backend endpoints respond correctly
- [ ] All navigation links work
- [ ] Search functionality works
- [ ] Portfolio add/remove works
- [ ] Watchlist add/remove works
- [ ] Data persists in localStorage
- [ ] Error handling works
- [ ] Backend integration successful

### Important Tests (Should Pass):
- [ ] Charts render correctly
- [ ] Theme switching works
- [ ] Responsive design works
- [ ] Loading states display
- [ ] Auto-refresh works

### Nice-to-Have Tests:
- [ ] Performance optimal
- [ ] Cross-browser compatible
- [ ] Accessibility features work
- [ ] Animation smooth

---

## Test Report Template

After completing tests, fill out:

```
Component: [Component Name]
Status: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
Issues Found: [List any issues]
Backend Integration: ✅ / ❌
Notes: [Additional notes]
```

---

**End of Testing Guide**

For automated test results, see: `COMPREHENSIVE_TEST_REPORT.md`

