import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { websocketService, PriceUpdate, PortfolioUpdate, NotificationUpdate } from '../services/websocket';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  isConnected: boolean;
  subscribeToPrices: (symbols: string[]) => void;
  unsubscribeFromPrices: (symbols: string[]) => void;
  onPriceUpdate: (callback: (update: PriceUpdate) => void) => () => void;
  onPortfolioUpdate: (callback: (update: PortfolioUpdate) => void) => () => void;
  onNotification: (callback: (update: NotificationUpdate) => void) => () => void;
  connectionStatus: {
    connected: boolean;
    reconnectAttempts: number;
    subscribedSymbols: string[];
  };
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    reconnectAttempts: 0,
    subscribedSymbols: [] as string[],
  });
  const { token } = useAuth();

  useEffect(() => {
    // Only attempt connection if backend is likely available
    // Check if we should try WebSocket (optional - can be enabled via config)
    const shouldConnect = true; // Can be controlled via config flag in future

    if (!shouldConnect) {
      return;
    }

    // Connect when component mounts (will fail silently if backend doesn't support it)
    const connect = () => {
      try {
        const authToken = token || localStorage.getItem('token');
        websocketService.connect(authToken || undefined);
      } catch (error) {
        // Silently fail - WebSocket is optional until backend supports it
      }
    };

    // Subscribe to connection status
    const unsubscribeStatus = websocketService.onConnectionStatus((connected) => {
      setIsConnected(connected);
      setConnectionStatus(websocketService.getConnectionStatus());
    });

    // Delay initial connection slightly to avoid blocking initial render
    const connectTimer = setTimeout(() => {
      connect();
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearTimeout(connectTimer);
      unsubscribeStatus();
      websocketService.disconnect();
    };
  }, [token]);

  const subscribeToPrices = useCallback((symbols: string[]) => {
    websocketService.subscribeToPrices(symbols);
    setConnectionStatus(websocketService.getConnectionStatus());
  }, []);

  const unsubscribeFromPrices = useCallback((symbols: string[]) => {
    websocketService.unsubscribeFromPrices(symbols);
    setConnectionStatus(websocketService.getConnectionStatus());
  }, []);

  const onPriceUpdate = useCallback((callback: (update: PriceUpdate) => void) => {
    return websocketService.onPriceUpdate(callback);
  }, []);

  const onPortfolioUpdate = useCallback((callback: (update: PortfolioUpdate) => void) => {
    return websocketService.onPortfolioUpdate(callback);
  }, []);

  const onNotification = useCallback((callback: (update: NotificationUpdate) => void) => {
    return websocketService.onNotification(callback);
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        subscribeToPrices,
        unsubscribeFromPrices,
        onPriceUpdate,
        onPortfolioUpdate,
        onNotification,
        connectionStatus,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

