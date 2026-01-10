import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Sparkles, Loader2, BarChart3, AlertCircle } from 'lucide-react';
import { POPULAR_STOCKS, stockAPI, AnalyzeResponse } from '../services/api';
import DetailedAnalysis from './DetailedAnalysis';
import { convertUSDToINR, formatINR } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';
import { useConnection } from '../contexts/ConnectionContext';

interface StocksViewProps {
  onSearch: (symbol: string) => void;
  onAnalyze?: (symbol: string) => void;
  predictions: any[];
  loading: boolean;
  error: string | null;
  horizon?: 'intraday' | 'short' | 'long';
  onHorizonChange?: (horizon: 'intraday' | 'short' | 'long') => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

const StocksView = ({ onSearch, onAnalyze, predictions, loading, error, horizon = 'intraday', onHorizonChange, searchQuery: externalSearchQuery, onSearchQueryChange }: StocksViewProps) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  
  // Unified state for ONE symbol analysis
  const [analysisState, setAnalysisState] = useState<{
    selectedSymbol: string | null;
    riskParams: {
      stopLossPct: number;
      capitalRiskPct: number;
      drawdownLimitPct: number;
    };
    predictionResult: any | null;
    predictionStatus: 'idle' | 'loading' | 'success' | 'error';
    predictionError: string | null;
  }>({
    selectedSymbol: null,
    riskParams: {
      stopLossPct: 2.0,
      capitalRiskPct: 1.0,
      drawdownLimitPct: 5.0
    },
    predictionResult: null,
    predictionStatus: 'idle',
    predictionError: null
  });
  
  const { connectionState } = useConnection();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchQueryChange || setInternalSearchQuery;

  // Validate symbol format
  const validateSymbol = (symbol: string): { valid: boolean; error?: string } => {
    if (!symbol || symbol.trim().length === 0) {
      return { valid: false, error: 'Symbol cannot be empty' };
    }
    
    const trimmed = symbol.trim().toUpperCase();
    if (trimmed.length > 20) {
      return { valid: false, error: 'Symbol must be 20 characters or less' };
    }
    
    if (!/^[A-Z0-9.-]+$/.test(trimmed)) {
      return { valid: false, error: 'Symbol contains invalid characters' };
    }
    
    return { valid: true };
  };

  // Check system health before predictions
  const checkHealth = async (): Promise<boolean> => {
    try {
      setHealthLoading(true);
      const health = await stockAPI.health();
      setHealthStatus(health);
      return health.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({ status: 'error', error: 'Health check failed' });
      return false;
    } finally {
      setHealthLoading(false);
    }
  };

  // Handle search with unified state management
  const handleSearch = async (symbol: string) => {
    // Step 1: Validate symbol format
    const validation = validateSymbol(symbol);
    if (!validation.valid) {
      setInputError(validation.error || 'Invalid symbol');
      return;
    }
    
    setInputError(null);
    const normalizedSymbol = symbol.trim().toUpperCase();
    
    // Step 2: Check backend connection
    if (!connectionState.isConnected) {
      setInputError('Backend server is not connected. Please check connection.');
      return;
    }
    
    // Step 3: Check health SPI
    const isHealthy = await checkHealth();
    if (!isHealthy) {
      setInputError('Prediction service is not ready. Please wait for system to initialize.');
      return;
    }
    
    // Step 4: Reset state for new symbol (hard reset)
    setAnalysisState(prev => ({
      selectedSymbol: normalizedSymbol,
      riskParams: {
        stopLossPct: 2.0,
        capitalRiskPct: 1.0,
        drawdownLimitPct: 5.0
      },
      predictionResult: null,
      predictionStatus: 'loading',
      predictionError: null
    }));
    
    // Step 5: Call analyze API
    try {
      const response = await stockAPI.analyze(
        normalizedSymbol,
        ['intraday', 'short', 'long'],
        2.0, 1.0, 5.0
      );
      
      setAnalysisState(prev => ({
        ...prev,
        predictionResult: response,
        predictionStatus: 'success',
        predictionError: null
      }));
    } catch (error: any) {
      setAnalysisState(prev => ({
        ...prev,
        predictionResult: null,
        predictionStatus: 'error',
        predictionError: error.message || 'Failed to load analysis'
      }));
    }
    
    // Also call parent onSearch for compatibility
    onSearch(normalizedSymbol);
  };

