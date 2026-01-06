import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, Power } from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';

interface BackendStatusProps {
  className?: string;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ className = '' }) => {
  const { connectionState, forceCheck } = useConnection();
  const [isRestarting, setIsRestarting] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);

  const handleRestartClick = () => {
    setShowRestartModal(true);
  };

  const handleRestartConfirm = async () => {
    setIsRestarting(true);
    setShowRestartModal(false);
    
    // Copy the restart command to clipboard
    const restartCommand = `cd "d:\\blackhole projects\\blackhole-infevers trade\\Multi-Asset Trading Dashboard\\backend" && python api_server.py`;
    navigator.clipboard.writeText(restartCommand).then(() => {
      alert(
        'Command copied to clipboard!\n\n' +
        'Please open a new terminal/PowerShell and paste this command:\n\n' +
        restartCommand +
        '\n\nAfter the backend starts, click "Check Connection" button to verify.'
      );
    }).catch(() => {
      alert(
        'To restart the backend, run this command in a terminal:\n\n' +
        restartCommand
      );
    });

    // Wait a moment then check connection again
    setTimeout(async () => {
      await forceCheck();
      setIsRestarting(false);
    }, 2000);
  };

  const handleCheckConnection = async () => {
    await forceCheck();
  };

  const isOnline = connectionState.isConnected;

  return (
    <>
      {/* Status Button/Badge */}
      <button
        onClick={isOnline ? handleCheckConnection : handleRestartClick}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
          transition-all duration-200 cursor-pointer
          ${isOnline
            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
          }
          ${className}
        `}
        disabled={isRestarting || connectionState.isChecking}
        title={isOnline ? 'Click to check connection' : 'Click to restart backend'}
      >
        {isOnline ? (
          <>
            <CheckCircle2 size={16} />
            <span>Backend Online (Live)</span>
          </>
        ) : (
          <>
            <AlertCircle size={16} className="animate-pulse" />
            <span>Backend Offline (Restart)</span>
          </>
        )}
        
        {(isRestarting || connectionState.isChecking) && (
          <RefreshCw size={14} className="animate-spin" />
        )}
      </button>

      {/* Restart Modal */}
      {showRestartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="bg-red-50 dark:bg-red-900/30 px-6 py-4 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <Power size={24} className="text-red-600 dark:text-red-400" />
                <h2 className="text-lg font-bold text-red-900 dark:text-red-100">
                  Backend Server Offline
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The backend server is currently offline. To restart it, click the button below to copy the restart command.
              </p>

              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mb-4 overflow-x-auto">
                <code className="text-xs text-gray-800 dark:text-gray-200 font-mono block whitespace-pre-wrap break-words">
                  cd "d:\blackhole projects\blackhole-infevers trade\Multi-Asset Trading Dashboard\backend" && python api_server.py
                </code>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                ✓ Command will be copied to your clipboard<br/>
                ✓ Open a new terminal/PowerShell<br/>
                ✓ Paste and run the command<br/>
                ✓ Backend will start on port 8000
              </p>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowRestartModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestartConfirm}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 dark:hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Restart Backend
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BackendStatus;
