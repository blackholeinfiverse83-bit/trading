import { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { Brain, Play, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { stockAPI, POPULAR_STOCKS } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const TrainModelPage = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [symbol, setSymbol] = useState('');
  const [horizon, setHorizon] = useState('intraday');
  const [episodes, setEpisodes] = useState(10);
  const [forceRetrain, setForceRetrain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleSymbolChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setSymbol(upperValue);
    setError(null);
    
    // Filter suggestions based on input
    if (upperValue.length > 0) {
      const filtered = POPULAR_STOCKS.filter(stock => 
        stock.includes(upperValue) || 
        stock.replace('.NS', '').includes(upperValue)
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setSymbol(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateForm = () => {
    console.log('Validating form:', { symbol, episodes });
    if (!symbol.trim()) {
      setError('Please enter a symbol');
      return false;
    }
    if (episodes < 1 || episodes > 100) {
      setError('Episodes must be between 1 and 100');
      return false;
    }
    console.log('Form validation passed');
    return true;
  };

  const handleTrain = async () => {
    console.log('handleTrain called');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Starting training with:', { symbol, horizon, episodes, forceRetrain });
    console.log('Horizon value being sent:', horizon);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Calling stockAPI.trainRL...');
      const response = await stockAPI.trainRL(symbol.trim(), horizon, episodes, forceRetrain);
      console.log('Training response received:', response);
      setResult(response);
    } catch (err: any) {
      console.error('Training error:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      setError(err.message || 'Training failed. Please try again.');
    } finally {
      console.log('Training completed, setting loading to false');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getHorizonLabel = (h: string) => {
    switch (h) {
      case 'intraday': return 'Intraday';
      case 'short': return 'Swing';
      case 'long': return 'Long-term';
      default: return h;
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-3 py-2">
        <div className="mb-3">
          <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'} mb-1 flex items-center gap-2`}>
            <Brain className="w-6 h-6" />
            Train Model
          </h1>
          <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Configure and train AI models for stock predictions</p>
        </div>

        {/* Background overlay for better contrast */}
        <div className="relative">
          <div className={`absolute inset-0 ${isLight ? 'bg-gray-50/20' : 'bg-black/20'} rounded-lg`}></div>
          <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column - Training Configuration (40%) */}
            <div className="lg:col-span-2">
              <div className={`${isLight ? 'bg-white/50 border-gray-200/50' : 'bg-slate-800/50 border-slate-700/50'} backdrop-blur-sm rounded-lg border p-4 shadow-lg`}>
                <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'} mb-4`}>Configuration</h2>
              
              <div className="space-y-3">
                {/* Row 1: Symbol + Horizon */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-1`}>Symbol</label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={symbol}
                      onChange={(e) => handleSymbolChange(e.target.value)}
                      onFocus={() => {
                        if (suggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setShowSuggestions(false);
                        }
                      }}
                      placeholder="AAPL"
                      className={`w-full px-3 py-2 ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900' : 'bg-slate-700 border-slate-600 text-white'} border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div 
                        ref={suggestionsRef}
                        className={`absolute top-full left-0 right-0 mt-1 ${isLight ? 'bg-white border-gray-300' : 'bg-slate-700 border-slate-600'} border rounded shadow-lg max-h-48 overflow-y-auto z-50`}
                      >
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectSuggestion(suggestion);
                            }}
                            className={`w-full px-3 py-2 text-left ${isLight ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-slate-600'} text-sm transition-colors`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-1`}>Horizon</label>
                    <select
                      value={horizon}
                      onChange={(e) => setHorizon(e.target.value)}
                      className={`w-full px-3 py-2 ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900' : 'bg-slate-700 border-slate-600 text-white'} border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="intraday">Intraday</option>
                      <option value="short">Swing</option>
                      <option value="long">Long-term</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Episodes + Force Retrain */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-1`} title="More episodes = longer training time">Episodes</label>
                    <input
                      type="number"
                      value={episodes}
                      onChange={(e) => setEpisodes(Number(e.target.value))}
                      min="1"
                      max="100"
                      className={`w-full px-3 py-2 ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900' : 'bg-slate-700 border-slate-600 text-white'} border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer" title="Retrain even if model exists">
                      <input
                        type="checkbox"
                        checked={forceRetrain}
                        onChange={(e) => setForceRetrain(e.target.checked)}
                        className={`w-4 h-4 text-blue-600 ${isLight ? 'bg-gray-50 border-gray-300' : 'bg-slate-700 border-slate-600'} rounded focus:ring-blue-500`}
                      />
                      <span className={`text-sm ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Force Retrain</span>
                    </label>
                  </div>
                </div>

                {/* Train Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      console.log('Train Model button clicked');
                      handleTrain();
                    }}
                    disabled={loading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors flex items-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Training...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Train Model
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

            {/* Right Column - Results (60%) */}
            <div className="lg:col-span-3">
              {error && (
                <div className={`${isLight ? 'bg-red-50/60 border-red-300/70' : 'bg-red-900/60 border-red-500/70'} backdrop-blur-sm border rounded-lg p-3 mb-4 shadow-lg`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`w-4 h-4 ${isLight ? 'text-red-600' : 'text-red-400'} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className={`${isLight ? 'text-red-800' : 'text-red-400'} font-medium text-sm`}>Training Failed</p>
                      <p className={`${isLight ? 'text-red-700' : 'text-red-300'} text-sm`}>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {result && (
                <div className={`${isLight ? 'bg-white/50 border-gray-200/50' : 'bg-slate-800/50 border-slate-700/50'} backdrop-blur-sm rounded-lg border p-4 animate-fadeIn shadow-lg`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`flex items-center gap-2 px-2 py-1 ${isLight ? 'bg-green-100/80 border-green-300/50 text-green-700' : 'bg-green-500/20 border-green-500/50 text-green-400'} border rounded text-sm`}>
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Training Completed</span>
                    </div>
                  </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className={`${isLight ? 'bg-gray-50' : 'bg-slate-700/50'} rounded p-3`}>
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs mb-1`}>Symbol</p>
                    <p className={`${isLight ? 'text-gray-900' : 'text-white'} font-medium`}>{symbol}</p>
                  </div>
                  <div className={`${isLight ? 'bg-gray-50' : 'bg-slate-700/50'} rounded p-3`}>
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs mb-1`}>Horizon</p>
                    <p className={`${isLight ? 'text-gray-900' : 'text-white'} font-medium`}>{getHorizonLabel(horizon)}</p>
                  </div>
                  <div className={`${isLight ? 'bg-gray-50' : 'bg-slate-700/50'} rounded p-3`}>
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs mb-1`}>Model Type</p>
                    <p className={`${isLight ? 'text-gray-900' : 'text-white'} font-medium`}>DQN</p>
                  </div>
                  <div className={`${isLight ? 'bg-gray-50' : 'bg-slate-700/50'} rounded p-3`}>
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs mb-1`}>Episodes</p>
                    <p className={`${isLight ? 'text-gray-900' : 'text-white'} font-medium`}>{episodes}</p>
                  </div>
                  <div className={`${isLight ? 'bg-gray-50' : 'bg-slate-700/50'} rounded p-3`} title="Higher values indicate better model performance">
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs mb-1`}>Avg Reward</p>
                    <p className={`${isLight ? 'text-gray-900' : 'text-white'} font-medium`}>
                      {result.training_metrics?.average_reward?.toFixed(3) || 'N/A'}
                    </p>
                  </div>
                  <div className={`${isLight ? 'bg-gray-50' : 'bg-slate-700/50'} rounded p-3`} title="Percentage of profitable trading actions">
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs mb-1`}>Win Rate</p>
                    <p className={`${isLight ? 'text-gray-900' : 'text-white'} font-medium`}>
                      {result.training_metrics?.win_rate ? `${(result.training_metrics.win_rate * 100).toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                </div>

                {result.timestamp && (
                  <div className={`mt-3 pt-3 border-t ${isLight ? 'border-gray-200/50' : 'border-slate-600/50'}`}>
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs`}>
                      Completed at {formatDate(result.timestamp)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!result && !error && !loading && (
              <div className={`${isLight ? 'bg-white/50 border-gray-200/50' : 'bg-slate-800/50 border-slate-700/50'} backdrop-blur-sm rounded-lg border p-8 text-center shadow-lg`}>
                <Brain className={`w-12 h-12 ${isLight ? 'text-gray-400' : 'text-gray-500'} mx-auto mb-3`} />
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Configure training parameters and click "Train Model" to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default TrainModelPage;