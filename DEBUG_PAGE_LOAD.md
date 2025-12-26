# Debug Page Loading Issue

## Issue
Page at `localhost:5177/market-scan` is showing blank (dark blue-grey screen).

## Fixes Applied

### 1. Added Error Boundary
- Created `ErrorBoundary.tsx` component to catch React errors
- Wrapped App with ErrorBoundary to show error messages instead of blank screen

### 2. Fixed MarketScanPage
- Ensured `renderAssetView()` always returns a component (added default fallback)
- Fixed context usage to be safe

### 3. Check Browser Console
Open browser DevTools (F12) and check:
- **Console tab**: Look for JavaScript errors
- **Network tab**: Check if files are loading (200 status)
- **Elements tab**: Check if `<div id="root">` has content

## Common Issues & Solutions

### Issue 1: Context Error
**Error**: "useAssetType must be used within AssetTypeProvider"
**Solution**: Layout component wraps pages with AssetTypeProvider, so this should work. If error persists, check Layout.tsx.

### Issue 2: Import Error
**Error**: "Cannot find module" or "Failed to resolve"
**Solution**: 
1. Stop the dev server (Ctrl+C)
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install`
4. Run `npm run dev`

### Issue 3: Port Conflict
**Error**: Port 5177 already in use
**Solution**: 
1. Kill process on port 5177: `netstat -ano | findstr :5177`
2. Or change port in `vite.config.ts`

### Issue 4: Build Errors
**Solution**: Check for TypeScript/compilation errors:
```bash
cd trading-dashboard
npm run build
```

## Quick Fix Steps

1. **Open Browser Console** (F12)
2. **Check for errors** in Console tab
3. **Reload page** (Ctrl+R or F5)
4. **Check Network tab** - ensure all files load (status 200)
5. **Check if backend is running** on port 8000

## If Still Blank

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Hard refresh**: Ctrl+Shift+R
3. **Check if frontend server is running**:
   ```bash
   cd trading-dashboard
   npm run dev
   ```
4. **Check backend is running**:
   ```bash
   cd backend
   python api_server.py
   ```

## Expected Behavior

When page loads correctly, you should see:
- Sidebar on the left
- Navbar at the top with Stocks/Crypto/Commodities tabs
- Main content area with search interface
- Welcome message or predictions

If you see blank screen, check browser console for the actual error message.

