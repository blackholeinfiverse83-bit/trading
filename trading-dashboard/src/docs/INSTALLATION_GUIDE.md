# TradeX Pro - Installation & Setup Guide

This guide will help you install all dependencies and get TradeX Pro running on your machine.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Complete Installation Steps

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **Backend API** (Krishna's API)
   - Make sure the backend is running at `http://localhost:8002`
   - The backend should provide these endpoints:
     - `POST /tools/predict`
     - `POST /tools/scan_all`
     - `POST /tools/analyze`
     - `POST /tools/confirm`
     - `POST /chat/query`

### Step 1: Install Dependencies

Navigate to the project directory and run:

```bash
npm install
```

This will install all required dependencies listed in `package.json`:

**Core Dependencies:**
- `react` & `react-dom` - UI framework
- `axios` - HTTP client for API requests
- `lucide-react` - Icon library
- `recharts` - Charting library
- `sonner` - Toast notifications
- `motion` - Animation library
- `react-hook-form` - Form management
- `date-fns` - Date utilities
- `clsx` & `tailwind-merge` - CSS utilities

**Dev Dependencies:**
- `typescript` - Type safety
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `eslint` - Code linting

### Step 2: Verify Installation

Check that all dependencies were installed correctly:

```bash
npm list
```

You should see a tree of all installed packages without any errors.

### Step 3: Configure Backend URL (Optional)

If your backend is running on a different port or host, update the base URL in `/src/services/api.ts`:

```typescript
// Change this line if needed
const BASE_URL = 'http://localhost:8002';
```

### Step 4: Start Development Server

Run the development server:

```bash
npm run dev
```

You should see output like:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and navigate to `http://localhost:5173`

---

## How the App Works (No Mock Data)

### Important Changes Made:

1. **All Mock Data Removed**
   - The app no longer uses fake/mock data
   - All data comes from Krishna's backend API
   - If the backend is offline, you'll see error messages

2. **Search-Based Data Display**
   - **Market Page:** Shows empty state until you search for a stock
   - **Portfolio Page:** Shows empty state until you add stocks from Market page
   - No data is pre-loaded or auto-displayed

3. **Portfolio Management**
   - Search for stocks in the Market page
   - Click "Add to Portfolio" to add them to your portfolio
   - View and manage your portfolio in the Portfolio page
   - Click the trash icon to remove stocks from portfolio
   - Real-time price updates every 2 seconds (when backend is online)

4. **Updated Background**
   - New darker gradient background matching the design
   - Animated stars for visual appeal

### User Flow:

```
1. Go to Market page
   ↓
2. Search for a stock (e.g., "AAPL")
   ↓
3. Click "Add to Portfolio"
   ↓
4. Go to Portfolio page
   ↓
5. See your stock with live prices
   ↓
6. Click trash icon to remove if needed
```

---

## Available Scripts

### `npm run dev`
Starts the development server with hot module replacement (HMR)

### `npm run build`
Creates a production build in the `dist` directory

### `npm run preview`
Previews the production build locally

### `npm run lint`
Runs ESLint to check for code quality issues

---

## Project Structure

```
/
├── App.tsx                          # Main app component
├── components/
│   ├── pages/
│   │   ├── MarketPage.tsx          # Stock search page
│   │   ├── PortfolioPage.tsx       # Portfolio management
│   │   ├── DashboardPage.tsx       # Trading dashboard
│   │   └── ComingSoonPage.tsx      # Placeholder pages
│   ├── Sidebar.tsx                  # Navigation sidebar
│   ├── SpaceBackground.tsx          # Animated background
│   ├── ChatPanel.tsx                # AI chat component
│   ├── ExecutionConsole.tsx         # Trading decisions
│   ├── InputPanel.tsx               # Trade input controls
│   ├── LivePredictionsFeed.tsx      # Live predictions
│   └── TradingChart.tsx             # Candlestick chart
├── src/
│   └── services/
│       └── api.ts                   # Backend API service
├── styles/
│   └── globals.css                  # Global styles
└── package.json                     # Dependencies
```

---

## Backend API Integration

### API Base URL
The app connects to: `http://localhost:8002`

### Required Endpoints

#### 1. Scan All Stocks
```
POST /tools/scan_all
Body: {
  "symbols": ["AAPL", "GOOGL"],
  "horizon": "short"
}
Response: {
  "results": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": 185.50,
      "change": 2.30,
      "change_percent": 1.25,
      "volume": "45.2M"
    }
  ]
}
```

#### 2. Get Predictions
```
POST /tools/predict
Body: {
  "symbols": ["AAPL"],
  "horizon": "intraday"
}
```

#### 3. Analyze Stock
```
POST /tools/analyze
Body: {
  "symbol": "AAPL",
  "horizons": ["intraday", "short"]
}
```

#### 4. Chat Query
```
POST /chat/query
Body: {
  "message": "What's the market trend?"
}
```

---

## Troubleshooting

### Problem: Dependencies won't install
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Problem: Backend connection errors
**Solution:**
- Verify backend is running at `http://localhost:8002`
- Check backend logs for errors
- Make sure all API endpoints are implemented
- Test endpoints with curl or Postman:
  ```bash
  curl -X POST http://localhost:8002/tools/scan_all \
    -H "Content-Type: application/json" \
    -d '{"symbols": ["AAPL"], "horizon": "short"}'
  ```

### Problem: TypeScript errors
**Solution:**
```bash
# Reinstall TypeScript dependencies
npm install --save-dev typescript @types/react @types/react-dom
```

### Problem: Port 5173 already in use
**Solution:**
```bash
# Kill the process (Mac/Linux)
lsof -ti:5173 | xargs kill

# Or use a different port
npm run dev -- --port 3000
```

### Problem: Styles not loading
**Solution:**
```bash
# Make sure Tailwind is configured
npm install -D tailwindcss postcss autoprefixer
```

### Problem: Icons not showing
**Solution:**
```bash
# Reinstall lucide-react
npm install lucide-react
```

---

## Production Build

To create a production build:

```bash
npm run build
```

This will:
1. Run TypeScript type checking
2. Build optimized production files
3. Output to the `dist` directory

To test the production build:

```bash
npm run preview
```

---

## Environment Variables (Optional)

If you want to use environment variables for the backend URL:

1. Create a `.env` file in the root directory:
   ```
   VITE_API_BASE_URL=http://localhost:8002
   ```

2. Update `/src/services/api.ts`:
   ```typescript
   const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';
   ```

---

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the terminal for build errors
3. Verify the backend is running and accessible
4. Make sure all dependencies are installed correctly
5. Try deleting `node_modules` and reinstalling

---

## Summary of Changes

✅ **Removed all mock data** - App only uses real API data
✅ **Updated background** - New darker gradient with animated stars
✅ **Search-based display** - No data shown until user searches
✅ **Portfolio management** - Add/remove stocks with live price updates
✅ **Dependencies documented** - All required packages listed in DEPENDENCIES.md

The app is now ready to connect to Krishna's backend API and display real trading data!
