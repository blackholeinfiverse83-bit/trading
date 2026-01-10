import { TrendingUp, TrendingDown, Minus, Target, Clock, Star, Bell, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../utils/useFavorites';

interface PredictionCardProps {
  symbol: string;
  action: 'LONG' | 'SHORT' | 'HOLD';
  confidence: number;
  predictedReturn: number;
  currentPrice: number;
  predictedPrice: number;
  timestamp?: string;
  onClick?: () => void;
  onAddToPortfolio?: (symbol: string) => void;
  onSetAlert?: (symbol: string) => void;
}

const PredictionCard = ({
  symbol,
  action,
  confidence,
  predictedReturn,
  currentPrice,
  predictedPrice,
  timestamp,
  onClick,
  onAddToPortfolio,
  onSetAlert
}: PredictionCardProps) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LONG': return 'text-green-500';
      case 'SHORT': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LONG': return <TrendingUp className="w-4 h-4" />;
      case 'SHORT': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div
      onClick={onClick}
      className={`${isLight ? 'bg-white border-gray-200 hover:border-blue-300' : 'bg-slate-800 border-slate-700 hover:border-blue-500'} border rounded-lg p-4 transition-all cursor-pointer hover:shadow-lg transform hover:scale-[1.02]`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className={`font-bold text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {symbol}
          </h3>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(action)} bg-opacity-20`}>
            {getActionIcon(action)}
            {action === 'LONG' ? 'BUY' : action === 'SHORT' ? 'SELL' : 'HOLD'}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              isFavorite(symbol) ? removeFavorite(symbol) : addFavorite(symbol);
            }}
            className={`p-1 rounded transition-colors ${
              isFavorite(symbol) 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : isLight ? 'text-gray-400 hover:text-yellow-500' : 'text-gray-500 hover:text-yellow-400'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite(symbol) ? 'fill-current' : ''}`} />
          </button>
          
          <div className={`w-2 h-2 rounded-full ${getConfidenceColor(confidence)}`}></div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'} mb-1`}>Current Price</p>
          <p className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
            ${currentPrice.toFixed(2)}
          </p>
        </div>
        <div>
          <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'} mb-1`}>Target Price</p>
          <p className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
            ${predictedPrice.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Return & Confidence */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-500" />
          <span className={`text-sm font-medium ${predictedReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {predictedReturn >= 0 ? '+' : ''}{predictedReturn.toFixed(2)}%
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-full bg-gray-200 rounded-full h-2 ${isLight ? 'bg-gray-200' : 'bg-slate-700'}`}>
            <div
              className={`h-2 rounded-full ${getConfidenceColor(confidence)}`}
              style={{ width: `${confidence * 100}%` }}
            ></div>
          </div>
          <span className={`text-xs font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Timestamp */}
      {timestamp && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
          <Clock className={`w-3 h-3 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2 mt-3">
        {onAddToPortfolio && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToPortfolio(symbol);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-xs font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-sm border border-blue-400"
          >
            <div className="p-0.5 bg-white/20 rounded">
              <Plus className="w-3 h-3" />
            </div>
            Add to Portfolio
          </button>
        )}
        {onSetAlert && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetAlert(symbol);
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-sm border ${
              isLight 
                ? 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 border-gray-300' 
                : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-gray-300 border-slate-500'
            }`}
          >
            <div className={`p-0.5 rounded ${
              isLight ? 'bg-gray-300' : 'bg-slate-500'
            }`}>
              <Bell className="w-3 h-3" />
            </div>
            Set Alert
          </button>
        )}
      </div>
    </div>
  );
};

export default PredictionCard;