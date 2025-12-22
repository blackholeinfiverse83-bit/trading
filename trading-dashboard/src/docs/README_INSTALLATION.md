# 🚀 TradeX Pro - Installation & Setup

## Quick Start (3 Steps)

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Start Backend (Krishna's API)
Make sure it's running at: `http://localhost:8002`

### 3️⃣ Start Frontend
```bash
npm run dev
```

Open browser: `http://localhost:5173`

---

## 📦 All Dependencies Needed

Copy this to tell your AI what to install:

```
react@^18.2.0
react-dom@^18.2.0
axios@^1.6.2
lucide-react@^0.300.0
recharts@^2.10.3
sonner@^2.0.3
motion@^10.16.4
react-hook-form@^7.48.2
date-fns@^2.30.0
clsx@^2.0.0
tailwind-merge@^2.1.0
@types/react@^18.2.43
@types/react-dom@^18.2.17
@typescript-eslint/eslint-plugin@^6.14.0
@typescript-eslint/parser@^6.14.0
@vitejs/plugin-react@^4.2.1
autoprefixer@^10.4.16
eslint@^8.55.0
eslint-plugin-react-hooks@^4.6.0
eslint-plugin-react-refresh@^0.4.5
postcss@^8.4.32
tailwindcss@^4.0.0
typescript@^5.2.2
vite@^5.0.8
```

---

## ✅ What Changed

### 1. ❌ All Fake Data Removed
- No more mock data generators
- No fallback dummy data
- Backend required for all operations

### 2. 🎨 Background Updated
- New darker gradient (slate tones)
- Matches the provided design image
- 800 animated stars

### 3. 🔍 Search-Based Display
- Market page: Empty until you search
- Portfolio page: Empty until you add stocks
- No auto-loading data

### 4. 📊 Portfolio Management
- Search stocks in Market page
- Click "Add to Portfolio"
- View in Portfolio page
- Click trash icon to remove
- Live price updates every 2 seconds

---

## 🎯 How to Use

```
Step 1: Go to Market Page
   ↓
Step 2: Enter stock symbol (e.g., "AAPL")
   ↓
Step 3: Click "Search"
   ↓
Step 4: Click "Add to Portfolio"
   ↓
Step 5: Go to Portfolio Page
   ↓
Step 6: View your stocks with live prices
   ↓
Step 7: Click trash icon to remove stocks
```

---

## 🔌 Backend Requirements

Your backend must run at: `http://localhost:8002`

Required endpoints:
- `POST /tools/scan_all` - Get stock data
- `POST /tools/predict` - Get predictions
- `POST /tools/analyze` - Get chart data
- `POST /tools/confirm` - Confirm trades
- `POST /chat/query` - Chat with AI

---

## 🐛 Troubleshooting

### Problem: Dependencies won't install
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Problem: Backend not connecting
- Check if backend is running: `http://localhost:8002`
- Check browser console for errors
- Make sure CORS is enabled on backend

### Problem: Port 5173 in use
```bash
# Kill process
lsof -ti:5173 | xargs kill

# Or use different port
npm run dev -- --port 3000
```

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `DEPENDENCIES.md` | Complete list of all dependencies |
| `INSTALLATION_GUIDE.md` | Detailed installation instructions |
| `QUICK_REFERENCE.md` | Quick reference for commands |
| `CHANGES_SUMMARY.md` | Summary of all changes made |
| `README_INSTALLATION.md` | This file - quick overview |

---

## ✨ Summary

✅ All fake/mock data removed
✅ Background updated to darker gradient
✅ Search-based data display (no auto-loading)
✅ Portfolio add/remove functionality
✅ Live price updates every 2 seconds
✅ All dependencies documented
✅ Ready for Krishna's backend API

**Just run `npm install` and you're ready to go!**
