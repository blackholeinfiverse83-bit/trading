import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  History, 
  Star, 
  BarChart3,
  Bell,
  Settings,
  GitCompare,
  LogOut,
  X,
  Brain,
  TrendingUp,
  Zap,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme } = useTheme();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { path: '/market-scan', icon: Search, label: 'Market Scan', badge: 'AI' },
    { path: '/portfolio', icon: Briefcase, label: 'Portfolio', badge: null },
    { path: '/trading-history', icon: History, label: 'Trading History', badge: null },
    { path: '/watchlist', icon: Star, label: 'Watch List', badge: null },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', badge: 'Pro' },
    { path: '/alerts', icon: Bell, label: 'Alerts', badge: null },
    { path: '/compare', icon: GitCompare, label: 'Compare', badge: null },
    { path: '/train-model', icon: Brain, label: 'Train Model', badge: 'ML' },
    { path: '/risk-management', icon: Shield, label: 'Risk Management', badge: null },
    { path: '/endpoint-test', icon: Zap, label: 'Endpoint Test', badge: 'Dev' },
    { path: '/settings', icon: Settings, label: 'Settings', badge: null },
  ];

  const isLight = theme === 'light';
  const isSpace = theme === 'space';
  
  const handleNavClick = () => {
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    logout();
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
    navigate('/login', { replace: true });
  };
  
  return (
    <div className={`
      fixed lg:static top-0 left-0 h-screen flex flex-col z-50
      w-64 transform transition-all duration-300 ease-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${isLight 
        ? 'bg-white/50 backdrop-blur-xl border-r border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
        : isSpace
          ? 'bg-slate-800/50 backdrop-blur-xl border-r border-slate-600/50'
          : 'bg-gradient-to-b from-black via-gray-900 to-black backdrop-blur-xl border-r border-yellow-500/30'
      }
    `}>
      {/* Header Section */}
      <div className={`p-4 border-b backdrop-blur-sm flex-shrink-0 ${
        isLight 
          ? 'border-yellow-500/40' 
          : isSpace 
            ? 'border-purple-500/20' 
            : 'border-yellow-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isSpace 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-500'
              }`}>
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className={`font-bold leading-tight ${
                  isLight 
                    ? 'text-gray-900' 
                    : 'text-white'
                }`} style={{ fontSize: '16px' }}>Blackhole</h1>
                <p className={`leading-tight ${
                  isLight 
                    ? 'text-blue-600' 
                    : isSpace
                      ? 'text-blue-300'
                      : 'text-blue-400'
                }`} style={{ fontSize: '12px' }}>Trading Dashboard</p>
              </div>
            </div>
            <div className={`px-3 py-2 rounded-lg ${
              isLight 
                ? 'bg-blue-50/30 border border-blue-200/30' 
                : isSpace
                  ? 'bg-slate-700/30 border border-slate-600/30'
                  : 'bg-slate-800/30 border border-slate-600/30'
            }`}>
              <p className={`font-medium leading-tight ${
                isLight 
                  ? 'text-blue-700' 
                  : isSpace
                    ? 'text-blue-300'
                    : 'text-blue-300'
              }`} style={{ fontSize: '12px' }}>Welcome back!</p>
              <p className={`leading-tight ${
                isLight 
                  ? 'text-blue-600' 
                  : isSpace
                    ? 'text-blue-200'
                    : 'text-blue-200'
              }`} style={{ fontSize: '12px' }}>{user?.username || 'Anonymous'}</p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className={`lg:hidden p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                isLight
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-3 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden h-11 ${
                  isActive
                    ? isSpace
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10'
                      : 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10'
                    : isLight
                      ? 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 border border-transparent hover:border-blue-200/50'
                      : isSpace
                        ? 'text-gray-300 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 hover:text-white border border-transparent hover:border-purple-500/20'
                        : 'text-gray-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 hover:text-white border border-transparent hover:border-blue-500/20'
                }`}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-r ${
                    isSpace 
                      ? 'from-transparent via-purple-400/5 to-transparent' 
                      : 'from-transparent via-blue-400/5 to-transparent'
                  } transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700`} />
                </div>
                
                <div className={`relative z-10 p-2 rounded-lg transition-colors ${
                  isActive
                    ? isSpace
                      ? 'bg-purple-500/30'
                      : 'bg-blue-500/30'
                    : isLight
                      ? 'bg-gray-100 group-hover:bg-blue-100'
                      : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 relative z-10">
                  <span className="font-medium" style={{ fontSize: '14px' }}>{item.label}</span>
                </div>
                
                {item.badge && (
                  <div className={`relative z-10 px-2 py-1 rounded-full font-bold flex items-center ${
                    item.badge === 'AI'
                      ? isSpace
                        ? 'bg-purple-500/30 text-purple-200'
                        : 'bg-blue-500/20 text-blue-600'
                      : item.badge === 'ML'
                        ? 'bg-green-500/20 text-green-600'
                        : 'bg-orange-500/20 text-orange-600'
                  }`} style={{ fontSize: '11px' }}>
                    {item.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer Section */}
      <div className={`p-4 border-t backdrop-blur-sm flex-shrink-0 ${
        isLight 
          ? 'border-yellow-500/40' 
          : isSpace 
            ? 'border-purple-500/20' 
            : 'border-yellow-500/30'
      }`}>
        <div className="space-y-2">
          <button
            onClick={handleLogout}
            className={`group flex items-center gap-2 px-3 py-2.5 w-full rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] h-11 ${
              isLight
                ? 'text-gray-700 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200'
                : isSpace
                  ? 'text-gray-300 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/30'
                  : 'text-gray-300 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/30'
            }`}
          >
            <div className={`p-2 rounded-lg transition-colors ${
              isLight
                ? 'bg-gray-100 group-hover:bg-red-100'
                : 'bg-slate-700/50 group-hover:bg-red-500/20'
            }`}>
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium" style={{ fontSize: '13px' }}>Logout</span>
          </button>
          
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            isLight 
              ? 'bg-green-50/30 border border-green-200/30' 
              : isSpace
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-green-500/10 border border-green-500/20'
          }`}>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className={`font-medium ${
              isLight 
                ? 'text-green-700' 
                : 'text-green-300'
            }`} style={{ fontSize: '12px' }}>System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

