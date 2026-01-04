/**
 * WebSocket Service for Real-time Updates
 * Handles real-time price updates, portfolio changes, and notifications
 */

import { io, Socket } from 'socket.io-client';
import { config } from '../config';

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export interface PortfolioUpdate {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  timestamp: number;
}

export interface NotificationUpdate {
  id: string;
  type: 'price_alert' | 'prediction' | 'order' | 'system';
  message: string;
  data?: any;
  timestamp: number;
}

type PriceUpdateCallback = (update: PriceUpdate) => void;
type PortfolioUpdateCallback = (update: PortfolioUpdate) => void;
type NotificationUpdateCallback = (update: NotificationUpdate) => void;
type ConnectionStatusCallback = (connected: boolean) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  private priceUpdateCallbacks: Set<PriceUpdateCallback> = new Set();
  private portfolioUpdateCallbacks: Set<PortfolioUpdateCallback> = new Set();
  private notificationCallbacks: Set<NotificationUpdateCallback> = new Set();
  private connectionStatusCallbacks: Set<ConnectionStatusCallback> = new Set();
  private subscribedSymbols: Set<string> = new Set();

  connect(token?: string): void {
    if (this.socket?.connected) {
      return;
    }

    try {
      const socketUrl = config.API_BASE_URL;

      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts,
        auth: token ? { token } : undefined,
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleConnectionError();
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      this.connected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.notifyConnectionStatus(true);

      if (this.subscribedSymbols.size > 0) {
        this.subscribeToPrices(Array.from(this.subscribedSymbols));
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      this.connected = false;
      this.notifyConnectionStatus(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      this.handleConnectionError();
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[WebSocket] Reconnection attempt ${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[WebSocket] Reconnection failed');
      this.notifyConnectionStatus(false);
    });

    this.socket.on('price_update', (update: PriceUpdate) => {
      this.priceUpdateCallbacks.forEach(callback => {
        try {
          callback(update);
        } catch (error) {
          console.error('Error in price update callback:', error);
        }
      });
    });

    this.socket.on('portfolio_update', (update: PortfolioUpdate) => {
      this.portfolioUpdateCallbacks.forEach(callback => {
        try {
          callback(update);
        } catch (error) {
          console.error('Error in portfolio update callback:', error);
        }
      });
    });

    this.socket.on('notification', (update: NotificationUpdate) => {
      this.notificationCallbacks.forEach(callback => {
        try {
          callback(update);
        } catch (error) {
          console.error('Error in notification callback:', error);
        }
      });
    });
  }

  private handleConnectionError(): void {
    this.connected = false;
    this.notifyConnectionStatus(false);

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        if (!this.connected && this.socket) {
          this.reconnectAttempts++;
          this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
          this.socket.connect();
        }
      }, this.reconnectDelay);
    }
  }

  subscribeToPrices(symbols: string[]): void {
    if (!this.socket || !this.connected) {
      symbols.forEach(symbol => this.subscribedSymbols.add(symbol));
      return;
    }

    try {
      symbols.forEach(symbol => {
        if (!this.subscribedSymbols.has(symbol)) {
          this.subscribedSymbols.add(symbol);
          this.socket?.emit('subscribe_prices', { symbols: [symbol] });
        }
      });
    } catch (error) {
      console.error('Error subscribing to prices:', error);
    }
  }

  unsubscribeFromPrices(symbols: string[]): void {
    if (!this.socket || !this.connected) {
      symbols.forEach(symbol => this.subscribedSymbols.delete(symbol));
      return;
    }

    try {
      symbols.forEach(symbol => {
        if (this.subscribedSymbols.has(symbol)) {
          this.subscribedSymbols.delete(symbol);
          this.socket?.emit('unsubscribe_prices', { symbols: [symbol] });
        }
      });
    } catch (error) {
      console.error('Error unsubscribing from prices:', error);
    }
  }

  onPriceUpdate(callback: PriceUpdateCallback): () => void {
    this.priceUpdateCallbacks.add(callback);
    return () => this.priceUpdateCallbacks.delete(callback);
  }

  onPortfolioUpdate(callback: PortfolioUpdateCallback): () => void {
    this.portfolioUpdateCallbacks.add(callback);
    return () => this.portfolioUpdateCallbacks.delete(callback);
  }

  onNotification(callback: NotificationUpdateCallback): () => void {
    this.notificationCallbacks.add(callback);
    return () => this.notificationCallbacks.delete(callback);
  }

  onConnectionStatus(callback: ConnectionStatusCallback): () => void {
    this.connectionStatusCallbacks.add(callback);
    return () => this.connectionStatusCallbacks.delete(callback);
  }

  private notifyConnectionStatus(connected: boolean): void {
    this.connectionStatusCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection status callback:', error);
      }
    });
  }

  emit(event: string, data?: any): void {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`[WebSocket] Cannot emit ${event}: not connected`);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.subscribedSymbols.clear();
      this.notifyConnectionStatus(false);
    }
  }

  isConnected(): boolean {
    return this.connected && (this.socket?.connected ?? false);
  }

  getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    subscribedSymbols: string[];
  } {
    return {
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
      subscribedSymbols: Array.from(this.subscribedSymbols),
    };
  }
}

export const websocketService = new WebSocketService();

