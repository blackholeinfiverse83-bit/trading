import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Display4KInfo {
  is4K: boolean;
  isUltra4K: boolean;
  pixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  displayType: 'mobile' | 'tablet' | 'desktop' | '4k' | 'ultra4k';
}

interface Crystal4KEnhancements {
  glassIntensity: number;
  shadowDepth: number;
  animationSpeed: number;
  borderRadius: number;
  fontSize: number;
}

export const use4KEnhancements = () => {
  const { theme, is4KDisplay } = useTheme();
  
  const [displayInfo, setDisplayInfo] = useState<Display4KInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        is4K: false,
        isUltra4K: false,
        pixelRatio: 1,
        screenWidth: 1920,
        screenHeight: 1080,
        displayType: 'desktop'
      };
    }
    
    const width = window.screen.width;
    const height = window.screen.height;
    const ratio = window.devicePixelRatio || 1;
    
    return {
      is4K: width >= 2560 || ratio >= 2,
      isUltra4K: width >= 3840,
      pixelRatio: ratio,
      screenWidth: width,
      screenHeight: height,
      displayType: width >= 3840 ? 'ultra4k' : 
                  width >= 2560 ? '4k' : 
                  width >= 1024 ? 'desktop' : 
                  width >= 640 ? 'tablet' : 'mobile'
    };
  });

  const [enhancements, setEnhancements] = useState<Crystal4KEnhancements>(() => ({
    glassIntensity: displayInfo.is4K ? 1.5 : 1,
    shadowDepth: displayInfo.is4K ? 1.3 : 1,
    animationSpeed: displayInfo.is4K ? 0.8 : 1,
    borderRadius: displayInfo.is4K ? 1.2 : 1,
    fontSize: displayInfo.is4K ? 1.1 : 1
  }));

  useEffect(() => {
    const updateDisplayInfo = () => {
      const width = window.screen.width;
      const height = window.screen.height;
      const ratio = window.devicePixelRatio || 1;
      
      const newDisplayInfo: Display4KInfo = {
        is4K: width >= 2560 || ratio >= 2,
        isUltra4K: width >= 3840,
        pixelRatio: ratio,
        screenWidth: width,
        screenHeight: height,
        displayType: width >= 3840 ? 'ultra4k' : 
                    width >= 2560 ? '4k' : 
                    width >= 1024 ? 'desktop' : 
                    width >= 640 ? 'tablet' : 'mobile'
      };
      
      setDisplayInfo(newDisplayInfo);
      
      setEnhancements({
        glassIntensity: newDisplayInfo.isUltra4K ? 2 : newDisplayInfo.is4K ? 1.5 : 1,
        shadowDepth: newDisplayInfo.isUltra4K ? 1.5 : newDisplayInfo.is4K ? 1.3 : 1,
        animationSpeed: newDisplayInfo.isUltra4K ? 0.7 : newDisplayInfo.is4K ? 0.8 : 1,
        borderRadius: newDisplayInfo.isUltra4K ? 1.4 : newDisplayInfo.is4K ? 1.2 : 1,
        fontSize: newDisplayInfo.isUltra4K ? 1.2 : newDisplayInfo.is4K ? 1.1 : 1
      });
    };

    updateDisplayInfo();
    window.addEventListener('resize', updateDisplayInfo);
    return () => window.removeEventListener('resize', updateDisplayInfo);
  }, []);

  const getCrystalClasses = useCallback((baseClasses: string = '') => {
    const crystalClasses = [];
    
    if (displayInfo.is4K) {
      crystalClasses.push('crystal-enhanced');
    }
    
    if (displayInfo.isUltra4K) {
      crystalClasses.push('ultra-4k');
    }
    
    switch (theme) {
      case 'space':
        crystalClasses.push('space-glow');
        break;
      case 'dark':
        crystalClasses.push('dark-crystal');
        break;
      case 'light':
        crystalClasses.push('light-crystal');
        break;
    }
    
    return `${baseClasses} ${crystalClasses.join(' ')}`.trim();
  }, [theme, displayInfo]);

  const getCrystalStyles = useCallback((customStyles: React.CSSProperties = {}) => {
    const crystalStyles: React.CSSProperties = {
      ...customStyles,
    };
    
    if (displayInfo.is4K) {
      crystalStyles.backdropFilter = `blur(${20 * enhancements.glassIntensity}px) saturate(${1.2 * enhancements.glassIntensity})`;
      crystalStyles.borderRadius = `${12 * enhancements.borderRadius}px`;
      crystalStyles.fontSize = `${enhancements.fontSize}em`;
    }
    
    if (displayInfo.isUltra4K) {
      crystalStyles.boxShadow = `0 ${8 * enhancements.shadowDepth}px ${32 * enhancements.shadowDepth}px rgba(0, 0, 0, 0.1)`;
    }
    
    return crystalStyles;
  }, [displayInfo, enhancements]);

  const getAnimationDuration = useCallback((baseDuration: number = 300) => {
    return Math.round(baseDuration * enhancements.animationSpeed);
  }, [enhancements.animationSpeed]);

  const getResponsiveSpacing = useCallback((baseSpacing: number = 16) => {
    if (displayInfo.isUltra4K) return baseSpacing * 1.5;
    if (displayInfo.is4K) return baseSpacing * 1.25;
    return baseSpacing;
  }, [displayInfo]);

  const getResponsiveFontSize = useCallback((baseFontSize: string = '1rem') => {
    const sizeValue = parseFloat(baseFontSize);
    const unit = baseFontSize.replace(sizeValue.toString(), '');
    
    if (displayInfo.isUltra4K) return `${sizeValue * 1.2}${unit}`;
    if (displayInfo.is4K) return `${sizeValue * 1.1}${unit}`;
    return baseFontSize;
  }, [displayInfo]);

  return {
    displayInfo,
    enhancements,
    getCrystalClasses,
    getCrystalStyles,
    getAnimationDuration,
    getResponsiveSpacing,
    getResponsiveFontSize,
    shouldUseGPUAcceleration: displayInfo.is4K,
    shouldReduceAnimations: displayInfo.pixelRatio < 1.5 && !displayInfo.is4K,
    isHighDPI: displayInfo.pixelRatio >= 2,
    isMobile: displayInfo.displayType === 'mobile',
    isTablet: displayInfo.displayType === 'tablet',
    isDesktop: displayInfo.displayType === 'desktop',
    is4K: displayInfo.is4K,
    isUltra4K: displayInfo.isUltra4K,
    
    getThemeAwareClass: (lightClass: string, darkClass: string, spaceClass: string) => {
      switch (theme) {
        case 'light': return lightClass;
        case 'dark': return darkClass;
        case 'space': return spaceClass;
        default: return darkClass;
      }
    }
  };
};

