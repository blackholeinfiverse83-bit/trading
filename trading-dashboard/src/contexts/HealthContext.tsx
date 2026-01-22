import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { stockAPI } from '../services/api';

interface HealthStatus {
  healthy: boolean;
  status: string;
  timestamp: Date;
  message?: string;
}

interface HealthContextType {
  health: HealthStatus;
  isPolling: boolean;
  lastHealthCheck: Date | null;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [health, setHealth] = useState<HealthStatus>({
    healthy: true,
    status: 'unknown',
    timestamp: new Date(),
  });
  const [isPolling, setIsPolling] = useState(false);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      setIsPolling(true);
      const result = await stockAPI.health();
      
      setHealth({
        healthy: result.status === 'ok' || result.healthy === true,
        status: result.status || 'unknown',
        timestamp: new Date(),
        message: result.message,
      });
      setLastHealthCheck(new Date());
    } catch (error: any) {
      // If health check fails, mark as unhealthy
      setHealth({
        healthy: false,
        status: 'error',
        timestamp: new Date(),
        message: error.message || 'Health check failed',
      });
      setLastHealthCheck(new Date());
    } finally {
      setIsPolling(false);
    }
  }, []);

  // Poll health status every 30 seconds
  useEffect(() => {
    // Initial check
    checkHealth();

    // Set up polling interval - 30 seconds
    const interval = setInterval(() => {
      checkHealth();
    }, 30000); // 30 seconds as specified in requirements

    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <HealthContext.Provider value={{ health, isPolling, lastHealthCheck }}>
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = (): HealthContextType => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within HealthProvider');
  }
  return context;
};
