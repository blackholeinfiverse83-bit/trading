# Blackhole Infeverse Trading Dashboard

A comprehensive trading dashboard with AI-powered stock predictions, real-time market data, and advanced analytics.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ (for backend)
- Node.js 18+ (for frontend)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Blackhole Infeverse Trading Dashboard"
```

### 2. Start the Project (Windows)
```bash
# Start both backend and frontend
start_project.bat
```

Or start them individually:

```bash
# Backend only
cd backend
start_backend.bat

# Frontend only (in another terminal)
cd trading-dashboard
start_frontend.bat
```

### 3. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000
- **API Documentation**: http://127.0.0.1:8000/docs

## 📁 Project Structure

```
Blackhole Infeverse Trading Dashboard/
├── backend/                    # Python FastAPI backend
│   ├── core/                  # Core MCP adapter
│   ├── data/                  # Data cache and logs
│   ├── models/                # ML models
│   ├── api_server.py          # Main API server
│   ├── config.py              # Configuration
│   ├── auth.py                # Authentication
│   ├── .env                   # Environment variables
│   └── requirements.txt       # Python dependencies
├── trading-dashboard/          # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   └── types/             # TypeScript types
│   ├── .env                   # Frontend environment
│   └── package.json           # Node dependencies
└── start_project.bat          # Quick start script
```

## ⚙️ Configuration

### Backend Configuration (.env)
```env
# Authentication
ENABLE_AUTH=False              # Set to True to enable authentication
JWT_SECRET_KEY=your-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Rate Limiting
RATE_LIMIT_PER_MINUTE=500
RATE_LIMIT_PER_HOUR=10000

# API Configuration
MAX_SYMBOLS_PER_REQUEST=10
MAX_SCAN_SYMBOLS=50
```

### Frontend Configuration (.env)
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_ENABLE_AUTH=false         # Must match backend ENABLE_AUTH
```

## 🔧 Features

### ✅ Implemented
- **Real-time Stock Predictions**: AI-powered predictions using multiple ML models
- **Market Scanning**: Scan multiple symbols with confidence filtering
- **Portfolio Analytics**: Track performance and risk metrics
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Theme Support**: Light, dark, and space themes
- **Rate Limiting**: Prevents API abuse
- **Error Handling**: Comprehensive error handling and logging
- **Backend Integration**: Full REST API integration

### 🚧 In Development
- WebSocket real-time updates
- Advanced charting
- Alert system
- Export functionality

## 🔌 API Endpoints

### Core Endpoints
- `GET /` - API information
- `GET /tools/health` - System health check
- `POST /tools/predict` - Generate predictions
- `POST /tools/scan_all` - Scan multiple symbols
- `POST /tools/analyze` - Detailed analysis
- `POST /tools/feedback` - Submit feedback
- `POST /tools/train_rl` - Train ML models

### Authentication (if enabled)
- `POST /auth/login` - User login
- `GET /auth/status` - Rate limit status

## 🛠️ Development

### Backend Development
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python api_server.py
```

### Frontend Development
```bash
cd trading-dashboard
npm install
npm run dev
```

### Testing Backend Integration
```bash
cd backend
python test_integration.py
```

## 🔒 Security Features

- **Rate Limiting**: Configurable per-minute and per-hour limits
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error messages
- **CORS Configuration**: Proper cross-origin setup
- **Optional Authentication**: JWT-based authentication when enabled

## 📊 Supported Assets

### Stocks
- US Stocks: AAPL, GOOGL, MSFT, AMZN, TSLA, etc.
- Indian Stocks: RELIANCE.NS, TCS.NS, HDFCBANK.NS, etc.

### Cryptocurrencies
- BTC-USD, ETH-USD, BNB-USD, SOL-USD, etc.

### Commodities
- Gold (GC=F), Silver (SI=F), Oil (CL=F), etc.

## 🐛 Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check Python version (3.8+)
   - Install dependencies: `pip install -r requirements.txt`
   - Check port 8000 availability

2. **Frontend not connecting**
   - Verify backend is running on http://127.0.0.1:8000
   - Check .env configuration
   - Clear browser cache

3. **Rate limit errors**
   - Increase limits in backend/.env
   - Wait for rate limit reset
   - Check API usage

4. **TypeScript errors**
   - Run `npm install` in trading-dashboard
   - Check Node.js version (18+)
   - Restart development server

### Logs
- Backend logs: `backend/data/logs/api_server.log`
- API requests: `backend/data/logs/api_requests.jsonl`
- Security events: `backend/data/logs/security.jsonl`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation at http://127.0.0.1:8000/docs
3. Check the logs for error details
4. Create an issue with detailed information

---

**Happy Trading! 📈**