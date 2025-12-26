import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  History, 
  Star, 
  BarChart3,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { theme } = useTheme();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/market-scan', icon: Search, label: 'Market Scan' },
    { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
    { path: '/trading-history', icon: History, label: 'Trading History' },
    { path: '/watchlist', icon: Star, label: 'Watch List' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const isLight = theme === 'light';
  const isSpace = theme === 'space';
  
  return (
    <div className={`w-64 h-screen flex flex-col relative z-20 ${
      isLight 
        ? 'bg-white border-r border-gray-200' 
        : isSpace
          ? 'bg-transparent border-r border-purple-900/20' // Transparent so background shows through
          : 'bg-slate-900 border-r border-slate-700'
    }`}>
      <div className={`p-3 border-b ${
        isLight 
          ? 'border-gray-200' 
          : isSpace 
            ? 'border-purple-900/20' 
            : 'border-slate-700'
      }`}>
        <h1 className={`text-lg font-bold ${
          isLight 
            ? 'text-gray-900' 
            : isSpace 
              ? 'text-white drop-shadow-lg' 
              : 'text-white'
        }`}>Trading Hub</h1>
        <p className={`text-xs mt-0.5 ${
          isLight 
            ? 'text-gray-600' 
            : isSpace 
              ? 'text-gray-200 drop-shadow' 
              : 'text-gray-400'
        }`}>Welcome, {user?.username || 'anonymous'}</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : isLight
                    ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    : isSpace
                      ? 'text-white/90 hover:bg-white/10 hover:text-white drop-shadow'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={`p-3 border-t ${
        isLight 
          ? 'border-gray-200' 
          : isSpace 
            ? 'border-purple-900/20' 
            : 'border-slate-700'
      }`}>
        <button
          onClick={logout}
          className={`flex items-center gap-2 px-3 py-2 w-full rounded transition-colors ${
            isLight
              ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              : isSpace
                ? 'text-white/90 hover:bg-white/10 hover:text-white drop-shadow'
                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

