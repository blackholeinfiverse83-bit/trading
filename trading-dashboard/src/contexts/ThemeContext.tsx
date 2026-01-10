import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'space';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  is4KDisplay: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    const initialTheme = (saved && ['light', 'dark', 'space'].includes(saved)) ? saved : 'dark';
    console.log('ThemeProvider: Initial theme loaded:', initialTheme);
    return initialTheme;
  });

  // Detect 4K display
  const [is4KDisplay, setIs4KDisplay] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.screen.width >= 2560 || window.devicePixelRatio >= 2;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      const is4K = window.screen.width >= 2560 || window.devicePixelRatio >= 2;
      setIs4KDisplay(is4K);
      
      // Add 4K class to document for CSS targeting
      if (is4K) {
        document.documentElement.classList.add('is-4k');
      } else {
        document.documentElement.classList.remove('is-4k');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    console.log('ThemeProvider: Theme changed to:', theme);
    localStorage.setItem('theme', theme);
    
    // Apply theme class to document root
    document.documentElement.classList.remove('light', 'dark', 'space');
    document.documentElement.classList.add(theme);
    
    // Apply theme to body with enhanced classes
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
    
    // Add crystal enhancement class for 4K displays
    if (is4KDisplay) {
      document.body.classList.add('crystal-enhanced');
    }
    
    // Set CSS custom properties for dynamic theming
    const root = document.documentElement;
    switch (theme) {
      case 'light':
        root.style.setProperty('--theme-bg', 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)');
        root.style.setProperty('--theme-text', '#0f172a');
        root.style.setProperty('--theme-accent', '#3b82f6');
        break;
      case 'dark':
        root.style.setProperty('--theme-bg', 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)');
        root.style.setProperty('--theme-text', '#f8fafc');
        root.style.setProperty('--theme-accent', '#60a5fa');
        break;
      case 'space':
        root.style.setProperty('--theme-bg', 'linear-gradient(135deg, #000000 0%, #0c0a1e 25%, #1a1b3a 50%, #0c0a1e 75%, #000000 100%)');
        root.style.setProperty('--theme-text', '#e2e8f0');
        root.style.setProperty('--theme-accent', '#a78bfa');
        break;
    }
  }, [theme, is4KDisplay]);

  const setTheme = useCallback((newTheme: Theme) => {
    console.log('ThemeProvider: setTheme called with:', newTheme, 'current theme:', theme);
    if (!['light', 'dark', 'space'].includes(newTheme)) {
      console.error('Invalid theme:', newTheme);
      return;
    }
    if (newTheme !== theme) {
      console.log('ThemeProvider: Updating theme from', theme, 'to', newTheme);
      setThemeState(newTheme);
    } else {
      console.log('ThemeProvider: Theme already set to', newTheme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, is4KDisplay }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
