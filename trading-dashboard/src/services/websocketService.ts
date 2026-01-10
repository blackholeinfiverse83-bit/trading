import { io, Socket } from 'socket.io-client';

interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

interface WebSocketCallbacks {
  onPriceUpdate?: (data: PriceUpdate) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(url: string = 'ws://127.0.0.1:8000', callbacks: WebSocketCallbacks = {}) {
    this.callbacks = callbacks;

    try {
      this.socket = io(url, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.callbacks.onError?.('Failed to establish WebSocket connection');
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.callbacks.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.callbacks.onDisconnect?.();
    });

    this.socket.on('price_update', (data: PriceUpdate) => {
      this.callbacks.onPriceUpdate?.(data);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.callbacks.onError?.('Failed to connect after multiple attempts');
      }
    });
  }

  subscribe(symbols: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe', { symbols });
    }
  }

  unsubscribe(symbols: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe', { symbols });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const webSocketService = new WebSocketService();
export type { PriceUpdate, WebSocketCallbacks };