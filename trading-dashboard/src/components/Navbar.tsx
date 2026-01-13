import { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Sun, Moon, Sparkles, Menu } from 'lucide-react';
import { POPULAR_STOCKS, POPULAR_CRYPTO, POPULAR_COMMODITIES } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UnifiedServerStatus from './UnifiedServerStatus';
import NotificationCenter from './NotificationCenter';


interface NavbarProps {
  onSearch: (query: string) => void;
  activeTab: 'stocks' | 'crypto' | 'commodities';
  onTabChange: (tab: 'stocks' | 'crypto' | 'commodities') => void;
  onMenuClick?: () => void;
}

const Navbar = ({ onSearch, activeTab, onTabChange, onMenuClick }: NavbarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSymbols, setFilteredSymbols] = useState<string[]>([]);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { theme, setTheme } = useTheme();
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Get appropriate symbol list based on active tab
  const getSymbolList = () => {
    if (activeTab === 'stocks') return POPULAR_STOCKS;
    if (activeTab === 'crypto') return POPULAR_CRYPTO;
    if (activeTab === 'commodities') return POPULAR_COMMODITIES;
    return POPULAR_STOCKS;
  };

  const handleSearchChange = (value: string) => {
    try {
      setSearchQuery(value);
      if (value.length > 0) {
        const symbols = getSymbolList();
        const filtered = symbols.filter((symbol) =>
          symbol.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 10);
        setFilteredSymbols(filtered);
        setShowSuggestions(true);
      } else {
        setFilteredSymbols([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error in search change:', error);
      setFilteredSymbols([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    try {
      setSearchQuery(symbol);
      setShowSuggestions(false);
      if (onSearch && typeof onSearch === 'function') {
        onSearch(symbol);
      }
    } catch (error) {
      console.error('Error selecting stock:', error);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (searchQuery && onSearch && typeof onSearch === 'function') {
        onSearch(searchQuery);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error submitting search:', error);
      setShowSuggestions(false);
    }
  };

  // Close theme menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };

    if (showThemeMenu) {
      // Use setTimeout to avoid immediate closure
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 10);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showThemeMenu]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  // Handle theme change
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'space') => {
    try {
      console.log('Changing theme to:', newTheme);
      if (setTheme && typeof setTheme === 'function') {
        setTheme(newTheme);
      }
      setShowThemeMenu(false);
    } catch (error) {
      console.error('Error changing theme:', error);
      setShowThemeMenu(false);
    }
  };

  const isLight = theme === 'light';
  const isSpace = theme === 'space';

  return (
    <>
      <div className="sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 h-15">
        <div className={`h-full ${
          isLight 
            ? 'bg-white/80 border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
            : isSpace
              ? 'bg-slate-900/80 border-purple-500/20 shadow-purple-500/10'
              : 'bg-gradient-to-r from-black via-gray-900 to-black border-yellow-500/30 shadow-xl shadow-yellow-500/10'
        }`}>
          <div className="px-4 h-full">
            <div className="flex items-center justify-between gap-4 h-full">
              {/* Mobile Menu Button */}
              {onMenuClick && (
                <button
                  onClick={onMenuClick}
                  className={`lg:hidden p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 h-10 w-10 flex items-center justify-center ${
                    isLight
                      ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      : isSpace
                        ? 'text-purple-300 hover:bg-purple-500/20 hover:text-white'
                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              
              {/* Smart Search Container */}
              <div ref={searchContainerRef} className="flex-1 max-w-2xl relative">
                <form onSubmit={handleSubmit} className="group">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                      isLight ? 'text-gray-400 group-focus-within:text-blue-500' : 
                      isSpace ? 'text-purple-400 group-focus-within:text-purple-300' : 
                      'text-gray-400 group-focus-within:text-blue-500'
                    }`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => searchQuery && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Search stocks, crypto, commodities..."
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 h-10 ${
                        isLight
                          ? 'bg-gray-50/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-300 focus:ring-blue-100'
                          : isSpace
                            ? 'bg-slate-800/60 border-purple-500/30 text-white placeholder-purple-300/70 focus:bg-slate-800/80 focus:border-purple-400 focus:ring-purple-500/20'
                            : 'bg-slate-700/60 border-slate-600 text-white placeholder-gray-400 focus:bg-slate-700/80 focus:border-slate-500 focus:ring-blue-500/20'
                      }`}
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                  
                  {/* Smart Search Suggestions */}
                  {showSuggestions && filteredSymbols.length > 0 && (
                    <div 
                      className={`absolute left-0 w-full mt-1 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-[9999] backdrop-blur-xl border ${
                        isLight
                          ? 'bg-white/95 border-gray-200'
                          : isSpace
                            ? 'bg-slate-900/95 border-purple-500/30'
                            : 'bg-slate-800/95 border-slate-600'
                      }`}
                      style={{ top: 'calc(100% + 6px)', maxHeight: '200px' }}
                    >
                      {filteredSymbols.map((symbol, index) => (
                        <button
                          key={symbol}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectStock(symbol);
                          }}
                          className={`w-full px-4 py-3 text-left transition-all duration-150 hover:scale-[1.02] ${
                            index === 0 ? 'rounded-t-xl' : ''
                          } ${
                            index === filteredSymbols.length - 1 ? 'rounded-b-xl' : ''
                          } ${
                            isLight
                              ? 'text-gray-900 hover:bg-blue-50 hover:text-blue-700'
                              : isSpace
                                ? 'text-white hover:bg-purple-500/20 hover:text-purple-200'
                                : 'text-white hover:bg-slate-700 hover:text-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{symbol}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isLight ? 'bg-gray-100 text-gray-600' :
                              isSpace ? 'bg-purple-500/20 text-purple-300' :
                              'bg-slate-600 text-gray-300'
                            }`}>
                              {activeTab}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Server Status Indicator - Hidden on mobile */}
                <div className="hidden md:block">
                  <UnifiedServerStatus variant="simple" />
                </div>
                
                {/* Smart Tab Switcher */}
                <div className={`flex rounded-lg p-1 backdrop-blur-sm border h-10 ${
                  isLight 
                    ? 'bg-gray-100/80 border-yellow-500/50' 
                    : isSpace 
                      ? 'bg-slate-800/60 border-purple-500/30' 
                      : 'bg-gray-900/80 border-yellow-500/30'
                }`}>
                  {(['stocks', 'crypto', 'commodities'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        onTabChange(tab);
                      }}
                      className={`px-3 py-1.5 rounded-md font-semibold transition-all duration-200 hover:scale-105 active:scale-95 h-8 flex items-center ${
                        activeTab === tab
                          ? isLight
                            ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                            : isSpace
                              ? 'bg-purple-500/30 text-purple-200 shadow-lg border border-purple-400/50'
                              : 'bg-gray-900/60 text-yellow-300 shadow-lg border border-yellow-500/30'
                          : isLight
                            ? 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                            : isSpace
                              ? 'text-purple-300/70 hover:text-purple-200 hover:bg-purple-500/10'
                              : 'text-yellow-300/70 hover:text-yellow-200 hover:bg-gray-800/50'
                      }`}
                      style={{ fontSize: '13px' }}
                    >
                      <span className="hidden sm:inline">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                      <span className="sm:hidden">{tab.charAt(0).toUpperCase()}</span>
                    </button>
                  ))}
                </div>

                {/* Smart Theme Switcher */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowThemeMenu(!showThemeMenu);
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 h-10 w-10 flex items-center justify-center ${
                      isLight
                        ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        : isSpace
                          ? 'text-purple-300 hover:bg-purple-500/20 hover:text-white'
                          : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    title="Theme Switcher"
                  >
                    {theme === 'light' && <Sun className="w-5 h-5" />}
                    {theme === 'dark' && <Moon className="w-5 h-5" />}
                    {theme === 'space' && <Sparkles className="w-5 h-5" />}
                  </button>

                  {/* Theme Menu - Anchored to button */}
                  {showThemeMenu && (
                    <div 
                      ref={themeMenuRef}
                      className={`absolute top-full right-0 mt-2 w-56 rounded-xl shadow-2xl z-[60] backdrop-blur-xl border ${
                        isLight
                          ? 'bg-white/95 border-gray-200'
                          : isSpace
                            ? 'bg-slate-900/95 border-purple-500/30'
                            : 'bg-slate-800/95 border-slate-600'
                      }`}
                    >
                      {[
                        { key: 'light', icon: Sun, label: 'Light Theme', color: 'blue' },
                        { key: 'dark', icon: Moon, label: 'Dark Theme', color: 'slate' },
                        { key: 'space', icon: Sparkles, label: 'Space Theme', color: 'purple' }
                      ].map(({ key, icon: Icon, label, color }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleThemeChange(key as any)}
                          className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] ${
                            theme === key
                              ? `bg-${color}-500/20 text-${color}-600 font-semibold border-l-4 border-${color}-500`
                              : isLight
                                ? 'text-gray-700 hover:bg-gray-50'
                                : 'text-gray-300 hover:bg-slate-700/50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            theme === key ? `bg-${color}-100` : isLight ? 'bg-gray-100' : 'bg-slate-700'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span>{label}</span>
                          {theme === key && (
                            <span className={`ml-auto text-xs font-bold bg-${color}-500/20 px-2 py-1 rounded-full`}>
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Profile */}
                <button 
                  onClick={() => navigate('/profile')}
                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 h-10 w-10 flex items-center justify-center ${
                    isLight
                      ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      : isSpace
                        ? 'text-purple-300 hover:bg-purple-500/20 hover:text-white'
                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={`Profile - ${user?.username || 'Guest'}`}
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;