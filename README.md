# Multi-Asset Trading Dashboard

A comprehensive trading dashboard supporting Stocks, Cryptocurrencies, and Commodities with AI-powered predictions.

## 🚀 Features

- **Multi-Asset Support**: Stocks, Crypto, and Commodities
- **AI-Powered Predictions**: Ensemble ML models (LightGBM, XGBoost, DQN, Random Forest)
- **Real-Time Data**: Live market data from Yahoo Finance
- **Advanced Analytics**: Detailed charts, technical indicators, and performance metrics
- **Portfolio Management**: Track holdings with real-time price updates
- **Watchlist**: Monitor favorite assets
- **Beautiful UI**: Modern, responsive design with dark theme

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Git**

## 🛠️ Installation

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd trading-dashboard
npm install
```

## 🚀 Running the Application

### Option 1: Use KEEP_RUNNING.bat (Recommended)

Double-click `KEEP_RUNNING.bat` and choose:
1. Start Both Servers (Auto-Restart Backend)

### Option 2: Manual Start

**Backend:**
```bash
cd backend
python api_server.py
```

**Frontend:**
```bash
cd trading-dashboard
npm run dev
```

## 🌐 Access

- **Frontend**: http://localhost:5173
- **Backend API Docs**: http://127.0.0.1:8000/docs

## 📁 Project Structure

```
Multi-Asset Trading Dashboard/
├── backend/              # FastAPI backend
│   ├── api_server.py    # Main API server
│   ├── core/            # Core ML logic
│   └── data/            # Cache and models
├── trading-dashboard/   # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── services/    # API services
└── README.md
```

## 🔧 Configuration

### Backend
- Port: 8000 (configurable in `backend/config.py`)
- CORS: Enabled for all origins

### Frontend
- Port: 5173 (configurable in `trading-dashboard/vite.config.ts`)
- API URL: `http://127.0.0.1:8000` (configurable in `trading-dashboard/src/config.ts`)

## 📊 Supported Assets

### Stocks
- US Stocks: AAPL, GOOGL, MSFT, TSLA, etc.
- Indian Stocks (NSE): RELIANCE.NS, TCS.NS, etc.

### Cryptocurrencies
- Format: BTC-USD, ETH-USD, SOL-USD, etc.

### Commodities
- Format: GC=F (Gold), CL=F (Oil), SI=F (Silver), etc.

## 🎯 API Endpoints

- `POST /tools/predict` - Get predictions for symbols
- `POST /tools/scan_all` - Scan multiple symbols
- `POST /tools/analyze` - Deep analysis
- `GET /tools/health` - Health check

## 🐛 Troubleshooting

### Backend stops unexpectedly
Use `KEEP_RUNNING.bat` or `START_BACKEND_WATCHDOG.bat` for auto-restart.

### Port already in use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Frontend not connecting
1. Check backend is running on port 8000
2. Verify CORS settings
3. Check browser console for errors

## 📝 License

This project is private and proprietary.

## 👥 Contributors

- Blackhole Infiverse

---

For detailed documentation, see:
- `MULTI_ASSET_IMPLEMENTATION.md` - Multi-asset feature details
- `REAL_DATA_IMPLEMENTATION.md` - Real data implementation
- `SERVER_SOLUTIONS.md` - Server management solutions
