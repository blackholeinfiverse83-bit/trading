import { Filter, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SmartFiltersProps {
  activeFilters: {
    confidence: 'all' | 'high' | 'medium';
    action: 'all' | 'LONG' | 'SHORT' | 'HOLD';
  };
  onFilterChange: (filters: any) => void;
  counts?: {
    total: number;
    high: number;
    buy: number;
    sell: number;
    hold: number;
  };
}

const SmartFilters = ({ activeFilters, onFilterChange, counts }: SmartFiltersProps) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isSpace = theme === 'space';

  const confidenceFilters = [
    { key: 'all', label: 'All Predictions', count: counts?.total, gradient: 'from-blue-500/20 to-indigo-500/10' },
    { key: 'high', label: 'High Confidence', count: counts?.high, gradient: 'from-green-500/20 to-emerald-500/10' },
  ];

  const actionFilters = [
    { key: 'all', label: 'All Actions', icon: Filter, gradient: 'from-purple-500/20 to-pink-500/10' },
    { key: 'LONG', label: 'Buy Signals', icon: TrendingUp, color: 'text-green-500', count: counts?.buy, gradient: 'from-green-500/20 to-emerald-500/10' },
    { key: 'SHORT', label: 'Sell Signals', icon: TrendingDown, color: 'text-red-500', count: counts?.sell, gradient: 'from-red-500/20 to-pink-500/10' },
    { key: 'HOLD', label: 'Hold Signals', icon: Minus, color: 'text-yellow-500', count: counts?.hold, gradient: 'from-yellow-500/20 to-orange-500/10' },
  ];

  return (
    <div className={`${isLight 
      ? 'bg-white md:bg-gradient-to-br md:from-blue-50 md:to-indigo-50 border border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
      : isSpace
        ? 'bg-slate-800/30 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20'
        : 'bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-500/30 shadow-xl shadow-yellow-500/10'
    } rounded-lg p-4 md:p-6 shadow-sm backdrop-blur-sm`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 ${isLight ? 'bg-blue-100' : 'bg-yellow-500/20 border border-yellow-500/50'} rounded`}>
          <Sparkles className={`w-4 h-4 md:w-5 md:h-5 ${isLight ? 'text-blue-600' : 'text-yellow-400'}`} />
        </div>
        <h3 className={`text-sm md:text-base font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
          Smart Filters
        </h3>
      </div>

      <div className="space-y-4">
        {/* Confidence Filters */}
        <div>
          <p className={`text-xs font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'} mb-2`}>By Confidence</p>
          <div className="flex flex-wrap gap-2">
            {confidenceFilters.map(filter => (
              <button
                key={filter.key}
                onClick={() => onFilterChange({ ...activeFilters, confidence: filter.key })}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-sm ${
                  activeFilters.confidence === filter.key
                    ? `bg-gradient-to-r ${filter.gradient} border-2 border-blue-500/50 text-blue-600 shadow-lg`
                    : isLight 
                      ? 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 hover:border-blue-300'
                      : 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-gray-300 hover:border-blue-500/50'
                }`}
              >
                <span>{filter.label}</span>
                {filter.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeFilters.confidence === filter.key
                      ? 'bg-blue-500/20 text-blue-700'
                      : isLight ? 'bg-gray-200 text-gray-600' : 'bg-slate-600 text-gray-300'
                  }`}>
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Filters */}
        <div>
          <p className={`text-xs font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'} mb-2`}>By Action Type</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {actionFilters.map(filter => {
              const Icon = filter.icon;
              const isActive = activeFilters.action === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => onFilterChange({ ...activeFilters, action: filter.key })}
                  className={`px-3 py-3 rounded-lg text-sm font-medium transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center gap-2 shadow-sm min-h-[80px] ${
                    isActive
                      ? `bg-gradient-to-br ${filter.gradient} border-2 border-blue-500/50 shadow-lg`
                      : isLight 
                        ? 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-blue-300'
                        : 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-blue-500/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${
                    isActive 
                      ? 'text-blue-600' 
                      : filter.color || (isLight ? 'text-gray-600' : 'text-gray-400')
                  }`} />
                  <div className="text-center">
                    <span className={`block text-xs ${
                      isActive 
                        ? 'text-blue-700 font-semibold' 
                        : isLight ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {filter.label.split(' ')[0]}
                    </span>
                    <span className={`block text-xs ${
                      isActive 
                        ? 'text-blue-600' 
                        : isLight ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {filter.label.split(' ')[1] || ''}
                    </span>
                    {filter.count !== undefined && (
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-700'
                          : isLight ? 'bg-gray-200 text-gray-600' : 'bg-slate-600 text-gray-300'
                      }`}>
                        {filter.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartFilters;