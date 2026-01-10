import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface SmartCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export const SmartCard: React.FC<SmartCardProps> = ({
  children,
  className = '',
  hover = true,
  glow = false,
  gradient = false,
  onClick
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isSpace = theme === 'space';

  const baseClasses = `
    backdrop-blur-xl rounded-2xl border transition-all duration-300
    ${hover ? 'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${glow && isSpace ? 'hover:shadow-purple-500/20' : ''}
    ${glow && !isSpace ? 'hover:shadow-blue-500/20' : ''}
  `;

  const themeClasses = isLight 
    ? `bg-white/90 border-gray-200/50 ${hover ? 'hover:bg-white/95 hover:border-gray-300/70' : ''}`
    : isSpace
      ? `bg-slate-900/70 border-purple-500/20 ${hover ? 'hover:bg-slate-900/90 hover:border-purple-400/40' : ''}`
      : `bg-slate-800/70 border-slate-700/50 ${hover ? 'hover:bg-slate-800/90 hover:border-slate-600/70' : ''}`;

  const gradientClasses = gradient
    ? isSpace
      ? 'bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80'
      : 'bg-gradient-to-br from-slate-800/80 via-blue-900/20 to-slate-800/80'
    : '';

  return (
    <div
      className={`${baseClasses} ${themeClasses} ${gradientClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default SmartCard;