# Frontend-Backend Integration Guide

## Overview

This guide explains how the frontend and backend are integrated and how to run the complete system.

## Architecture

- **Frontend**: React + TypeScript + Vite (running on port 5173 by default)
- **Backend**: FastAPI (running on port 8000 by default)
- **Authentication**: Backend supports optional authentication (currently disabled for open access)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python api_server.py
```

The backend will run on `http://127.0.0.1:8000`

### 2. Frontend Setup

```bash
cd trading-dashboard

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173` (or next available port)

### 3. Environment Configuration

Create a `.env` file in `trading-dashboard/` directory:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_ENABLE_AUTH=false
```

## API Integration

### Endpoints Used

All endpoints are defined in `src/services/api.ts`:

1. **GET /** - API information
2. **GET /auth/status** - Rate limit status
3. **GET /tools/health** - System health check
4. **POST /tools/predict** - Generate predictions
5. **POST /tools/scan_all** - Scan and rank symbols
6. **POST /tools/analyze** - Analyze with risk parameters
7. **POST /tools/feedback** - Provide feedback for RL training
8. **POST /tools/train_rl** - Train RL agent
9. **POST /tools/fetch_data** - Fetch batch data
10. **POST /auth/login** - Login (optional)

### Authentication Flow

When the backend has authentication disabled (`auth_status: 'disabled'`):
- Frontend automatically detects this
- User is logged in as "anonymous"
- All API calls work without tokens

When authentication is enabled:
- User must login with credentials
- Token is stored in localStorage
- Token is sent with all API requests

## Pages Integration

### Dashboard Page
- **Function**: Shows portfolio overview and top performers
- **API Calls**: `scanAll()` for top stocks
- **Features**: Real-time portfolio value, daily changes, top predictions

### Market Scan Page
- **Function**: Search and analyze individual stocks
- **API Calls**: `predict()`, `scanAll()`, `analyze()`
- **Features**: 
  - Single stock search
  - Batch scanning
  - Deep analysis across horizons
  - Feedback submission

### Portfolio Page
- **Function**: Manage stock holdings
- **API Calls**: `predict()` for real-time prices
- **Features**: 
  - Add/remove positions
  - Buy/sell actions
  - Real-time portfolio value calculation

### Watch List Page
- **Function**: Monitor favorite stocks
- **API Calls**: `predict()` for watchlist symbols
- **Features**: 
  - Add/remove stocks from watchlist
  - Real-time predictions for watched stocks
  - LocalStorage persistence

### Analytics Page
- **Function**: Detailed analysis and insights
- **API Calls**: `scanAll()` for analytics data
- **Features**: 
  - Signal distribution charts
  - Performance trends
  - Top predictions

### Trading History Page
- **Function**: View past transactions
- **API Calls**: None (uses mock data currently)
- **Features**: Transaction history table

## Features Implemented

### ✅ Completed Features

1. **Authentication**
   - Login/Signup pages
   - Auto-detection of backend auth mode
   - Token management
   - Protected routes

2. **Stock Prediction**
   - Single stock predictions
   - Batch scanning
   - Multiple horizons (intraday, short, long)
   - Risk parameters

3. **Analysis**
   - Deep analysis with multiple horizons
   - Consensus calculation
   - Confidence metrics

4. **Feedback System**
   - User feedback submission
   - RL model training integration

5. **Portfolio Management**
   - Add/remove positions
   - Real-time price updates
   - Gain/loss calculations

6. **Watch List**
   - Add/remove stocks
   - Persistent storage
   - Real-time updates

### 🚧 Future Enhancements

1. **Trading History**
   - Connect to backend database
   - Real transaction recording

2. **Advanced Analytics**
   - More chart types
   - Historical analysis
   - Performance metrics

3. **Notifications**
   - Price alerts
   - Prediction updates
   - System notifications

## Error Handling

All API calls include:
- Try-catch error handling
- User-friendly error messages
- Loading states
- Retry mechanisms

## Testing

### Manual Testing Checklist

1. **Authentication**
   - [ ] Login with credentials
   - [ ] Login in open access mode
   - [ ] Logout functionality

2. **Dashboard**
   - [ ] Load top stocks
   - [ ] Display portfolio stats
   - [ ] Refresh data

3. **Market Scan**
   - [ ] Search single stock
   - [ ] Batch scan
   - [ ] Deep analyze
   - [ ] Submit feedback

4. **Portfolio**
   - [ ] Add position
   - [ ] Remove position
   - [ ] Buy/Sell actions
   - [ ] Price updates

5. **Watch List**
   - [ ] Add stock
   - [ ] Remove stock
   - [ ] View predictions

6. **Analytics**
   - [ ] Load analytics data
   - [ ] View charts
   - [ ] Filter by period

## Troubleshooting

### Backend Not Responding

1. Check if backend is running: `curl http://127.0.0.1:8000/`
2. Check backend logs in `backend/data/logs/`
3. Verify port 8000 is not in use

### Frontend Connection Errors

1. Verify API_BASE_URL in `.env` file
2. Check browser console for CORS errors
3. Verify backend CORS settings allow frontend origin

### Authentication Issues

1. Check backend `config.py` for `ENABLE_AUTH` setting
2. Clear browser localStorage
3. Check network tab for 401 errors

## Deployment

### Production Build

```bash
# Frontend
cd trading-dashboard
npm run build
# Output in dist/ directory

# Backend
# Use production WSGI server (e.g., gunicorn)
gunicorn api_server:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Environment Variables

Set in production:
- `VITE_API_BASE_URL` - Backend API URL
- `UVICORN_HOST` - Backend host (0.0.0.0 for production)
- `UVICORN_PORT` - Backend port
- `ENABLE_AUTH` - Enable/disable authentication

## Support

For issues or questions:
1. Check backend logs: `backend/data/logs/api_server.log`
2. Check browser console for frontend errors
3. Review API documentation: `http://127.0.0.1:8000/docs`





