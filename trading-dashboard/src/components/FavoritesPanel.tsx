import { Star, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../utils/useFavorites';

interface FavoritesPanelProps {
  onSymbolSelect: (symbol: string) => void;
}

const FavoritesPanel = ({ onSymbolSelect }: FavoritesPanelProps) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { favorites, recents } = useFavorites();

  if (favorites.length === 0 && recents.length === 0) {
    return null;
  }

  return (
    <div className={`${isLight 
      ? 'bg-white md:bg-gradient-to-br md:from-yellow-50 md:to-orange-50 border border-gray-200' 
      : 'bg-slate-800/80 md:bg-gradient-to-br md:from-yellow-500/20 md:to-orange-500/10 border border-slate-700/50'
    } rounded-lg p-4 md:p-6 shadow-sm backdrop-blur-sm`}>
      {favorites.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={`p-2 ${isLight ? 'bg-yellow-100' : 'bg-slate-700/50 md:bg-white/5'} rounded`}>
              <Star className={`w-4 h-4 md:w-5 md:h-5 ${isLight ? 'text-yellow-600' : 'text-yellow-400'}`} />
            </div>
            <h3 className={`text-sm md:text-base font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Favorite Symbols
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              isLight ? 'bg-yellow-200 text-yellow-800' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {favorites.length}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {favorites.map(symbol => (
              <button
                key={symbol}
                onClick={() => onSymbolSelect(symbol)}
                className={`px-4 py-3 ${isLight 
                  ? 'bg-gradient-to-br from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 text-yellow-800 border border-yellow-200 hover:border-yellow-300' 
                  : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-yellow-300 border border-yellow-500/30 hover:border-yellow-400/50'
                } rounded-lg text-sm font-semibold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-sm`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>{symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {recents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className={`p-2 ${isLight ? 'bg-blue-100' : 'bg-slate-700/50 md:bg-white/5'} rounded`}>
              <Clock className={`w-4 h-4 md:w-5 md:h-5 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
            </div>
            <h3 className={`text-sm md:text-base font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Recent Searches
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              isLight ? 'bg-blue-200 text-blue-800' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {recents.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recents.map(symbol => (
              <button
                key={symbol}
                onClick={() => onSymbolSelect(symbol)}
                className={`px-3 py-2 ${isLight 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 hover:border-blue-300' 
                  : 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-blue-300 border border-blue-500/30 hover:border-blue-400/50'
                } rounded-lg text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-sm`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPanel;