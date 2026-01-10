import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';

export const useGlobalShortcuts = () => {
  const navigate = useNavigate();
  const { setCommandPaletteOpen, setSidebarOpen } = useAppStore();

  // Command Palette
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault();
    setCommandPaletteOpen(true);
  }, { enableOnFormTags: true });

  // Navigation shortcuts
  useHotkeys('g d', () => navigate('/dashboard'), { scopes: 'global' });
  useHotkeys('g s', () => navigate('/market-scan'), { scopes: 'global' });
  useHotkeys('g a', () => navigate('/analytics'), { scopes: 'global' });
  useHotkeys('g p', () => navigate('/portfolio'), { scopes: 'global' });
  useHotkeys('g w', () => navigate('/watchlist'), { scopes: 'global' });
  useHotkeys('g h', () => navigate('/trading-history'), { scopes: 'global' });
  useHotkeys('g e', () => navigate('/settings'), { scopes: 'global' });

  // UI shortcuts
  useHotkeys('cmd+b, ctrl+b', () => setSidebarOpen(true));
  useHotkeys('escape', () => {
    setSidebarOpen(false);
    setCommandPaletteOpen(false);
  });

  // Focus shortcuts
  useHotkeys('/', (e) => {
    e.preventDefault();
    const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  });
};

// Shortcut display component
export const ShortcutBadge: React.FC<{ keys: string[]; className?: string }> = ({ keys, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {keys.map((key, index) => (
        <kbd 
          key={index}
          className="px-1.5 py-0.5 text-xs font-mono bg-gray-200 dark:bg-slate-700 rounded border"
        >
          {key}
        </kbd>
      ))}
    </div>
  );
};

export const shortcuts = {
  global: [
    { keys: ['⌘', 'K'], description: 'Open command palette' },
    { keys: ['G', 'D'], description: 'Go to Dashboard' },
    { keys: ['G', 'S'], description: 'Go to Market Scan' },
    { keys: ['G', 'A'], description: 'Go to Analytics' },
    { keys: ['G', 'P'], description: 'Go to Portfolio' },
    { keys: ['G', 'W'], description: 'Go to Watchlist' },
    { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
    { keys: ['/'], description: 'Focus search' },
    { keys: ['Esc'], description: 'Close modals/panels' },
  ],
} as const;