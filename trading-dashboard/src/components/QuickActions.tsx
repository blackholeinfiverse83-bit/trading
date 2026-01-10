import { useState } from 'react';
import { Plus, TrendingUp, Search, Zap, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface QuickActionsProps {
  onPredict: () => void;
  onScan: () => void;
  onSearch: () => void;
}

const QuickActions = ({ onPredict, onScan, onSearch }: QuickActionsProps) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="flex flex-col gap-3 mb-4">
          <button
            onClick={() => { onPredict(); setIsOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 backdrop-blur-sm border ${
              isLight 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300' 
                : 'bg-gradient-to-r from-slate-800/90 to-slate-700/90 border-slate-600 text-white hover:from-blue-500/20 hover:to-indigo-500/20 hover:border-blue-500/50'
            }`}
          >
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm font-semibold">Quick Predict</span>
          </button>
          <button
            onClick={() => { onScan(); setIsOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 backdrop-blur-sm border ${
              isLight 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100 hover:border-green-300' 
                : 'bg-gradient-to-r from-slate-800/90 to-slate-700/90 border-slate-600 text-white hover:from-green-500/20 hover:to-emerald-500/20 hover:border-green-500/50'
            }`}
          >
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Search className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-sm font-semibold">Market Scan</span>
          </button>
          <button
            onClick={() => { onSearch(); setIsOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 backdrop-blur-sm border ${
              isLight 
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100 hover:border-purple-300' 
                : 'bg-gradient-to-r from-slate-800/90 to-slate-700/90 border-slate-600 text-white hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-500/50'
            }`}
          >
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-sm font-semibold">Quick Search</span>
          </button>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center backdrop-blur-sm border-2 ${
          isOpen 
            ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-red-400 shadow-red-500/25' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-blue-400 shadow-blue-500/25'
        } text-white`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default QuickActions;