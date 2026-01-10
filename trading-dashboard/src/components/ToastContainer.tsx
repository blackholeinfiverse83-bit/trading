import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, TrendingUp, ExternalLink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'prediction';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  data?: any;
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContainer = ({ toasts, removeToast }: ToastContainerProps) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.duration !== 0) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration || 5000);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, removeToast]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'prediction': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${isLight 
            ? 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-xl' 
            : 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl'
          } rounded-xl p-4 transform transition-all duration-300 animate-slideIn backdrop-blur-sm`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              toast.type === 'success' ? 'bg-green-100 dark:bg-green-500/20' :
              toast.type === 'error' ? 'bg-red-100 dark:bg-red-500/20' :
              toast.type === 'prediction' ? 'bg-blue-100 dark:bg-blue-500/20' :
              'bg-blue-100 dark:bg-blue-500/20'
            }`}>
              {getIcon(toast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {toast.title}
              </p>
              <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1`}>
                {toast.message}
              </p>
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-1 transition-all transform hover:scale-105"
                >
                  {toast.action.label}
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`p-1.5 rounded-lg transition-all transform hover:scale-110 ${
                isLight ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-gray-500 hover:text-gray-300 hover:bg-slate-700'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;