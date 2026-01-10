import { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { POPULAR_STOCKS } from '../services/api';

interface QuickSearchProps {
  onSymbolSelect: (symbol: string) => void;
  placeholder?: string;
}

const QuickSearch = ({ onSymbolSelect, placeholder = "Search symbols..." }: QuickSearchProps) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = POPULAR_STOCKS
        .filter(stock => 
          stock.toLowerCase().includes(query.toLowerCase()) ||
          stock.replace('.NS', '').toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSymbol(suggestions[selectedIndex]);
        } else if (query.trim()) {
          selectSymbol(query.trim().toUpperCase());
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectSymbol = (symbol: string) => {
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSymbolSelect(symbol);
    inputRef.current?.blur();
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2 ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500' : 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'} border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
        />
      </div>

      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className={`absolute top-full left-0 right-0 mt-1 ${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border rounded-lg shadow-lg max-h-64 overflow-y-auto z-50`}
        >
          {suggestions.map((symbol, index) => (
            <button
              key={symbol}
              onClick={() => selectSymbol(symbol)}
              className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${
                index === selectedIndex
                  ? isLight ? 'bg-blue-50 text-blue-700' : 'bg-blue-900/50 text-blue-300'
                  : isLight ? 'text-gray-900 hover:bg-gray-50' : 'text-white hover:bg-slate-700'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickSearch;