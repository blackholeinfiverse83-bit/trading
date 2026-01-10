import { useState, useEffect, useCallback } from 'react';

interface WindowState {
  isFullscreen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  canGoFullscreen: boolean;
}

export const useWindowManager = () => {
  const [windowState, setWindowState] = useState<WindowState>({
    isFullscreen: false,
    isMinimized: false,
    isMaximized: false,
    canGoFullscreen: typeof document !== 'undefined' && !!document.documentElement.requestFullscreen,
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  // Check if document is in fullscreen
  const checkFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return false;
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;

    try {
      if (checkFullscreen()) {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      } else {
        // Enter fullscreen
        const element = document.documentElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) {
          await (element as any).mozRequestFullScreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        }
      }
    } catch (error) {
      console.warn('Fullscreen toggle failed:', error);
    }
  }, [checkFullscreen]);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Toggle compact mode
  const toggleCompactMode = useCallback(() => {
    setCompactMode(prev => {
      const newMode = !prev;
      // Save to localStorage
      localStorage.setItem('compactMode', JSON.stringify(newMode));
      return newMode;
    });
  }, []);

  // Maximize/restore window (for PWA or Electron apps)
  const toggleMaximize = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.toggleMaximize();
    }
  }, []);

  // Minimize window (for PWA or Electron apps)
  const minimizeWindow = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.minimize();
    }
  }, []);

  useEffect(() => {
    // Load compact mode from localStorage
    try {
      const saved = localStorage.getItem('compactMode');
      if (saved) {
        setCompactMode(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load compact mode setting:', error);
    }

    // Load sidebar state from localStorage
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved) {
        setSidebarCollapsed(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load sidebar state:', error);
    }

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setWindowState(prev => ({
        ...prev,
        isFullscreen: checkFullscreen(),
      }));
    };

    // Listen for window state changes (Electron)
    const handleWindowStateChange = (event: any) => {
      if (event.detail) {
        setWindowState(prev => ({
          ...prev,
          isMaximized: event.detail.isMaximized,
          isMinimized: event.detail.isMinimized,
        }));
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
      
      // Custom event for Electron window state
      window.addEventListener('window-state-changed', handleWindowStateChange);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        
        window.removeEventListener('window-state-changed', handleWindowStateChange);
      }
    };
  }, [checkFullscreen]);

  // Save sidebar state when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return {
    windowState,
    sidebarCollapsed,
    compactMode,
    toggleFullscreen,
    toggleSidebar,
    toggleCompactMode,
    toggleMaximize,
    minimizeWindow,
    setSidebarCollapsed,
    setCompactMode,
  };
};

export default useWindowManager;