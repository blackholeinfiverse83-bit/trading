import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Coins, Package, Loader2, BarChart3, AlertCircle, Zap, Sparkles } from 'lucide-react';
import { POPULAR_STOCKS, POPULAR_CRYPTO, POPULAR_COMMODITIES, stockAPI, AnalyzeResponse } from '../services/api';
import DetailedAnalysis from './DetailedAnalysis';
import { convertUSDToINR, formatINR } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';
import { useConnection } from '../contexts/ConnectionContext';

type AssetType = 'stocks' | 'crypto' | 'commodities';

interface AssetViewProps {
  assetType: AssetType;
  onSearch: (symbol: string) => void;
  predictions: any[];
  loading: boolean;
  error: string | null;
  horizon?: 'intraday' | 'short' | 'long';
  onHorizonChange?: (horizon: 'intraday' | 'short' | 'long') => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

const AssetView = ({ 
  assetType, 
  onSearch, 
  predictions, 
  loading, 
  error, 
  horizon = 'intraday', 
  onHorizonChange, 
  searchQuery: externalSearchQuery, 
  onSearchQueryChange 
}: AssetViewProps) => {
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

  // Get asset-specific data
  const getAssetConfig = () => {
    switch (assetType) {
      case 'stocks':
        return {
          title: 'Stocks Market',
          icon: TrendingUp,
          popularAssets: POPULAR_STOCKS,
          placeholder: 'Enter stock symbol (e.g., AAPL, GOOGL, MSFT)',
          iconColor: 'text-blue-400',
          bgColor: isLight ? 'bg-blue-50 border border-blue-300' : 'bg-blue-900/30 border border-blue-500/50',
          bgGradient: isLight ? 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-300/50' : 'bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/30',
          btnColor: 'bg-blue-500 hover:bg-blue-600',
          popularLabel: 'Popular Stocks',
          popularIcon: Sparkles,
          popularIconColor: 'text-blue-400',
          bgCard: isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/30',
        };
      case 'crypto':
        return {
          title: 'Cryptocurrency Market',
          icon: Coins,
          popularAssets: POPULAR_CRYPTO,
          placeholder: 'Enter crypto symbol (e.g., BTC-USD, ETH-USD, SOL-USD)',
          iconColor: 'text-yellow-400',
          bgColor: isLight ? 'bg-yellow-50 border border-yellow-300' : 'bg-yellow-900/30 border border-yellow-500/50',
          bgGradient: isLight ? 'bg-gradient-to-br from-yellow-50/50 to-orange-50/50 border border-yellow-300/50' : 'bg-gradient-to-br from-yellow-900/10 to-orange-900/10 backdrop-blur-sm border border-yellow-500/20',
          btnColor: 'bg-yellow-500 hover:bg-yellow-600',
          popularLabel: 'Popular Cryptocurrencies',
          popularIcon: Zap,
          popularIconColor: 'text-yellow-400',
          bgCard: isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-slate-800/30 border border-slate-700/30',
        };
      case 'commodities':
        return {
          title: 'Commodities Market',
          icon: Package,
          popularAssets: POPULAR_COMMODITIES,
          placeholder: 'Enter commodity symbol (e.g., GC=F for Gold, CL=F for Oil)',
          iconColor: 'text-orange-400',
          bgColor: isLight ? 'bg-orange-50 border border-orange-300' : 'bg-orange-900/30 border border-orange-500/50',
          bgGradient: isLight ? 'bg-gradient-to-br from-orange-50/50 to-red-50/50 border border-orange-300/50' : 'bg-gradient-to-br from-orange-900/10 to-red-900/10 backdrop-blur-sm border border-orange-500/20',
          btnColor: 'bg-orange-500 hover:bg-orange-600',
          popularLabel: 'Popular Commodities',
          popularIcon: BarChart3,
          popularIconColor: 'text-orange-400',
          bgCard: isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-slate-800/30 border border-slate-700/30',
        };
    }
  };

  const config = getAssetConfig();

  // Commodity names mapping
  const commodityNames: Record<string, string> = {
    'GC=F': 'Gold',
    'SI=F': 'Silver',
    'CL=F': 'Crude Oil',
    'NG=F': 'Natural Gas',
    'HG=F': 'Copper',
    'ZC=F': 'Corn',
    'ZS=F': 'Soybean',
    'ZW=F': 'Wheat',
    'KC=F': 'Coffee',
    'SB=F': 'Sugar',
    'CT=F': 'Cotton',
    'CC=F': 'Cocoa',
    'OJ=F': 'Orange Juice',
    'LE=F': 'Live Cattle',
    'HE=F': 'Lean Hogs',
  };

  // Validate symbol format
  const validateSymbol = (symbol: string): { valid: boolean; error?: string } => {
    if (!symbol || symbol.trim().length === 0) {
      return { valid: false, error: 'Symbol cannot be empty' };
    }
    
    const trimmed = symbol.trim().toUpperCase();
    if (trimmed.length > 20) {
      return { valid: false, error: 'Symbol must be 20 characters or less' };
    }
    
    // Different validation patterns for different asset types
    if (assetType === 'stocks') {
      if (!/^[A-Z0-9.-]+$/.test(trimmed)) {
        return { valid: false, error: 'Symbol contains invalid characters' };
      }
    } else if (assetType === 'crypto') {
      if (!/^[A-Z0-9-]+$/.test(trimmed)) {
        return { valid: false, error: 'Crypto symbol contains invalid characters' };
      }
    } else if (assetType === 'commodities') {
      if (!/^[\w=]+$/.test(trimmed)) {
        return { valid: false, error: 'Commodity symbol contains invalid characters' };
      }
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
    setAnalysisState(() => ({
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
      let filtered: string[] = [];
      
      if (assetType === 'stocks') {
        filtered = config.popularAssets.filter((symbol: string) => 
          symbol.toUpperCase().includes(query) || 
          symbol.replace('.NS', '').toUpperCase().includes(query)
        ).slice(0, 8);
      } else if (assetType === 'crypto') {
        filtered = config.popularAssets.filter((symbol: string) => 
          symbol.toUpperCase().includes(query)
        ).slice(0, 8);
      } else if (assetType === 'commodities') {
        filtered = config.popularAssets.filter((symbol: string) => 
          symbol.toUpperCase().includes(query) ||
          (commodityNames[symbol] && commodityNames[symbol].toUpperCase().includes(query))
        ).slice(0, 8);
      }
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, assetType]);

  // Determine if input should be disabled
  const isInputDisabled = !connectionState.isConnected || 
                         (healthStatus && healthStatus.status !== 'healthy') ||
                         loading || analysisState.predictionStatus === 'loading' || healthLoading;

  // Get display name for a symbol
  const getDisplayName = (symbol: string) => {
    if (assetType === 'commodities' && commodityNames[symbol]) {
      return commodityNames[symbol];
    }
    if (assetType === 'stocks') {
      return symbol.replace('.NS', '');
    }
    if (assetType === 'crypto') {
      return symbol.replace('-USD', '');
    }
    return symbol;
  };

  // Get asset-specific prediction display
  const renderPredictionResults = () => {
    if (predictions.length === 0) {
      if (loading) {
        return (
          <div className={`${config.bgCard} rounded-xl p-8 text-center`}>
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Fetching {assetType} predictions from backend...</p>
            <p className={`${isLight ? 'text-gray-500' : 'text-gray-500'} text-sm mt-2`}>This may take 60-90 seconds for first-time predictions</p>
          </div>
        );
      } else {
        // Empty state with popular assets
        const IconComponent = config.icon;
        const PopularIcon = config.popularIcon;
        
        return (
          <div className={`${config.bgCard} rounded-xl p-8 text-center`}>
            <IconComponent className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
            <h3 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'} mb-2`}>Ready to Search {config.title}</h3>
            <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mb-4`}>Enter a {assetType} symbol above or click a popular {assetType} to get AI-powered predictions</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {config.popularAssets.slice(0, 10).map((symbol: string) => (
                <button
                  key={symbol}
                  onClick={() => onSearch(symbol)}
                  className={`px-4 py-2 ${isLight ? `${assetType === 'stocks' ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300' : assetType === 'crypto' ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300' : 'bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300'}` : `${assetType === 'stocks' ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30' : assetType === 'crypto' ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30' : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30'}`} rounded-lg text-sm font-medium transition-all`}
                  title={commodityNames[symbol] || symbol}
                >
                  {getDisplayName(symbol)}
                </button>
              ))}
            </div>
          </div>
        );
      }
    }

    return (
      <div className={`${config.bgCard} rounded-xl p-6`}>
        <h3 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'} mb-4 flex items-center gap-2`}>
          {React.createElement(config.icon as any, { className: "w-5 h-5" })}
          {config.title} Predictions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((pred, index) => {
            const symbol = pred.symbol;
            const displayName = getDisplayName(symbol);
            const name = assetType === 'commodities' && commodityNames[symbol] ? commodityNames[symbol] : displayName;
            
            return (
              <div 
                key={index} 
                className={`${isLight ? 
                  assetType === 'stocks' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-300' : 
                  assetType === 'crypto' ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-300' : 
                  'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-300' : 
                  assetType === 'stocks' ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/10 border border-blue-500/30' : 
                  assetType === 'crypto' ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/10 border border-yellow-500/30' : 
                  'bg-gradient-to-br from-orange-900/20 to-red-900/10 border border-orange-500/30'} rounded-lg p-4`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {React.createElement(config.icon as any, { className: "w-5 h-5 text-blue-400" })}
                    <div>
                      <span className={`${isLight ? 'text-gray-900' : 'text-white'} font-bold text-lg block`}>{name}</span>
                      {assetType === 'commodities' && (
                        <span className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs`}>{symbol}</span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    pred.action === 'LONG' ? 'bg-green-500/20 text-green-400' :
                    pred.action === 'SHORT' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {pred.action || 'HOLD'}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Current: {formatINR(convertUSDToINR(pred.current_price || 0))}</p>
                  <p className={`${isLight ? 'text-gray-900' : 'text-white'} font-semibold`}>Predicted: {formatINR(convertUSDToINR(pred.predicted_price || 0))}</p>
                  <p className={`text-sm font-semibold ${(pred.predicted_return || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(pred.predicted_return || 0) > 0 ? '+' : ''}{pred.predicted_return?.toFixed(2) || 0}%
                  </p>
                  <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs`}>Confidence: {((pred.confidence || 0) * 100).toFixed(0)}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'} mb-1 flex items-center gap-2`}>
          {React.createElement(config.icon as any, { className: `w-5 h-5 ${config.iconColor}` })}
          {config.title}
        </h2>
        <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs`}>
          {assetType === 'stocks' && 'Search and analyze stocks with AI-powered predictions'}
          {assetType === 'crypto' && 'Track and analyze cryptocurrencies with real-time predictions'}
          {assetType === 'commodities' && 'Monitor and analyze commodities futures with AI predictions'}
        </p>
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

      <div className={`${config.bgGradient} rounded-lg p-3`}>
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
              placeholder={isInputDisabled ? "System unavailable" : config.placeholder}
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
                    <span className="font-medium">{getDisplayName(symbol)}</span>
                    {assetType === 'commodities' && commodityNames[symbol] && (
                      <span className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>{commodityNames[symbol]}</span>
                    )}
                    {assetType === 'stocks' && symbol.includes('.NS') && (
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
            className={`px-3 py-1.5 ${config.btnColor} text-white text-sm font-semibold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5`}
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
            {React.createElement(config.popularIcon as any, { className: `w-4 h-4 ${config.popularIconColor}` })}
            {config.popularLabel}:
          </p>
          <div className="flex flex-wrap gap-2">
            {config.popularAssets.slice(0, 20).map((symbol: string) => (
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
                title={commodityNames[symbol] || symbol}
              >
                {getDisplayName(symbol)}
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

      {renderPredictionResults()}

      {/* Unified Analysis Panel - ONE panel per symbol */}
      {analysisState.selectedSymbol && (
        <div className={`${config.bgCard} rounded-xl p-6`}>
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

export default AssetView;