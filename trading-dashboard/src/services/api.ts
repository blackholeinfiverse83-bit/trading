import axios from 'axios';
import { config } from '../config';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout - faster feedback
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail || error.response.data?.error || 'An error occurred';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject(new Error('Unable to connect to server. Please check if the backend is running.'));
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  signup: async (_username: string, _password: string, _email: string) => {
    // Note: Backend doesn't have signup endpoint, so we'll simulate it
    // In production, you'd add this endpoint to backend
    return { success: true, message: 'Signup successful. Please login.' };
  },
};

// Stock Data API
export const stockAPI = {
  predict: async (
    symbols: string[], 
    horizon: string = 'intraday', 
    riskProfile?: string,
    stopLossPct?: number,
    capitalRiskPct?: number,
    drawdownLimitPct?: number
  ) => {
    const payload: any = {
      symbols,
      horizon,
    };
    if (riskProfile) payload.risk_profile = riskProfile;
    if (stopLossPct !== undefined) payload.stop_loss_pct = stopLossPct;
    if (capitalRiskPct !== undefined) payload.capital_risk_pct = capitalRiskPct;
    if (drawdownLimitPct !== undefined) payload.drawdown_limit_pct = drawdownLimitPct;
    
    const response = await api.post('/tools/predict', payload);
    return response.data;
  },
  
  scanAll: async (
    symbols: string[], 
    horizon: string = 'intraday', 
    minConfidence: number = 0.3,
    stopLossPct?: number,
    capitalRiskPct?: number
  ) => {
    const payload: any = {
      symbols,
      horizon,
      min_confidence: minConfidence,
    };
    if (stopLossPct !== undefined) payload.stop_loss_pct = stopLossPct;
    if (capitalRiskPct !== undefined) payload.capital_risk_pct = capitalRiskPct;
    
    const response = await api.post('/tools/scan_all', payload);
    return response.data;
  },
  
  analyze: async (
    symbol: string, 
    horizons: string[] = ['intraday'], 
    stopLossPct: number = 2.0,
    capitalRiskPct: number = 1.0,
    drawdownLimitPct: number = 5.0
  ) => {
    const response = await api.post('/tools/analyze', {
      symbol,
      horizons,
      stop_loss_pct: stopLossPct,
      capital_risk_pct: capitalRiskPct,
      drawdown_limit_pct: drawdownLimitPct,
    });
    return response.data;
  },
  
  fetchData: async (
    symbols: string[], 
    period: string = '2y', 
    includeFeatures: boolean = false,
    refresh: boolean = false
  ) => {
    const response = await api.post('/tools/fetch_data', {
      symbols,
      period,
      include_features: includeFeatures,
      refresh,
    });
    return response.data;
  },
  
  feedback: async (
    symbol: string,
    predictedAction: string,
    userFeedback: 'correct' | 'incorrect',
    actualReturn?: number
  ) => {
    const payload: any = {
      symbol,
      predicted_action: predictedAction,
      user_feedback: userFeedback,
    };
    if (actualReturn !== undefined) payload.actual_return = actualReturn;
    
    const response = await api.post('/tools/feedback', payload);
    return response.data;
  },
  
  trainRL: async (
    symbol: string,
    horizon: string = 'intraday',
    nEpisodes: number = 10,
    forceRetrain: boolean = false
  ) => {
    const response = await api.post('/tools/train_rl', {
      symbol,
      horizon,
      n_episodes: nEpisodes,
      force_retrain: forceRetrain,
    });
    return response.data;
  },
  
  health: async () => {
    const response = await api.get('/tools/health');
    return response.data;
  },
  
  getRateLimitStatus: async () => {
    const response = await api.get('/auth/status');
    return response.data;
  },
};

// Popular stock symbols for search autocomplete
export const POPULAR_STOCKS = [
  // US Stocks
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'JNJ',
  'WMT', 'PG', 'MA', 'UNH', 'DIS', 'HD', 'BAC', 'PYPL', 'NFLX', 'ADBE',
  // Indian Stocks (NSE)
  'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS',
  'ICICIBANK.NS', 'BHARTIARTL.NS', 'SBIN.NS', 'BAJFINANCE.NS', 'LICI.NS',
  'ITC.NS', 'SUNPHARMA.NS', 'HCLTECH.NS', 'AXISBANK.NS', 'KOTAKBANK.NS',
  'LT.NS', 'ASIANPAINT.NS', 'MARUTI.NS', 'TITAN.NS', 'ULTRACEMCO.NS',
  'NESTLEIND.NS', 'WIPRO.NS', 'ONGC.NS', 'NTPC.NS', 'POWERGRID.NS',
  'TATAMOTORS.NS', 'TATASTEEL.NS', 'JSWSTEEL.NS', 'ADANIPORTS.NS', 'TECHM.NS',
];

// Popular crypto symbols (Yahoo Finance format)
export const POPULAR_CRYPTO = [
  'BTC-USD', 'ETH-USD', 'BNB-USD', 'SOL-USD', 'XRP-USD',
  'ADA-USD', 'DOGE-USD', 'DOT-USD', 'MATIC-USD', 'AVAX-USD',
  'LINK-USD', 'UNI-USD', 'LTC-USD', 'ATOM-USD', 'ETC-USD',
  'XLM-USD', 'ALGO-USD', 'VET-USD', 'ICP-USD', 'FIL-USD',
  'TRX-USD', 'EOS-USD', 'AAVE-USD', 'MKR-USD', 'COMP-USD',
];

// Popular commodities symbols (Yahoo Finance format)
export const POPULAR_COMMODITIES = [
  'GC=F',      // Gold Futures
  'SI=F',      // Silver Futures
  'CL=F',      // Crude Oil Futures
  'NG=F',      // Natural Gas Futures
  'HG=F',      // Copper Futures
  'ZC=F',      // Corn Futures
  'ZS=F',      // Soybean Futures
  'ZW=F',      // Wheat Futures
  'KC=F',      // Coffee Futures
  'SB=F',      // Sugar Futures
  'CT=F',      // Cotton Futures
  'CC=F',      // Cocoa Futures
  'OJ=F',      // Orange Juice Futures
  'LE=F',      // Live Cattle Futures
  'HE=F',      // Lean Hogs Futures
];

export default api;

