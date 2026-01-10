import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SystemUnavailableProps {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

const SystemUnavailable: React.FC<SystemUnavailableProps> = ({ 
  message, 
  onRetry, 
  isRetrying = false 
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`max-w-md w-full text-center p-8 rounded-lg border ${
        isLight 
          ? 'bg-white border-gray-200' 
          : 'bg-slate-800 border-slate-700'
      }`}>
        <AlertTriangle className={`w-16 h-16 mx-auto mb-4 ${
          isLight ? 'text-orange-500' : 'text-orange-400'
        }`} />
        
        <h1 className={`text-xl font-semibold mb-2 ${
          isLight ? 'text-gray-900' : 'text-white'
        }`}>
          Trading Services Unavailable
        </h1>
        
        <p className={`text-sm mb-6 ${
          isLight ? 'text-gray-600' : 'text-gray-400'
        }`}>
          {message}
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors mx-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Checking...' : 'Retry'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SystemUnavailable;