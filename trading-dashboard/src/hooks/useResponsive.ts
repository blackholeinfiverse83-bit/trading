import { useState, useEffect } from 'react';

interface ViewportSize {
  width: number;
  height: number;
}

interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  isXLarge: boolean;
}

export const useResponsive = () => {
  const [viewport, setViewport] = useState<ViewportSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const [breakpoints, setBreakpoints] = useState<BreakpointState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLarge: false,
    isXLarge: false,
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({ width, height });
      
      setBreakpoints({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1280,
        isLarge: width >= 1280 && width < 1536,
        isXLarge: width >= 1536,
      });
    };

    // Initial update
    updateViewport();

    // Add event listener with throttling
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewport, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    viewport,
    ...breakpoints,
    isSmallScreen: breakpoints.isMobile || breakpoints.isTablet,
    isLargeScreen: breakpoints.isLarge || breakpoints.isXLarge,
  };
};

export default useResponsive;