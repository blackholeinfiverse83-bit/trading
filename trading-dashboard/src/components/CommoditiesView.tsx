import { useState } from 'react';
import { Search, Package, Loader2, BarChart3 } from 'lucide-react';
import { POPULAR_COMMODITIES } from '../services/api';

interface CommoditiesViewProps {
  onSearch: (symbol: string) => void;
  onAnalyze?: (symbol: string) => void;
  predictions: any[];
  loading: boolean;
  error: string | null;
  horizon?: 'intraday' | 'short' | 'long';
  onHorizonChange?: (horizon: 'intraday' | 'short' | 'long') => void;
}

const CommoditiesView = ({ onSearch, onAnalyze, predictions, loading, error, horizon = 'intraday', onHorizonChange }: CommoditiesViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-400" />
          Commodities Market
        </h2>
        <p className="text-gray-400 text-xs">Monitor and analyze commodities futures with AI predictions</p>
      </div>

      <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-sm rounded-lg p-3 border border-orange-500/30">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && onSearch(searchQuery)}
              placeholder="Enter commodity symbol (e.g., GC=F for Gold, CL=F for Oil)"
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-700/50 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          {onHorizonChange && (
            <select
              value={horizon}
              onChange={(e) => onHorizonChange(e.target.value as any)}
              className="px-2.5 py-1.5 text-sm bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
            >
              <option value="intraday">📈 Intraday</option>
              <option value="short">📅 Short (5 days)</option>
              <option value="long">📆 Long (30 days)</option>
            </select>
          )}
          <button
            onClick={() => onSearch(searchQuery)}
            disabled={loading || !searchQuery}
            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search</span>
          </button>
          {searchQuery && onAnalyze && (
            <button
              onClick={() => onAnalyze(searchQuery)}
              disabled={loading}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
              <span>Deep Analyze</span>
            </button>
          )}
        </div>

        <div>
          <p className="text-gray-300 mb-3 font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-400" />
            Popular Commodities:
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_COMMODITIES.slice(0, 15).map((symbol) => (
              <button
                key={symbol}
                onClick={() => onSearch(symbol)}
                className="px-3 py-1.5 bg-slate-700/50 text-gray-300 hover:bg-orange-500 hover:text-white rounded-lg text-sm font-medium transition-all hover:scale-105"
                title={commodityNames[symbol] || symbol}
              >
                {commodityNames[symbol] || symbol}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border-2 border-red-500/50 rounded-xl p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="bg-slate-800/80 rounded-xl p-8 border border-slate-700/50 text-center">
          <Loader2 className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Fetching commodities predictions from backend...</p>
          <p className="text-gray-500 text-sm mt-2">This may take 60-90 seconds for first-time predictions</p>
        </div>
      )}

      {!loading && predictions.length === 0 && !error && (
        <div className="bg-slate-800/80 rounded-xl p-8 border border-slate-700/50 text-center">
          <Package className="w-16 h-16 text-orange-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">Ready to Search Commodities</h3>
          <p className="text-gray-400 mb-4">Enter a commodity symbol (e.g., GC=F for Gold) above or click a popular commodity to get AI-powered predictions</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {POPULAR_COMMODITIES.slice(0, 10).map((symbol) => (
              <button
                key={symbol}
                onClick={() => onSearch(symbol)}
                className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm font-medium transition-all border border-orange-500/30"
                title={commodityNames[symbol] || symbol}
              >
                {commodityNames[symbol] || symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {predictions.length > 0 && (
        <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-400" />
            Commodities Predictions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((pred, index) => {
              const symbol = pred.symbol;
              const name = commodityNames[symbol] || symbol;
              return (
                <div key={index} className="bg-gradient-to-br from-orange-900/20 to-red-900/10 rounded-lg p-4 border border-orange-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-400" />
                      <div>
                        <span className="text-white font-bold text-lg block">{name}</span>
                        <span className="text-gray-400 text-xs">{symbol}</span>
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
                    <p className="text-gray-400 text-sm">Current: ${pred.current_price?.toFixed(2) || 'N/A'}</p>
                    <p className="text-white font-semibold">Predicted: ${pred.predicted_price?.toFixed(2) || 'N/A'}</p>
                    <p className={`text-sm font-semibold ${(pred.predicted_return || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(pred.predicted_return || 0) > 0 ? '+' : ''}{pred.predicted_return?.toFixed(2) || 0}%
                    </p>
                    <p className="text-gray-400 text-xs">Confidence: {((pred.confidence || 0) * 100).toFixed(0)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommoditiesView;

