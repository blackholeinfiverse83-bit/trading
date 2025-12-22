import axios from 'axios';

// Base URL for the backend API
const BASE_URL = 'http://localhost:8002';

// Centralized request manager to prevent rate limiting
const REQUEST_DELAY = 1000; // 1 second between requests
let lastRequestTime = 0;
let pendingRequests: Array<() => void> = [];
let isProcessingQueue = false;

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds cache duration

const processRequestQueue = async () => {
  if (isProcessingQueue || pendingRequests.length === 0) {
    return;
  }
  
  isProcessingQueue = true;
  
  while (pendingRequests.length > 0) {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < REQUEST_DELAY) {
      const delay = REQUEST_DELAY - timeSinceLastRequest;
      console.log(`Throttling request for ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    const requestFn = pendingRequests.shift();
    if (requestFn) {
      console.log(`Processing request at ${new Date().toISOString()}`);
      lastRequestTime = Date.now();
      requestFn();
    }
    
    // Small buffer between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  isProcessingQueue = false;
};

const throttledRequest = async <T>(requestFn: () => Promise<T>, cacheKey?: string): Promise<T> => {
  // Check cache first
  if (cacheKey) {
    const cached = cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`Returning cached data for key: ${cacheKey}`);
      return cached.data;
    }
  }
  
  console.log(`Queueing request at ${new Date().toISOString()}`);
  return new Promise<T>((resolve, reject) => {
    pendingRequests.push(async () => {
      try {
        const result = await requestFn();
        // Cache the result
        if (cacheKey) {
          cache.set(cacheKey, { data: result, timestamp: Date.now() });
        }
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    
    processRequestQueue();
  });
};

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// API response interfaces
export interface PredictionResponse {
  symbol: string;
  direction: 'long' | 'short';
  confidence: number;
  entry_price: number;
  timestamp: string;
  timeframe: string;
}

export interface ScanResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: string;
  direction?: 'long' | 'short';
  confidence?: number;
}

export interface AnalysisResponse {
  symbol: string;
  horizons: {
    [key: string]: {
      price_data: {
        time: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
      }[];
      indicators?: {
        rsi?: number;
        macd?: number;
        bollinger?: string;
      };
    };
  };
}

export interface ChatResponse {
  message: string;
  timestamp: string;
}

export interface TradeConfirmation {
  success: boolean;
  trade_id?: string;
  message: string;
}

// API Service - No mock data, only real API calls
export const apiService = {
  // Health check
  async health() {
    return throttledRequest(async () => {
      const response = await api.get('/tools/health');
      return response.data;
    }, 'health');
  },

  // Status check
  async status() {
    return throttledRequest(async () => {
      const response = await api.get('/tools/health');
      return response.data;
    }, 'status');
  },

  // Auth status check
  async authStatus() {
    return throttledRequest(async () => {
      const response = await api.get('/auth/status');
      return response.data;
    }, 'authStatus');
  },

  // Get predictions for specific symbols
  async predict(params: { symbols: string[]; horizon: string; risk_profile?: string; stop_loss_pct: number; capital_risk_pct: number; drawdown_limit_pct: number }): Promise<PredictionResponse[]> {
    const cacheKey = `predict_${params.symbols.sort().join(',')}_${params.horizon}`;
    return throttledRequest(async () => {
      const response = await api.post('/tools/predict', params);
      return response.data.predictions || response.data;
    }, cacheKey);
  },

  // Scan all symbols for market overview
  async scanAll(params: { symbols: string[]; horizon: string; min_confidence: number; stop_loss_pct: number; capital_risk_pct: number }): Promise<ScanResult[]> {
    const cacheKey = `scanAll_${params.symbols.sort().join(',')}_${params.horizon}`;
    return throttledRequest(async () => {
      const response = await api.post('/tools/scan_all', params);
      return response.data.results || response.data;
    }, cacheKey);
  },

  // Analyze specific symbol with multiple horizons
  async analyze(params: { symbol: string; horizons: string[]; stop_loss_pct: number; capital_risk_pct: number; drawdown_limit_pct: number }): Promise<AnalysisResponse> {
    const cacheKey = `analyze_${params.symbol}_${params.horizons.sort().join(',')}`;
    return throttledRequest(async () => {
      const response = await api.post('/tools/analyze', params);
      return response.data;
    }, cacheKey);
  },

  // Confirm trade parameters
  async confirmTrade(params: {
    stopLoss: number;
    targetProfit: number;
    amount: number;
    riskMode: boolean;
  }): Promise<TradeConfirmation> {
    // Don't cache trade confirmations as they should always be fresh
    return throttledRequest(async () => {
      const response = await api.post('/tools/confirm', params);
      return response.data;
    });
  },

  // Chat query
  async chatQuery(message: string): Promise<ChatResponse> {
    // Don't cache chat queries as they should always be fresh
    return throttledRequest(async () => {
      const response = await api.post('/chat/query', { message });
      return response.data;
    });
  },

  // Send human feedback
  async sendFeedback(feedback: { symbol: string; predicted_action: string; user_feedback: string; actual_return?: number; message?: string }): Promise<any> {
    // Don't cache feedback as they should always be fresh
    return throttledRequest(async () => {
      const response = await api.post('/tools/feedback', feedback);
      return response.data;
    });
  },

  // Train RL agent
  async trainRL(params: { symbol: string; horizon: string; n_episodes: number; force_retrain: boolean }): Promise<any> {
    // Don't cache training requests as they should always be fresh
    return throttledRequest(async () => {
      const response = await api.post('/tools/train_rl', params);
      return response.data;
    });
  },

  // Fetch batch data
  async fetchData(params: { symbols: string[]; period: string; include_features: boolean; refresh: boolean }): Promise<any> {
    // Don't cache data fetching as they should always be fresh
    return throttledRequest(async () => {
      const response = await api.post('/tools/fetch_data', params);
      return response.data;
    });
  },
};

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log rate limit errors for debugging
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded:', error.response.data);
    }
    console.error('API Error:', error);
    throw error;
  }
);

export default api;