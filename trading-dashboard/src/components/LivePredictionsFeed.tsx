import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Clock, Play, Pause, RotateCcw, Plus, X } from 'lucide-react';
import { apiService } from '../services/api';
import { toast } from 'sonner';

interface Prediction {
  id: string;
  asset: string;
  symbol: string;
  direction: 'long' | 'short';
  confidence: number;
  entryPrice: number;
  timestamp: string;
  timeframe: string;
}

export function LivePredictionsFeed() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true); // Start streaming by default
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['AAPL', 'GOOGL']); // Default symbols
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const symbolInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Available symbols in backend
  const availableSymbols = ['AAPL', 'GOOGL', 'MSFT'];

  // Start live streaming
  const startStreaming = async () => {
    if (selectedSymbols.length === 0) {
      // Add default symbols if none selected
      setSelectedSymbols(['AAPL', 'GOOGL']);
      return;
    }
    
    setIsStreaming(true);
    await fetchPredictions();
    
    // Refresh every 30 seconds to work with request throttling
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(fetchPredictions, 30000);
  };

  // Stop live streaming
  const stopStreaming = () => {
    setIsStreaming(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Reset streaming
  const resetStreaming = () => {
    stopStreaming();
    setPredictions([]);
    setSelectedSymbols(['AAPL', 'GOOGL']); // Reset to default symbols
    if (symbolInputRef.current) {
      symbolInputRef.current.value = '';
    }
    
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Add symbol to watch list
  const addSymbol = () => {
    if (symbolInputRef.current && symbolInputRef.current.value.trim()) {
      const symbol = symbolInputRef.current.value.trim().toUpperCase();
      
      // Validate symbol is available
      if (!availableSymbols.includes(symbol)) {
        toast.error(`Symbol ${symbol} not available. Available symbols: ${availableSymbols.join(', ')}`);
        return;
      }
      
      // Check if already added
      if (selectedSymbols.includes(symbol)) {
        toast.error(`Symbol ${symbol} already added`);
        return;
      }
      
      setSelectedSymbols(prev => [...prev, symbol]);
      symbolInputRef.current.value = '';
    }
  };

  // Remove symbol from watch list
  const removeSymbol = (symbol: string) => {
    setSelectedSymbols(prev => prev.filter(s => s !== symbol));
    
    // If no symbols left, use default symbols
    if (selectedSymbols.length <= 1) {
      setSelectedSymbols(['AAPL', 'GOOGL']);
    }
  };

  // Fetch predictions
  const fetchPredictions = async () => {
    if (selectedSymbols.length === 0) return;
    
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      const data = await apiService.predict(selectedSymbols, 'intraday');
      
      // Transform API response to match component interface
      const transformedPredictions: Prediction[] = data.map((item: any, index: number) => ({
        id: `pred-${index}-${Date.now()}`,
        asset: item.symbol,
        symbol: item.symbol,
        direction: item.direction || 'hold',
        confidence: item.confidence || 0,
        entryPrice: item.entry_price || item.price || item.current_price || 0,
        timestamp: item.timestamp || new Date().toISOString(),
        timeframe: item.timeframe || '1s',
      }));
      
      setPredictions(transformedPredictions);
      setLoading(false);
    } catch (error: any) {
      // Don't show error if it's an abort error
      if (error.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      
      console.error('Prediction fetch error:', error);
      setLoading(false);
      
      // Handle different types of errors
      if (error.response?.status === 422) {
        console.error('Validation error:', error.response.data);
        toast.error('Invalid request format. Please check the symbol and try again.');
      } else if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please wait before making more requests.');
        stopStreaming(); // Stop streaming to prevent continuous rate limit errors
      } else if (error.response?.status === 400) {
        toast.error(`Bad request: ${error.response.data.detail || 'Invalid parameters'}`);
      } else {
        toast.error('Failed to fetch predictions. Please check if the backend is running.');
      }
    }
  };

  // Start streaming on component mount
  useEffect(() => {
    startStreaming();
    
    return () => {
      stopStreaming();
    };
  }, []);

  // Control Panel
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800/50 bg-slate-800/30">
        <h2 className="text-white flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          Live Predictions
        </h2>
        <p className="text-sm text-slate-400 mt-1">Real-time AI signals</p>
      </div>

      {/* Control Panel */}
      <div className="p-4 border-b border-slate-800/50 bg-slate-800/20">
        <div className="flex gap-2 mb-3">
          <input
            ref={symbolInputRef}
            type="text"
            placeholder="Enter symbol (AAPL, GOOGL, MSFT)"
            className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addSymbol()}
          />
          <button
            onClick={addSymbol}
            className="px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm"
          >
            Add
          </button>
        </div>
        
        {/* Selected Symbols */}
        {selectedSymbols.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedSymbols.map(symbol => (
              <div key={symbol} className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded-lg">
                <span className="text-xs text-white">{symbol}</span>
                <button 
                  onClick={() => removeSymbol(symbol)}
                  className="text-slate-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={isStreaming ? stopStreaming : startStreaming}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${isStreaming 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'}`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Live
              </>
            )}
          </button>
          <button
            onClick={resetStreaming}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="p-4 text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm mt-2">Fetching live data...</p>
        </div>
      )}

      {/* Predictions Display */}
      <div className="p-4 space-y-3 h-full overflow-y-auto">
        {predictions.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {predictions.map((prediction) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                layout
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white">{prediction.asset}</span>
                      <span className="text-xs text-slate-400">{prediction.symbol}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{prediction.timeframe}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${
                    (prediction.direction || '').toLowerCase() === 'long'
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {(prediction.direction || '').toLowerCase() === 'long' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm uppercase">{prediction.direction}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Entry Price</span>
                    <span className="text-white">${(prediction.entryPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prediction.confidence}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full ${
                            prediction.confidence >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                        />
                      </div>
                      <span className="text-sm text-white">{(prediction.confidence || 0)}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          !loading && (
            <div className="text-center py-8">
              <p className="text-slate-400">
                {selectedSymbols.length > 0 
                  ? 'Click "Start Live" to begin streaming predictions' 
                  : 'Add symbols and start live streaming to see predictions'}
              </p>
              <p className="text-slate-500 text-sm mt-2">Available symbols: {availableSymbols.join(', ')}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}