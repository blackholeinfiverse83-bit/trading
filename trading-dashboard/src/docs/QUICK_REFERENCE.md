# TradeX Pro - Quick Reference Guide

## Installation Command

Tell your AI to run this command to install all dependencies:

```bash
npm install
```

---

## All Required Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2",
    "lucide-react": "^0.300.0",
    "recharts": "^2.10.3",
    "sonner": "^2.0.3",
    "motion": "^10.16.4",
    "react-hook-form": "^7.48.2",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

---

## Individual Install Commands (if needed)

```bash
# Core dependencies
npm install react@^18.2.0 react-dom@^18.2.0
npm install axios@^1.6.2
npm install lucide-react@^0.300.0
npm install recharts@^2.10.3
npm install sonner@^2.0.3
npm install motion@^10.16.4
npm install react-hook-form@^7.48.2
npm install date-fns@^2.30.0
npm install clsx@^2.0.0
npm install tailwind-merge@^2.1.0

# Dev dependencies
npm install --save-dev @types/react@^18.2.43 @types/react-dom@^18.2.17
npm install --save-dev @typescript-eslint/eslint-plugin@^6.14.0 @typescript-eslint/parser@^6.14.0
npm install --save-dev @vitejs/plugin-react@^4.2.1
npm install --save-dev autoprefixer@^10.4.16
npm install --save-dev eslint@^8.55.0
npm install --save-dev eslint-plugin-react-hooks@^4.6.0 eslint-plugin-react-refresh@^0.4.5
npm install --save-dev postcss@^8.4.32
npm install --save-dev tailwindcss@^4.0.0
npm install --save-dev typescript@^5.2.2
npm install --save-dev vite@^5.0.8
```

---

## Key Changes Made

### 1. ✅ Removed All Mock Data
- `/src/services/api.ts` - Removed all mock data generators
- App now ONLY uses real backend API data
- No fake/dummy data displayed

### 2. ✅ Updated Background
- `/components/SpaceBackground.tsx` - New darker gradient background
- Matches the design with slate tones
- 800 animated stars for visual effect

### 3. ✅ Search-Based Data Display
- **Market Page** - Empty until user searches for a stock
- **Portfolio Page** - Empty until user adds stocks
- No auto-loading of data

### 4. ✅ Portfolio Management
- Search for stocks in Market page
- Click "Add to Portfolio" button
- View in Portfolio page with live updates
- Click trash icon to remove stocks
- Real-time price updates every 2 seconds

---

## How to Use the App

### Step 1: Start the App
```bash
npm run dev
```
App runs at: `http://localhost:5173`

### Step 2: Make Sure Backend is Running
Backend should be at: `http://localhost:8002`

### Step 3: Search for Stocks
1. Go to **Market** page
2. Enter stock symbol (e.g., "AAPL")
3. Click "Search"
4. Click "Add to Portfolio" for stocks you want to track

### Step 4: View Portfolio
1. Go to **Portfolio** page
2. See your added stocks with live prices
3. Click trash icon to remove stocks

---

## Backend API Endpoints Required

Your backend (Krishna's API) must provide:

```
POST /tools/scan_all       - Get stock data
POST /tools/predict        - Get predictions
POST /tools/analyze        - Get chart data
POST /tools/confirm        - Confirm trades
POST /chat/query          - Chat with AI
GET  /tools/health        - Health check
GET  /api/status          - Status check
```

Base URL: `http://localhost:8002`

---

## Files Modified

1. `/src/services/api.ts` - Removed all mock data
2. `/components/SpaceBackground.tsx` - Updated background gradient
3. `/components/pages/MarketPage.tsx` - Added search functionality
4. `/components/pages/PortfolioPage.tsx` - Added add/remove functionality
5. `/App.tsx` - Added portfolio state management
6. `/package.json` - Updated sonner version to 2.0.3

---

## Common Issues & Solutions

### Issue: Backend connection errors
**Solution:** Make sure backend is running at `http://localhost:8002`

### Issue: "Module not found" errors
**Solution:** 
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port already in use
**Solution:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill

# Or use different port
npm run dev -- --port 3000
```

---

## Summary

🎯 **No mock data** - App requires working backend
🎨 **New background** - Darker gradient with animated stars
🔍 **Search-based** - No data until user searches
📊 **Portfolio management** - Add/remove stocks easily
📦 **All dependencies listed** - Easy to install

Tell Krishna to make sure the backend API is running and provides all required endpoints!