export const useCrystalButton = (variant: 'primary' | 'secondary' | 'accent' = 'primary') => {
  const { getCrystalClasses, getCrystalStyles, getAnimationDuration, displayInfo } = use4KEnhancements();
  const { theme } = useTheme();
  
  const getButtonClasses = useCallback(() => {
    const baseClasses = 'crystal-button interactive-4k focus-4k';
    const variantClasses = {
      primary: 'bg-blue-500 hover:bg-blue-600',
      secondary: 'bg-gray-500 hover:bg-gray-600',
      accent: theme === 'space' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-blue-500 hover:bg-blue-600'
    };
    
    return getCrystalClasses(`${baseClasses} ${variantClasses[variant]}`);
  }, [getCrystalClasses, theme, variant]);
  
  const getButtonStyles = useCallback((customStyles: React.CSSProperties = {}) => {
    const baseStyles: React.CSSProperties = {
      transition: `all ${getAnimationDuration()}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      transform: 'translateZ(0)',
      ...customStyles
    };
    
    return getCrystalStyles(baseStyles);
  }, [getCrystalStyles, getAnimationDuration]);
  
  return {
    buttonClasses: getButtonClasses(),
    buttonStyles: getButtonStyles(),
    isEnhanced: displayInfo.is4K
  };
};

export const useCrystalCard = (elevated: boolean = false) => {
  const { getCrystalClasses, getCrystalStyles, displayInfo } = use4KEnhancements();
  
  const getCardClasses = useCallback(() => {
    const baseClasses = 'crystal-card';
    const elevatedClasses = elevated ? 'shadow-deep hover:shadow-glow' : 'shadow-crystal';
    
    return getCrystalClasses(`${baseClasses} ${elevatedClasses}`);
  }, [getCrystalClasses, elevated]);
  
  const getCardStyles = useCallback((customStyles: React.CSSProperties = {}) => {
    return getCrystalStyles(customStyles);
  }, [getCrystalStyles]);
  
  return {
    cardClasses: getCardClasses(),
    cardStyles: getCardStyles(),
    isEnhanced: displayInfo.is4K
  };
};