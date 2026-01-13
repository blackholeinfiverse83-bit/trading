import React, { useState, useEffect } from 'react';
import { stockAPI } from '../services/api';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Server, 
  WifiOff, 
  RefreshCw, 
  Power, 
  Terminal,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';

interface UnifiedServerStatusProps {
  className?: string;
  showDetails?: boolean;
  variant?: 'simple' | 'detailed' | 'restart'; // 'simple' for indicator, 'detailed' for health, 'restart' for restart button
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'error' | 'checking';
  timestamp?: string;
  system?: {
    cpu_usage_percent?: number;
    memory_percent?: number;
    memory_available_gb?: number;
  };
  mcp_adapter?: {
    status?: string;
    error?: string;
  };
  models?: {
    available?: boolean;
    total_trained?: number;
  };
}

const UnifiedServerStatus: React.FC<UnifiedServerStatusProps> = ({ 
  className = '', 
  showDetails = false, 
  variant = 'simple'
}) => {
  const { connectionState, forceCheck } = useConnection();
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRestarting, setIsRestarting] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Check server status function
  const checkServerStatus = async () => {
    try {
      // Check connection first
      const connectionCheck = await stockAPI.checkConnection();
      
      if (!connectionCheck.connected) {
        setError(connectionCheck.error || 'Backend server is not reachable');
        setHealthStatus(null);
        setLastCheck(new Date());
        return;
      }

      // If connected, get health status
      try {
        const health = await stockAPI.health();
        setHealthStatus(health);
        setError(null);
      } catch (healthError: any) {
        // Connection works but health check failed - still mark as connected
        setError(healthError.message || 'Health check failed');
        setHealthStatus({
          status: 'error',
          timestamp: new Date().toISOString(),
        });
      }
      
      setLastCheck(new Date());
    } catch (err: any) {
      setError(err.message || 'Unable to connect to backend server');
      setHealthStatus(null);
      setLastCheck(new Date());
    }
  };

  // Refresh connection
  const handleRefresh = async () => {
    await forceCheck();
    if (connectionState.isConnected) {
      await checkServerStatus();
    }
  };

  // Handle restart click
  const handleRestartClick = () => {
    setShowRestartModal(true);
  };

  // Handle restart confirmation
  const handleRestartConfirm = async () => {
    setIsRestarting(true);
    setShowRestartModal(false);
    
    // Copy the restart command to clipboard
    const restartCommand = `cd "d:\\blackhole projects\\blackhole-infevers trade\\Multi-Asset Trading Dashboard\\backend" && python api_server.py`;
    
    try {
      await navigator.clipboard.writeText(restartCommand);
      setCopySuccess(true);
      
      alert(
        '✅ Command copied to clipboard!\n\n' +
        'Instructions:\n' +
        '1. Open a new PowerShell/Terminal window\n' +
        '2. Paste the command (Ctrl+V)\n' +
        '3. Press Enter to start the backend\n' +
        '4. Wait 3-5 seconds for server to start\n' +
        '5. Come back and click "Check Connection"'
      );
    } catch (err) {
      alert(
        '⚠️ Unable to copy automatically.\n\n' +
        'Run this command manually in a terminal:\n\n' +
        restartCommand
      );
    }

    // Wait a moment then check connection again
    setTimeout(async () => {
      await forceCheck();
      if (connectionState.isConnected) {
        await checkServerStatus();
      }
      setIsRestarting(false);
      setCopySuccess(false);
    }, 3000);
  };

  // Get status icon
  const getStatusIcon = () => {
    if (connectionState.isChecking) {
      return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
    }
    
    if (connectionState.isConnected) {
      return healthStatus?.status === 'healthy' ? (
        <CheckCircle2 className="w-4 h-4 text-green-400" />
      ) : (
        <AlertCircle className="w-4 h-4 text-yellow-400" />
      );
    }
    
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  // Get status text
  const getStatusText = () => {
    if (connectionState.isChecking) return 'Checking...';
    if (connectionState.isConnected) {
      return healthStatus?.status === 'healthy' ? 'Live' : 'Degraded';
    }
    return 'Offline';
  };

  // Get status color
  const getStatusColor = () => {
    if (connectionState.isChecking) {
      return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
    }
    
    if (connectionState.isConnected) {
      return healthStatus?.status === 'healthy' 
        ? 'bg-green-500/20 border-green-500/50 text-green-400' 
        : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
    }
    
    return 'bg-red-500/20 border-red-500/50 text-red-400';
  };

  // Determine if server is online for detailed view
  const isOnline = connectionState.isConnected && healthStatus?.status !== 'error';

  // Effects
  useEffect(() => {
    if (connectionState.isConnected) {
      checkServerStatus();
    }
  }, [connectionState.isConnected]);

  // Auto-refresh every 2 minutes when connected
  useEffect(() => {
    if (connectionState.isConnected) {
      const interval = setInterval(() => {
        checkServerStatus();
      }, 120000);

      return () => clearInterval(interval);
    }
  }, [connectionState.isConnected]);

  // Simple indicator variant
  if (variant === 'simple') {
    return (
      <div className={`${className}`}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer hover:opacity-80 ${getStatusColor()}`}
          onClick={handleRefresh}
          title={error || 'Click to refresh status'}
        >
          {getStatusIcon()}
          <span className="hidden sm:inline">{getStatusText()}</span>
          {connectionState.isChecking && (
            <span className="hidden sm:inline ml-1">...</span>
          )}
        </div>
      </div>
    );
  }

  // Detailed health variant
  if (variant === 'detailed') {
    return (
      <div className={`${className}`}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer hover:opacity-80 ${getStatusColor()}`}
          onClick={handleRefresh}
          title={error || 'Click to refresh status'}
        >
          {getStatusIcon()}
          <span className="hidden sm:inline">{getStatusText()}</span>
          {connectionState.isChecking && (
            <span className="hidden sm:inline ml-1">...</span>
          )}
        </div>

        {showDetails && connectionState.isConnected && healthStatus && (
          <div className="mt-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={`font-semibold ${
                healthStatus.status === 'healthy' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {healthStatus.status?.toUpperCase()}
              </span>
            </div>
            
            {healthStatus.system && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">CPU:</span>
                  <span className="text-gray-300">{healthStatus.system.cpu_usage_percent?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Memory:</span>
                  <span className="text-gray-300">
                    {healthStatus.system.memory_percent?.toFixed(1)}% 
                    {healthStatus.system.memory_available_gb && ` (${healthStatus.system.memory_available_gb.toFixed(1)} GB free)`}
                  </span>
                </div>
              </>
            )}
            
            {healthStatus.mcp_adapter && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">MCP Adapter:</span>
                <span className={`${
                  healthStatus.mcp_adapter.status === 'ready' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {healthStatus.mcp_adapter.status || 'unknown'}
                </span>
              </div>
            )}
            
            {healthStatus.models && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Models:</span>
                <span className="text-gray-300">
                  {healthStatus.models.total_trained || 0} trained
                </span>
              </div>
            )}
            
            {lastCheck && (
              <div className="pt-2 mt-2 border-t border-slate-700 text-gray-500">
                Last check: {lastCheck.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

        {showDetails && error && !connectionState.isConnected && (
          <div className="mt-2 p-3 bg-red-900/20 rounded-lg border border-red-500/30 text-xs">
            <div className="flex items-start gap-2">
              <WifiOff className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 font-semibold mb-1">Connection Failed</p>
                <p className="text-red-300">{error}</p>
                <p className="text-red-400/70 mt-2 text-xs">
                  Make sure the backend server is running:<br />
                  <code className="bg-red-900/30 px-1 rounded">cd backend && python api_server.py</code>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Restart button variant
  if (variant === 'restart') {
    return (
      <>
        {/* Status Button/Badge with Green Dot */}
        <button
          onClick={isOnline ? handleRefresh : handleRestartClick}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
            transition-all duration-200 cursor-pointer shadow-sm
            ${isOnline
              ? 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800'
            }
            ${className}
          `}
          disabled={isRestarting || connectionState.isChecking}
          title={isOnline ? 'Click to verify connection' : 'Click to restart backend'}
        >
          {/* Green/Red Dot Indicator */}
          <div className="flex items-center">
            <div
              className={`
                w-2 h-2 rounded-full
                ${isOnline
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-red-500 animate-pulse'
                }
              `}
            />
          </div>

          {isOnline ? (
            <>
              <span className="font-semibold">Backend Online (Live)</span>
              {connectionState.isChecking && <RefreshCw size={14} className="animate-spin ml-1" />}
            </>
          ) : (
            <>
              <span className="font-semibold">Backend Offline</span>
              {connectionState.isChecking && <RefreshCw size={14} className="animate-spin ml-1" />}
            </>
          )}
        </button>

        {/* Restart Modal */}
        {showRestartModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              {/* Header */}
              <div className="bg-red-50 dark:bg-red-900/30 px-6 py-4 border-b border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <h2 className="text-lg font-bold text-red-900 dark:text-red-100">
                    Backend Server Offline
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
                  The backend server is offline. Click below to copy the restart command.
                </p>

                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mb-4 border border-gray-300 dark:border-gray-700 overflow-x-auto">
                  <code className="text-xs text-gray-800 dark:text-gray-200 font-mono block whitespace-pre-wrap break-words">
                    cd "d:\blackhole projects\blackhole-infevers trade\Multi-Asset Trading Dashboard\backend" && python api_server.py
                  </code>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <span className="font-semibold">📋 Steps:</span><br/>
                    1️⃣ Click "Copy & Restart" button below<br/>
                    2️⃣ Open PowerShell or Terminal<br/>
                    3️⃣ Paste (Ctrl+V) and press Enter<br/>
                    4️⃣ Wait for "Application startup complete"<br/>
                    5️⃣ Come back and button will turn green!
                  </p>
                </div>

                {copySuccess && (
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-900 dark:text-green-200">
                      ✅ Command copied to clipboard!
                    </p>
                  </div>
                )}
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
                  disabled={isRestarting}
                >
                  {isRestarting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Restarting...
                    </>
                  ) : (
                    <>
                      <Terminal size={16} />
                      Copy & Restart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default to simple variant
  return (
    <div className={`${className}`}>
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer hover:opacity-80 ${getStatusColor()}`}
        onClick={handleRefresh}
        title={error || 'Click to refresh status'}
      >
        {getStatusIcon()}
        <span className="hidden sm:inline">{getStatusText()}</span>
        {connectionState.isChecking && (
          <span className="hidden sm:inline ml-1">...</span>
        )}
      </div>
    </div>
  );
};

export default UnifiedServerStatus;