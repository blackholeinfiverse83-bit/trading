import { useState } from 'react';
import { stockAPI, POPULAR_STOCKS } from '../services/api';
import { Search, TrendingUp, TrendingDown, Loader2, Filter, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface MarketScannerProps {
  onClose?: () => void;
}

const MarketScanner = ({ onClose }: MarketScannerProps) => {
  const [symbols, setSymbols] = useState<string[]>(['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'META']);
  const [horizon, setHorizon] = useState<'intraday' | 'daily' | 'weekly'>('intraday');
  const [minConfidence, setMinConfidence] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleScan = async () => {
    if (symbols.length === 0) {
      setError('Please add at least one symbol to scan');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await stockAPI.scanAll(symbols, horizon, minConfidence);
      setResults(response);
    } catch (err: any) {
      setError(err.message || 'Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSymbol = (symbol: string) => {
    if (!symbols.includes(symbol.toUpperCase())) {
      setSymbols([...symbols, symbol.toUpperCase()]);
    }
  };

  const removeSymbol = (symbol: string) => {
    setSymbols(symbols.filter(s => s !== symbol));
  };

  return (
    <div className={`${isLight ? 'bg-white border border-gray-200' : 'bg-slate-800 border border-slate-700'} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'} flex items-center gap-2`}>
          <Search className="w-5 h-5" />
          Market Scanner
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className={`${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Symbols */}
        <div>
          <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
            Symbols to Scan ({symbols.length})
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {symbols.map((symbol) => (
              <span
                key={symbol}
                className={`inline-flex items-center gap-1 px-2 py-1 ${isLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-400'} rounded text-sm`}
              >
                {symbol}
                <button
                  onClick={() => removeSymbol(symbol)}
                  className={`${isLight ? 'text-blue-600 hover:text-blue-900' : 'text-blue-300 hover:text-white'}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_STOCKS.slice(0, 10).map((symbol) => (
              !symbols.includes(symbol) && (
                <button
                  key={symbol}
                  onClick={() => addSymbol(symbol)}
                  className={`px-2 py-1 ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900' : 'bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white'} rounded text-sm transition-colors`}
                >
                  + {symbol}
                </button>
              )
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
              Horizon
            </label>
            <select
              value={horizon}
              onChange={(e) => setHorizon(e.target.value as any)}
              className={`w-full px-3 py-2 ${isLight ? 'bg-white border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500' : 'bg-slate-700 border border-slate-600 text-white focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2`}
            >
              <option value="intraday">Intraday</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
              Min Confidence ({(minConfidence * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Scan Button */}
        <button
          onClick={handleScan}
          disabled={loading || symbols.length === 0}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning {symbols.length} symbols...
            </>
          ) : (
            <>
              <Filter className="w-4 h-4" />
              Scan Market
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className={`${isLight ? 'bg-red-50 border border-red-300' : 'bg-red-900/50 border border-red-500'} rounded-lg p-3`}>
            <p className={`${isLight ? 'text-red-700' : 'text-red-300'} text-sm`}>{error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-3">
            <h3 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Scan Results ({results.predictions?.length || 0} found)
            </h3>
            
            {results.predictions && results.predictions.length > 0 ? (
              <div className="space-y-2">
                {results.predictions.map((pred: any, index: number) => {
                  const isPositive = (pred.predicted_return || 0) > 0;
                  const confidence = (pred.confidence || 0) * 100;
                  
                  return (
                    <div
                      key={index}
                      className={`${isLight ? 'bg-gray-50 border border-gray-200' : 'bg-slate-700/50 border border-slate-600/50'} rounded-lg p-3`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${
                            pred.action === 'LONG' ? 'bg-green-500/20' :
                            pred.action === 'SHORT' ? 'bg-red-500/20' :
                            'bg-yellow-500/20'
                          }`}>
                            {pred.action === 'LONG' ? (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : pred.action === 'SHORT' ? (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            ) : (
                              <Filter className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                          <div>
                            <p className={`${isLight ? 'text-gray-900' : 'text-white'} font-semibold`}>{pred.symbol}</p>
                            <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-sm`}>
                              ${(pred.predicted_price || pred.current_price || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{(pred.predicted_return || 0).toFixed(2)}%
                          </p>
                          <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-sm`}>
                            {confidence.toFixed(0)}% confidence
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Filter className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'}`}>No symbols met the confidence threshold</p>
                <p className={`${isLight ? 'text-gray-500' : 'text-gray-500'} text-sm`}>Try lowering the minimum confidence</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketScanner;