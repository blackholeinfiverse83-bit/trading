# Frontend-Backend Integration Test Checklist

## Prerequisites

1. ✅ Backend server running on `http://127.0.0.1:8000`
2. ✅ Frontend server running (usually `http://localhost:5173`)
3. ✅ Browser developer tools open (F12)

## Authentication Tests

### Test 1: Open Access Mode (Auth Disabled)
- [ ] Visit login page
- [ ] Should see message about open access mode
- [ ] Can use any credentials or skip login
- [ ] Should auto-redirect to dashboard
- [ ] Sidebar shows "Welcome, anonymous"

### Test 2: Authentication (if enabled)
- [ ] Visit login page
- [ ] Enter credentials: admin / admin123
- [ ] Should successfully login
- [ ] Token stored in localStorage
- [ ] Redirected to dashboard

### Test 3: Logout
- [ ] Click logout button in sidebar
- [ ] Should redirect to login page
- [ ] Token removed from localStorage

## Dashboard Page Tests

### Test 4: Load Dashboard Data
- [ ] Navigate to Dashboard
- [ ] Should show loading state
- [ ] Top performers should load from backend
- [ ] Portfolio stats should display
- [ ] Charts should render

### Test 5: Retry on Error
- [ ] Stop backend server
- [ ] Refresh dashboard
- [ ] Should show error message
- [ ] Click retry button
- [ ] Start backend server
- [ ] Should reload data successfully

## Market Scan Page Tests

### Test 6: Single Stock Search
- [ ] Navigate to Market Scan
- [ ] Enter "AAPL" in search box
- [ ] Select "intraday" horizon
- [ ] Click Search button
- [ ] Should show prediction for AAPL
- [ ] Should display: symbol, action, price, confidence

### Test 7: Batch Scan
- [ ] Select multiple stocks (AAPL, GOOGL, MSFT)
- [ ] Click "Scan X Selected Stocks"
- [ ] Should show predictions for all selected stocks
- [ ] Results should be sorted by confidence

### Test 8: Deep Analysis
- [ ] Enter a symbol (e.g., "AAPL")
- [ ] Click "Deep Analyze" button
- [ ] Should show analysis summary
- [ ] Should display consensus and confidence metrics

### Test 9: Feedback Submission
- [ ] Find a prediction in results
- [ ] Click "Feedback" button
- [ ] Modal should open
- [ ] Click "Correct" or "Incorrect"
- [ ] Should submit successfully
- [ ] Should show success message

### Test 10: Horizon Selection
- [ ] Change horizon dropdown
- [ ] Search same symbol with different horizon
- [ ] Should return different predictions
- [ ] Results should match selected horizon

## Portfolio Page Tests

### Test 11: Add Position
- [ ] Navigate to Portfolio
- [ ] Click "Add Position" button
- [ ] Modal should open
- [ ] Enter: Symbol (AAPL), Shares (10), Avg Price (150)
- [ ] Click "Add"
- [ ] Position should appear in table
- [ ] Totals should update

### Test 12: Remove Position
- [ ] Find a position in table
- [ ] Click "Remove" button
- [ ] Position should disappear
- [ ] Totals should update

### Test 13: Buy More Shares
- [ ] Find a position
- [ ] Click "Buy" button
- [ ] Modal should open with pre-filled data
- [ ] Modify shares or price
- [ ] Click "Add"
- [ ] Position should update

### Test 14: Sell Shares
- [ ] Find a position with multiple shares
- [ ] Click "Sell" button
- [ ] Shares should decrease by 1
- [ ] Value should update
- [ ] If shares = 1, should remove position

### Test 15: Real-time Price Updates
- [ ] Add positions
- [ ] Page should fetch real-time prices
- [ ] Current prices should update
- [ ] Gain/Loss should calculate correctly

## Watch List Page Tests

### Test 16: Add to Watch List
- [ ] Navigate to Watch List
- [ ] Enter symbol in input (e.g., "TSLA")
- [ ] Click "Add" or press Enter
- [ ] Symbol should appear in watchlist
- [ ] Should fetch prediction automatically

