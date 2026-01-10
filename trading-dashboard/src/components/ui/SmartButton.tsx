import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { LucideIcon } from 'lucide-react';

interface SmartButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SmartButton: React.FC<SmartButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isSpace = theme === 'space';

  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-xl
    transition-all duration-200 hover:scale-105 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: isSpace
      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 focus:ring-purple-500 shadow-lg shadow-purple-500/25'
      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 focus:ring-blue-500 shadow-lg shadow-blue-500/25',
    secondary: isLight
      ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300'
      : 'bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500 border border-slate-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 focus:ring-green-500 shadow-lg shadow-green-500/25',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 focus:ring-red-500 shadow-lg shadow-red-500/25',
    ghost: isLight
      ? 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
      : 'text-gray-300 hover:bg-slate-700 focus:ring-slate-500'
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSize}`} />
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon className={iconSize} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className={iconSize} />}
    </button>
  );
};

export default SmartButton;