  // Handle risk parameter changes and re-analysis
  const handleReAnalyze = async () => {
    if (!analysisState.selectedSymbol) return;
    
    setAnalysisState(prev => ({
      ...prev,
      predictionStatus: 'loading',
      predictionError: null
    }));
    
    try {
      const response = await stockAPI.analyze(
        analysisState.selectedSymbol,
        ['intraday', 'short', 'long'],
        analysisState.riskParams.stopLossPct,
        analysisState.riskParams.capitalRiskPct,
        analysisState.riskParams.drawdownLimitPct
      );
      
      setAnalysisState(prev => ({
        ...prev,
        predictionResult: response,
        predictionStatus: 'success',
        predictionError: null
      }));
    } catch (error: any) {
      setAnalysisState(prev => ({
        ...prev,
        predictionResult: null,
        predictionStatus: 'error',
        predictionError: error.message || 'Failed to re-analyze'
      }));
    }
  };

  // Update risk parameters
  const updateRiskParam = (param: keyof typeof analysisState.riskParams, value: number) => {
    setAnalysisState(prev => ({
      ...prev,
      riskParams: {
        ...prev.riskParams,
        [param]: value
      }
    }));
  };

  // Reset risk parameters
  const resetRiskParams = () => {
    setAnalysisState(prev => ({
      ...prev,
      riskParams: {
        stopLossPct: 2.0,
        capitalRiskPct: 1.0,
        drawdownLimitPct: 5.0
      }
    }));
  };