### Test 17: Remove from Watch List
- [ ] Find a stock in watchlist
- [ ] Click X button
- [ ] Stock should be removed
- [ ] Should disappear from list

### Test 18: Quick Add
- [ ] Click on quick add buttons
- [ ] Stocks should be added to watchlist
- [ ] Already added stocks should be disabled

### Test 19: Persistent Storage
- [ ] Add stocks to watchlist
- [ ] Refresh page
- [ ] Watchlist should persist
- [ ] Predictions should reload

## Analytics Page Tests

### Test 20: Load Analytics
- [ ] Navigate to Analytics
- [ ] Should show loading state
- [ ] Analytics data should load
- [ ] Charts should render

### Test 21: Signal Distribution Chart
- [ ] Pie chart should show Buy/Sell/Hold distribution
- [ ] Colors should be correct (green/red/yellow)
- [ ] Percentages should be accurate

### Test 22: Performance Trend
- [ ] Bar chart should display
- [ ] Data should be formatted correctly
- [ ] Tooltips should work on hover

### Test 23: Period Filter
- [ ] Change period dropdown
- [ ] Should reload analytics
- [ ] Charts should update

## Navigation Tests

### Test 24: Sidebar Navigation
- [ ] Click each menu item
- [ ] Should navigate to correct page
- [ ] Active state should highlight current page

### Test 25: Navbar Search
- [ ] Type in navbar search
- [ ] Autocomplete should appear
- [ ] Select a suggestion
- [ ] Should navigate to Market Scan with query

### Test 26: Tab Switching
- [ ] Click Stocks/Crypto/Commodities tabs
- [ ] Should change active tab
- [ ] (Note: Currently visual only, functionality can be added)

## Error Handling Tests

### Test 27: Backend Unavailable
- [ ] Stop backend server
- [ ] Try to search for stock
- [ ] Should show error message
- [ ] Message should be user-friendly

### Test 28: Invalid Symbol
- [ ] Enter invalid symbol (e.g., "INVALID")
- [ ] Should show appropriate error
- [ ] Should not crash

### Test 29: Network Timeout
- [ ] Simulate slow network (Chrome DevTools)
- [ ] Should show timeout error
- [ ] Should allow retry

### Test 30: Rate Limit
- [ ] Make many rapid requests
- [ ] Should handle rate limit error
- [ ] Should show retry after message

## Cross-Browser Tests

### Test 31: Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Responsive design works

### Test 32: Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Responsive design works

### Test 33: Safari/Edge
- [ ] All features work
- [ ] No console errors
- [ ] Responsive design works

## Mobile Responsiveness Tests

### Test 34: Mobile View
- [ ] Resize browser to mobile size
- [ ] Layout should adapt
- [ ] All buttons accessible
- [ ] Tables should scroll

### Test 35: Tablet View
- [ ] Resize to tablet size
- [ ] Layout should be optimal
- [ ] All features usable

## Performance Tests

### Test 36: Page Load Speed
- [ ] Initial load should be < 3 seconds
- [ ] Navigation should be instant
- [ ] No lag when typing

### Test 37: API Response Time
- [ ] Predictions should load within 10-30 seconds
- [ ] Loading indicators should show
- [ ] User should not think app is frozen

## Security Tests

### Test 38: XSS Protection
- [ ] Try to inject scripts in input fields
- [ ] Should be sanitized
- [ ] No scripts should execute

### Test 39: Token Storage
- [ ] Check localStorage
- [ ] Token should be stored securely
- [ ] No sensitive data in console

## Final Verification

### Test 40: End-to-End Flow
1. [ ] Open app
2. [ ] Login (or auto-login)
3. [ ] Navigate to Market Scan
4. [ ] Search for stock
5. [ ] Add to watchlist
6. [ ] Add to portfolio
7. [ ] View analytics
8. [ ] Submit feedback
9. [ ] Logout

## Notes

- Mark each test as ✅ (passed) or ❌ (failed)
- Note any issues in the comments
- Take screenshots of errors
- Check browser console for errors
- Check backend logs for API errors

## Success Criteria

All critical tests (1-30) should pass for production readiness.
Non-critical tests (31-40) are nice-to-have but not blocking.

