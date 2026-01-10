import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Search, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  Bell, 
  User, 
  Home,
  Scan,
  History,
  Bookmark,
  Calculator,
  X
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

export const CommandPalette = () => {
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const isLight = theme === 'light';

  const commands: Command[] = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: Home,
      action: () => navigate('/dashboard'),
      keywords: ['home', 'main', 'overview']
    },
    {
      id: 'market-scan',
      label: 'Market Scanner',
      icon: Scan,
      action: () => navigate('/market-scan'),
      keywords: ['scan', 'search', 'find', 'stocks']
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      action: () => navigate('/analytics'),
      keywords: ['charts', 'data', 'analysis']
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: TrendingUp,
      action: () => navigate('/portfolio'),
      keywords: ['holdings', 'investments', 'assets']
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      icon: Bookmark,
      action: () => navigate('/watchlist'),
      keywords: ['favorites', 'saved', 'watch']
    },
    {
      id: 'history',
      label: 'Trading History',
      icon: History,
      action: () => navigate('/trading-history'),
      keywords: ['trades', 'past', 'transactions']
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      action: () => navigate('/alerts'),
      keywords: ['notifications', 'warnings']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => navigate('/settings'),
      keywords: ['preferences', 'config', 'options']
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        <Command 
          className={`rounded-xl border shadow-2xl ${
            isLight 
              ? 'bg-white border-gray-200' 
              : 'bg-slate-800 border-slate-700'
          }`}
        >
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className={`flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}
            />
            <button
              onClick={() => setCommandPaletteOpen(false)}
              className={`ml-2 p-1 rounded hover:bg-gray-100 ${
                isLight ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-400 hover:bg-slate-700'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className={`py-6 text-center text-sm ${
              isLight ? 'text-gray-500' : 'text-gray-400'
            }`}>
              No results found.
            </Command.Empty>
            <Command.Group heading="Navigation">
              {commands.map((command) => {
                const Icon = command.icon;
                return (
                  <Command.Item
                    key={command.id}
                    value={`${command.label} ${command.keywords?.join(' ') || ''}`}
                    onSelect={() => {
                      command.action();
                      setCommandPaletteOpen(false);
                    }}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
                      isLight 
                        ? 'hover:bg-gray-100 text-gray-900' 
                        : 'hover:bg-slate-700 text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{command.label}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>
          <div className={`border-t px-3 py-2 text-xs ${
            isLight ? 'text-gray-500 border-gray-200' : 'text-gray-400 border-slate-700'
          }`}>
            Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">⌘K</kbd> to toggle
          </div>
        </Command>
      </div>
    </div>
  );
};