  // Input change handler - only updates local state
  const handleInputChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setSearchQuery(upperValue);
    setInputError(null); // Clear input errors on typing
  };

  // Generate suggestions based on search query
  useEffect(() => {
    if (searchQuery && searchQuery.length > 0) {
      const query = searchQuery.toUpperCase();
      const filtered = POPULAR_STOCKS.filter(symbol => 
        symbol.toUpperCase().includes(query) || 
        symbol.replace('.NS', '').toUpperCase().includes(query)
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Determine if input should be disabled
  const isInputDisabled = !connectionState.isConnected || 
                         (healthStatus && healthStatus.status !== 'healthy') ||
                         loading || analysisState.predictionStatus === 'loading' || healthLoading;

  return (
    <div className="space-y-4">
      <div>
        <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'} mb-1 flex items-center gap-2`}>
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Stocks Market
        </h2>
        <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs`}>Search and analyze stocks with AI-powered predictions</p>
      </div>

      {/* System Status Warning */}
      {(!connectionState.isConnected || (healthStatus && healthStatus.status !== 'healthy')) && (
        <div className={`${isLight ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-yellow-900/30 border-2 border-yellow-500/50'} rounded-xl p-4`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <p className={`${isLight ? 'text-yellow-700' : 'text-yellow-400'} font-semibold`}>
              {!connectionState.isConnected 
                ? 'Backend Disconnected' 
                : 'Prediction Service Unavailable'
              }
            </p>
          </div>
          <p className={`${isLight ? 'text-yellow-600' : 'text-yellow-300'} text-sm mt-1`}>
            {!connectionState.isConnected 
              ? 'Cannot connect to backend server. Search is disabled.' 
              : 'Prediction models are not ready. Search is disabled until system initializes.'
            }
          </p>
        </div>
      )}

      <div className={`${isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/30'} rounded-lg p-3`}>
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchQuery && !isInputDisabled) {
                  setShowSuggestions(false);
                  handleSearch(searchQuery);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowSuggestions(false);
                }
              }}
              placeholder={isInputDisabled ? "System unavailable" : "Enter stock symbol (e.g., AAPL, GOOGL, MSFT)"}
              disabled={isInputDisabled}
              className={`w-full pl-8 pr-3 py-1.5 text-sm border rounded ${isLight ? 'text-gray-900 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'text-white bg-slate-700/50 border-slate-600 focus:ring-blue-500'} placeholder-gray-400 focus:outline-none focus:ring-1 ${
                isInputDisabled 
                  ? `${isLight ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50' : 'bg-slate-800/50 border-slate-600/50 cursor-not-allowed opacity-50'}`
                  : ''
              }`}
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && !isInputDisabled && (
              <div className={`absolute top-full left-0 right-0 mt-1 ${isLight ? 'bg-white border border-gray-300' : 'bg-slate-800 border border-slate-700'} rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto`}>
                {suggestions.map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    onClick={() => {
                      setSearchQuery(symbol);
                      setShowSuggestions(false);
                      handleSearch(symbol);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`w-full text-left px-4 py-2 text-sm ${isLight ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' : 'text-gray-300 hover:bg-slate-700 hover:text-white'} transition-colors flex items-center justify-between`}
                  >
                    <span className="font-medium">{symbol.replace('.NS', '')}</span>
                    {symbol.includes('.NS') && (
                      <span className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>NSE</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          {onHorizonChange && (
            <select
              value={horizon}
              onChange={(e) => onHorizonChange(e.target.value as any)}
              disabled={isInputDisabled}
              className={`px-2.5 py-1.5 text-sm border rounded ${isLight ? 'text-gray-900 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'text-white bg-slate-700/50 border-slate-600 focus:ring-blue-500'} focus:outline-none focus:ring-1 font-medium ${
                isInputDisabled
                  ? `${isLight ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50' : 'bg-slate-800/50 border-slate-600/50 cursor-not-allowed opacity-50'}`
                  : ''
              }`}
            >
              <option value="intraday">📈 Intraday</option>
              <option value="short">📅 Short (5 days)</option>
              <option value="long">📆 Long (30 days)</option>
            </select>
          )}
          <button
            onClick={() => searchQuery && handleSearch(searchQuery)}
            disabled={isInputDisabled || !searchQuery}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading || healthLoading || analysisState.predictionStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Analyze</span>
          </button>
        </div>

        {/* Input Error */}
        {inputError && (
          <div className={`mb-3 ${isLight ? 'bg-red-50 border border-red-300' : 'bg-red-900/30 border border-red-500/50'} rounded-lg p-3`}>
            <p className={`${isLight ? 'text-red-700' : 'text-red-400'} text-sm`}>{inputError}</p>
          </div>
        )}

        <div>
          <p className={`${isLight ? 'text-gray-700' : 'text-gray-300'} mb-3 font-medium flex items-center gap-2`}>
            <Sparkles className="w-4 h-4 text-blue-400" />
            Popular Stocks:
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_STOCKS.slice(0, 20).map((symbol) => (
              <button
                key={symbol}
                onClick={() => {
                  setSearchQuery(symbol);
                  handleSearch(symbol);
                }}
                disabled={isInputDisabled}
                className={`px-3 py-1.5 ${isLight ? 'text-gray-700 bg-gray-100 hover:bg-blue-500 hover:text-white' : 'text-gray-300 bg-slate-700/50 hover:bg-blue-500 hover:text-white'} rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                  isInputDisabled
                    ? `${isLight ? 'bg-gray-200 cursor-not-allowed opacity-50' : 'bg-slate-800/50 cursor-not-allowed opacity-50'}`
                    : ''
                }`}
              >
                {symbol.replace('.NS', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className={`${isLight ? 'bg-red-50 border-2 border-red-300' : 'bg-red-900/30 border-2 border-red-500/50'} rounded-xl p-4`}>
          <p className={`${isLight ? 'text-red-700' : 'text-red-400'}`}>{error}</p>
        </div>
      )}

      {loading && (
        <div className={`${isLight ? 'bg-blue-50 border border-blue-300' : 'bg-blue-500/10 border border-blue-500/30'} rounded-xl p-6 flex items-center justify-center gap-3`}>
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          <span className={`${isLight ? 'text-blue-700' : 'text-blue-400'} font-semibold`}>Loading predictions...</span>
        </div>
      )}

      {!loading && !error && predictions.length === 0 && searchQuery && (
        <div className={`${isLight ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-yellow-900/30 border-2 border-yellow-500/50'} rounded-xl p-4`}>
          <p className={`${isLight ? 'text-yellow-700' : 'text-yellow-400'}`}>No predictions found. Try searching for a different symbol or check if the backend is running.</p>
        </div>
      )}

      {/* Unified Analysis Panel - ONE panel per symbol */}
      {analysisState.selectedSymbol && (
        <div className={`${isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/30'} rounded-xl p-6`}>
          {/* Header */}
          <h3 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'} mb-4 flex items-center gap-2`}>
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Analysis for {analysisState.selectedSymbol}
          </h3>
          
          {/* Risk Settings Section */}
          <div className={`${isLight ? 'bg-gray-50/50 border border-gray-200/50' : 'bg-slate-700/30 border border-slate-600/50'} rounded-lg p-4 mb-4`}>
            <h4 className={`${isLight ? 'text-gray-900' : 'text-white'} font-medium text-sm mb-3 flex items-center gap-2`}>
              <AlertCircle className="w-4 h-4 text-orange-400" />
              Risk Parameters
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={`block ${isLight ? 'text-gray-700' : 'text-gray-300'} text-xs mb-1`}>Stop Loss %</label>
                <input
                  type="number"
                  value={analysisState.riskParams.stopLossPct}
                  onChange={(e) => updateRiskParam('stopLossPct', parseFloat(e.target.value) || 0)}
                  min="0.1" max="50" step="0.1"
                  className={`w-full px-2 py-1 text-xs ${isLight ? 'bg-white border border-gray-300 text-gray-900 focus:ring-orange-500 focus:border-orange-500' : 'bg-slate-600 border border-slate-500 text-white focus:ring-orange-500'} rounded focus:outline-none focus:ring-1`}
                />
              </div>
              <div>
                <label className={`block ${isLight ? 'text-gray-700' : 'text-gray-300'} text-xs mb-1`}>Capital Risk %</label>
                <input
                  type="number"
                  value={analysisState.riskParams.capitalRiskPct}
                  onChange={(e) => updateRiskParam('capitalRiskPct', parseFloat(e.target.value) || 0)}
                  min="0.1" max="100" step="0.1"
                  className={`w-full px-2 py-1 text-xs ${isLight ? 'bg-white border border-gray-300 text-gray-900 focus:ring-orange-500 focus:border-orange-500' : 'bg-slate-600 border border-slate-500 text-white focus:ring-orange-500'} rounded focus:outline-none focus:ring-1`}
                />
              </div>
              <div>
                <label className={`block ${isLight ? 'text-gray-700' : 'text-gray-300'} text-xs mb-1`}>Drawdown %</label>
                <input
                  type="number"
                  value={analysisState.riskParams.drawdownLimitPct}
                  onChange={(e) => updateRiskParam('drawdownLimitPct', parseFloat(e.target.value) || 0)}
                  min="0.1" max="100" step="0.1"
                  className={`w-full px-2 py-1 text-xs ${isLight ? 'bg-white border border-gray-300 text-gray-900 focus:ring-orange-500 focus:border-orange-500' : 'bg-slate-600 border border-slate-500 text-white focus:ring-orange-500'} rounded focus:outline-none focus:ring-1`}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={resetRiskParams}
                className={`px-3 py-1 ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-900' : 'bg-slate-600 hover:bg-slate-500 text-white'} text-xs rounded`}
              >
                Reset Defaults
              </button>
              <button
                onClick={handleReAnalyze}
                disabled={analysisState.predictionStatus === 'loading'}
                className={`px-4 py-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 ${isLight ? 'text-white' : 'text-white'} text-xs rounded font-medium flex items-center gap-1`}
              >
                {analysisState.predictionStatus === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Apply & Re-analyze
              </button>
            </div>
          </div>
          
          {/* Prediction Results Section */}
          <div className={`${isLight ? 'bg-gray-50/50 border border-gray-200/50' : 'bg-slate-700/20 border border-slate-600/30'} rounded-lg p-4`}>
            <h4 className={`${isLight ? 'text-gray-900' : 'text-white'} font-medium text-sm mb-3`}>Prediction Results</h4>
            
            {analysisState.predictionStatus === 'loading' && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin mr-2" />
                <span className={`${isLight ? 'text-blue-700' : 'text-blue-400'}`}>Analyzing {analysisState.selectedSymbol}...</span>
              </div>
            )}
            
            {analysisState.predictionStatus === 'error' && (
              <div className={`${isLight ? 'bg-red-50 border border-red-300' : 'bg-red-900/30 border border-red-500/50'} rounded-lg p-3`}>
                <p className={`${isLight ? 'text-red-700' : 'text-red-400'} text-sm`}>{analysisState.predictionError}</p>
              </div>
            )}
            
            {analysisState.predictionStatus === 'success' && analysisState.predictionResult && (
              <DetailedAnalysis data={analysisState.predictionResult} isLight={false} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const getActionIcon = (action: string) => {
  switch (action?.toUpperCase()) {
    case 'LONG':
    case 'BUY':
      return <TrendingUp className="w-5 h-5 text-green-400" />;
    case 'SHORT':
    case 'SELL':
      return <TrendingDown className="w-5 h-5 text-red-400" />;
    case 'HOLD':
    default:
      return <div className="w-5 h-5" />;
  }
};

export default StocksView;
