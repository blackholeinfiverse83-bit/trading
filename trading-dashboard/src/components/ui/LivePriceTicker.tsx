import { useEffect, useState } from 'react';
import { webSocketService, PriceUpdate } from '../../services/websocketService';
import { TrendingUp, TrendingDown, Wifi, WifiOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface LivePriceTickerProps {
  symbols: string[];
  className?: string;
}

export const LivePriceTicker = ({ symbols, className = '' }: LivePriceTickerProps) => {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({});
  const [isConnected, setIsConnected] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    if (symbols.length === 0) return;

    const handlePriceUpdate = (data: PriceUpdate) => {
      setPrices(prev => ({
        ...prev,
        [data.symbol]: data
      }));
    };

    const handleConnect = () => {
      setIsConnected(true);
      webSocketService.subscribe(symbols);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (error: string) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    webSocketService.connect('ws://127.0.0.1:8000', {
      onPriceUpdate: handlePriceUpdate,
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      onError: handleError,
    });

    return () => {
      webSocketService.unsubscribe(symbols);
      webSocketService.disconnect();
    };
  }, [symbols]);

  if (symbols.length === 0) return null;

  return (
    <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
          Live Prices
        </h3>
        <div className="flex items-center gap-1">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {symbols.map(symbol => {
          const priceData = prices[symbol];
          const isPositive = priceData ? priceData.changePercent > 0 : false;
          
          return (
            <div
              key={symbol}
              className={`flex items-center justify-between p-2 rounded ${
                isLight ? 'bg-gray-50' : 'bg-slate-700/50'
              } transition-colors`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-medium text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {symbol}
                </span>
                {priceData && (
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                {priceData ? (
                  <>
                    <div className={`font-bold text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      ${priceData.price.toFixed(2)}
                    </div>
                    <div className={`text-xs font-medium ${
                      isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isPositive ? '+' : ''}{priceData.changePercent.toFixed(2)}%
                    </div>
                  </>
                ) : (
                  <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    Waiting...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};