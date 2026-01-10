import { useState, useEffect } from 'react';
import { stockAPI } from '../services/api';

export interface SystemState {
  isOperational: boolean;
  canPredict: boolean;
  canTrade: boolean;
  errorMessage?: string;
  isChecking: boolean;
}

export const useSystemState = () => {
  const [systemState, setSystemState] = useState<SystemState>({
    isOperational: false,
    canPredict: false,
    canTrade: false,
    isChecking: true,
  });

  useEffect(() => {
    let mounted = true;

    const checkSystemHealth = async () => {
      try {
        // Test core functionality
        const [connectionResult, healthResult] = await Promise.allSettled([
          stockAPI.checkConnection(),
          stockAPI.health(),
        ]);

        if (!mounted) return;

        const isConnected = connectionResult.status === 'fulfilled' && connectionResult.value.connected;
        const isHealthy = healthResult.status === 'fulfilled';

        if (!isConnected) {
          setSystemState({
            isOperational: false,
            canPredict: false,
            canTrade: false,
            errorMessage: 'Unable to connect to trading services',
            isChecking: false,
          });
          return;
        }

        if (!isHealthy) {
          setSystemState({
            isOperational: false,
            canPredict: false,
            canTrade: false,
            errorMessage: 'Trading services are currently unavailable',
            isChecking: false,
          });
          return;
        }

        // Test prediction capability
        try {
          await stockAPI.predict(['AAPL'], 'intraday');
          setSystemState({
            isOperational: true,
            canPredict: true,
            canTrade: true,
            isChecking: false,
          });
        } catch {
          setSystemState({
            isOperational: true,
            canPredict: false,
            canTrade: false,
            errorMessage: 'Prediction engine is initializing. Please wait...',
            isChecking: false,
          });
        }
      } catch {
        if (!mounted) return;
        setSystemState({
          isOperational: false,
          canPredict: false,
          canTrade: false,
          errorMessage: 'System unavailable',
          isChecking: false,
        });
      }
    };

    checkSystemHealth();

    return () => {
      mounted = false;
    };
  }, []);

  return systemState;
};