import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatUSDToINR } from '../../utils/currencyConverter';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface PriceTickerProps {
  symbols?: string[];
  autoScroll?: boolean;
  updateInterval?: number;
  className?: string;
}

export const PriceTicker = ({ 
  symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'],
  autoScroll = true,
  updateInterval = 5000,
  className = ''
}: PriceTickerProps) => {
  const { theme } = useTheme();
  const [tickerData, setTickerData] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isLight = theme === 'light';

  // Simulate real-time price updates
  useEffect(() => {
    const generateMockData = (): TickerItem[] => {
      return symbols.map(symbol => {
        const basePrice = Math.random() * 200 + 50; // $50-$250
        const change = (Math.random() - 0.5) * 10; // -$5 to +$5
        const changePercent = (change / basePrice) * 100;
        
        return {
          symbol,
          price: basePrice,
          change,
          changePercent,
        };
      });
    };

    // Initial load
    setTickerData(generateMockData());
    setIsLoading(false);

    // Update prices periodically
    const interval = setInterval(() => {
      setTickerData(prev => prev.map(item => {
        const priceChange = (Math.random() - 0.5) * 2; // Small random changes
        const newPrice = Math.max(item.price + priceChange, 1);
        const change = newPrice - item.price;
        const changePercent = (change / item.price) * 100;
        
        return {
          ...item,
          price: newPrice,
          change: item.change + change,
          changePercent: item.changePercent + changePercent,
        };
      }));
    }, updateInterval);

    return () => clearInterval(interval);
  }, [symbols, updateInterval]);

  if (isLoading) {
    return (
      <div className={`h-12 ${isLight ? 'bg-gray-100' : 'bg-slate-800'} animate-pulse rounded-lg ${className}`} />
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg border ${
      isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'
    } ${className}`}>
      <div className={`flex items-center h-12 ${autoScroll ? 'animate-scroll' : ''}`}>
        {/* Duplicate items for seamless scrolling */}
        {[...tickerData, ...tickerData].map((item, index) => {
          const isPositive = item.change >= 0;
          return (
            <div
              key={`${item.symbol}-${index}`}
              className="flex items-center gap-3 px-4 py-2 flex-shrink-0 border-r border-gray-200 dark:border-slate-700 last:border-r-0"
            >
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>
                  {item.symbol}
                </span>
                <span className={`font-bold text-sm ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>
                  {formatUSDToINR(item.price)}
                </span>
              </div>
              
              <div className={`flex items-center gap-1 text-xs font-semibold ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Gradient overlays for smooth edges */}
      {autoScroll && (
        <>
          <div className={`absolute left-0 top-0 w-8 h-full bg-gradient-to-r ${
            isLight ? 'from-white to-transparent' : 'from-slate-800 to-transparent'
          } pointer-events-none`} />
          <div className={`absolute right-0 top-0 w-8 h-full bg-gradient-to-l ${
            isLight ? 'from-white to-transparent' : 'from-slate-800 to-transparent'
          } pointer-events-none`} />
        </>
      )}
    </div>
  );
};

// Add CSS animation for scrolling
const tickerStyles = `
  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  
  .animate-scroll {
    animation: scroll 30s linear infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = tickerStyles;
  document.head.appendChild(styleSheet);
}