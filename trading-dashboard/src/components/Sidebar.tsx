import { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase, 
  History, 
  Brain, 
  Star,
  Beaker,
  LineChart,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'market', label: 'Market', icon: TrendingUp },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'history', label: 'History', icon: History },
    { id: 'predictions', label: 'Predictions', icon: Brain },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
    { id: 'test', label: 'Test', icon: Beaker },
    { id: 'chart', label: 'Chart', icon: LineChart },
  ];

  return (
    <div 
      className={`bg-slate-900/95 backdrop-blur-sm border-r border-slate-800/50 h-screen sticky top-0 flex flex-col transition-all duration-300 z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-2xl text-cyan-400">TradeX Pro</h1>
          )}
          {isCollapsed && (
            <h1 className="text-2xl text-cyan-400 mx-auto">TX</h1>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-slate-800/80 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800/50">
        <div className={`flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 ${
          isCollapsed ? 'justify-center' : ''
        }`}>
          <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white">M</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">mayurgedam...</p>
              <p className="text-slate-400 text-xs">authenticated</p>
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto text-slate-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}