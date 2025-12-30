import axios, { AxiosError } from 'axios';
import { config } from '../config';

// Connection state management
let isBackendOnline = true;
let connectionCheckInProgress = false;

const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 seconds (2 minutes) - predictions can take 60-90 seconds on first run
  withCredentials: false, // CORS is handled by backend
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Only add token if it's a valid JWT (not 'no-auth-required')
    if (token && token !== 'no-auth-required' && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced error handling with retry logic
api.interceptors.response.use(
  (response) => {
    // Mark backend as online on successful response
    isBackendOnline = true;
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle network errors (no response from server)
    if (!error.response && error.request) {
      isBackendOnline = false;
      
      // Retry logic for connection errors (only once)
      if (!originalRequest._retry && originalRequest) {
        originalRequest._retry = true;
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          return await api(originalRequest);
        } catch (retryError) {
          // Retry failed, return original error
        }
      }
      
      const baseURL = config.API_BASE_URL;
      return Promise.reject(new Error(
        `Unable to connect to backend server at ${baseURL}. ` +
        `Please ensure the backend is running.`
      ));
    }

    // Handle server errors (response received but with error status)
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      
      // Extract error message
      let message = 'An error occurred';
      if (data?.detail) {
        message = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      } else if (data?.error) {
        message = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      } else if (data?.message) {
        message = data.message;
      }
      
      // Handle specific error codes
      if (status === 401) {
        // Unauthorized - try to auto-login if credentials are available
        const storedUsername = localStorage.getItem('username');
        const storedToken = localStorage.getItem('token');
        
        // Only clear if token was invalid (not if it's missing)
        if (storedToken && storedToken !== 'no-auth-required') {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          message = 'Session expired. Please login again.';
        } else {
          // No token - redirect to login
          message = 'Authentication required. Please login.';
          // Trigger login redirect
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          }
        }
      } else if (status === 403) {
        message = 'Access forbidden. Please check your permissions.';
      } else if (status === 404) {
        message = 'Endpoint not found. Please check the API version.';
      } else if (status === 429) {
        message = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (status === 503) {
        message = 'Service temporarily unavailable. The prediction engine is initializing. Please try again in a moment.';
      } else if (status >= 500) {
        message = `Server error (${status}). Please try again later.`;
      }
      
      return Promise.reject(new Error(message));
    }

    // Handle other errors
    return Promise.reject(error);
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
  
  checkConnection: async (retries: number = 2): Promise<{ connected: boolean; data?: any; error?: string }> => {
    // Prevent multiple simultaneous connection checks
    if (connectionCheckInProgress) {
      return { connected: isBackendOnline, error: isBackendOnline ? undefined : 'Connection check in progress' };
    }

    connectionCheckInProgress = true;
    
    try {
      // Use longer timeout for connection check - backend might be slow to respond
      const response = await axios.get(`${config.API_BASE_URL}/`, {
        timeout: 10000, // 10 seconds for connection check (increased from 5)
        headers: { 'Content-Type': 'application/json' },
      });
      
      isBackendOnline = true;
      connectionCheckInProgress = false;
      return { connected: true, data: response.data };
    } catch (error: any) {
      // Retry logic
      if (retries > 0 && (!error.response || error.code === 'ECONNABORTED' || error.message?.includes('timeout'))) {
        connectionCheckInProgress = false;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        return stockAPI.checkConnection(retries - 1);
      }
      
      isBackendOnline = false;
      connectionCheckInProgress = false;
      
      const errorMessage = error.response 
        ? `Backend responded with error: ${error.response.status}`
        : error.message || 'Unable to connect to backend server';
      
      return { connected: false, error: errorMessage };
    }
  },
  
  getRateLimitStatus: async () => {
    const response = await api.get('/auth/status');
    return response.data;
  },
};

// Risk Management API (Backend-ready contracts, no implementation)
export const riskAPI = {
  /**
   * Set or update stop-loss for a symbol
   * 
   * Backend endpoint: POST /api/risk/stop-loss
   * 
   * Payload:
   * {
   *   symbol: string,
   *   stopLossPrice: number,
   *   side: "BUY" | "SELL",
   *   timeframe: string,
   *   source: "chart" | "manual"
   * }
   * 
   * Response: { success: boolean, message?: string }
   */
  setStopLoss: async (
    _symbol: string,
    _stopLossPrice: number,
    _side: 'BUY' | 'SELL',
    _timeframe: string,
    _source: 'chart' | 'manual'
  ) => {
    // TODO: Implement when backend is ready
    // const response = await api.post('/api/risk/stop-loss', {
    //   symbol: _symbol,
    //   stopLossPrice: _stopLossPrice,
    //   side: _side,
    //   timeframe: _timeframe,
    //   source: _source,
    // });
    // return response.data;
    throw new Error('Backend API not yet implemented');
  },
};

// AI Chat API (Backend-ready contracts, no implementation)
export const aiAPI = {
  /**
   * Send message to AI chat assistant
   * 
   * Backend endpoint: POST /api/ai/chat
   * 
   * Payload:
   * {
   *   message: string,
   *   context: {
   *     symbol?: string,
   *     timeframe?: string,
   *     activeIndicators?: string[]
   *   }
   * }
   * 
   * Response: { message: string, context?: any }
   */
  chat: async (
    _message: string,
    _context?: {
      symbol?: string;
      timeframe?: string;
      activeIndicators?: string[];
    }
  ) => {
    // TODO: Implement when backend is ready
    // const response = await api.post('/api/ai/chat', {
    //   message: _message,
    //   context: _context || {},
    // });
    // return response.data;
    throw new Error('Backend API not yet implemented');
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

