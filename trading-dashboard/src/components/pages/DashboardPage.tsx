import { useState, useEffect } from 'react';
import { LivePredictionsFeed } from '../LivePredictionsFeed';
import { ExecutionConsole } from '../ExecutionConsole';
import { InputPanel } from '../InputPanel';
import { ChatPanel } from '../ChatPanel';
import { TradingChart } from '../TradingChart';
import { NewsFeed } from '../NewsFeed';
import { EndpointControls } from '../EndpointControls';
import { apiService } from '../../services/api';
import { TrendingUp, TrendingDown, Activity, BarChart3, Wallet, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface MarketOverview {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
}

interface DashboardPageProps {
  marketType?: string;
}

export function DashboardPage({ marketType = 'stocks' }: DashboardPageProps) {
  const [marketOverview, setMarketOverview] = useState<MarketOverview[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch market overview data
  const fetchMarketOverview = async () => {
    try {
      setLoading(true);
      
      // Handle different market types
      let symbols: string[] = [];
      if (marketType === 'stocks') {
        symbols = ['AAPL', 'GOOGL', 'MSFT'];
      } else if (marketType === 'crypto') {
        // For crypto, we'll show a coming soon message
        setMarketOverview([
          { symbol: 'BTC', name: 'Bitcoin', price: 0, change: 0, changePercent: 0, volume: '0M' },
          { symbol: 'ETH', name: 'Ethereum', price: 0, change: 0, changePercent: 0, volume: '0M' },
          { symbol: 'SOL', name: 'Solana', price: 0, change: 0, changePercent: 0, volume: '0M' },
        ]);
        setLoading(false);
        return;
      } else if (marketType === 'commodities') {
        // For commodities, we'll show a coming soon message
        setMarketOverview([
          { symbol: 'GC', name: 'Gold', price: 0, change: 0, changePercent: 0, volume: '0M' },
          { symbol: 'CL', name: 'Crude Oil', price: 0, change: 0, changePercent: 0, volume: '0M' },
          { symbol: 'SI', name: 'Silver', price: 0, change: 0, changePercent: 0, volume: '0M' },
        ]);
        setLoading(false);
        return;
      } else {
        symbols = ['AAPL', 'GOOGL', 'MSFT'];
      }
      
      // Only fetch real data for stocks since that's what we have in backend
      if (marketType === 'stocks') {
        const scanResults = await apiService.scanAll(symbols, 'short');
        
        // Check if scanResults is an array, if not try to extract the array
        let resultsArray: any[] = [];
        if (Array.isArray(scanResults)) {
          resultsArray = scanResults;
        } else if (scanResults && typeof scanResults === 'object' && 'results' in scanResults && Array.isArray(scanResults.results)) {
          resultsArray = scanResults.results;
        } else if (scanResults && typeof scanResults === 'object' && 'shortlist' in scanResults && Array.isArray(scanResults.shortlist)) {
          resultsArray = scanResults.shortlist;
        } else {
          console.warn('Unexpected scanResults format:', scanResults);
          resultsArray = [];
        }
        
        // Transform API response to match component interface
        const transformedData: MarketOverview[] = resultsArray.map((item: any) => ({
          symbol: item.symbol,
          name: item.name || `${item.symbol} Inc.`,
          price: item.current_price || item.price || 0,
          change: item.predicted_return || item.change || 0,
          changePercent: item.predicted_return || item.change_percent || 0,
          volume: item.volume || item.vol || '0M',
        }));
        
        setMarketOverview(transformedData);
        setLastUpdated(new Date());
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch market overview:', error);
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout - backend is taking too long to respond');
      } else if (error.message) {
        toast.error(`Failed to fetch market overview: ${error.message}`);
      } else {
        toast.error('Failed to fetch market overview data');
      }
      setLoading(false);
    }
  };

  // Fetch market data on component mount and when marketType changes
  useEffect(() => {
    fetchMarketOverview();
    
    // Refresh interval: 1 second for stocks, 120 seconds for others
    const refreshInterval = marketType === 'stocks' ? 1000 : 120000;
    const interval = setInterval(fetchMarketOverview, refreshInterval);
    return () => clearInterval(interval);
  }, [marketType]);

  // Get market type icon
  const getMarketIcon = () => {
    switch (marketType) {
      case 'stocks':
        return <BarChart3 className="w-5 h-5 text-blue-500" />;
      case 'crypto':
        return <Globe className="w-5 h-5 text-purple-500" />;
      case 'commodities':
        return <Wallet className="w-5 h-5 text-green-500" />;
      default:
        return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {getMarketIcon()}
          <div>
            <h1 className="text-2xl font-bold text-white capitalize">{marketType} Dashboard</h1>
            <p className="text-slate-400 text-sm">Real-time market insights and analytics</p>
          </div>
        </div>
        {marketType === 'stocks' && (
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-slate-300">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Main Dashboard Layout - Professional trading terminal workspace */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-160px)]">
        {/* Left Column - Dominant chart workspace taking up majority of width */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Trading Chart - Primary focus area, dominant and fluid */}
          <div className="flex-1 min-h-[500px] bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
            <TradingChart />
          </div>

          {/* Market Overview Section - Integrated with main chart area */}
          <div className="mt-6 h-[200px] bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-800/50 bg-slate-800/30">
              <h2 className="text-lg font-semibold text-white">Market Overview</h2>
              <p className="text-sm text-slate-400">Top performing assets in {marketType}</p>
            </div>
            <div className="p-4 h-full overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                {marketOverview.length > 0 ? (
                  marketOverview.map((stock) => (
                    <div key={stock.symbol} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors h-full">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-white font-bold">{stock.symbol}</h3>
                          <p className="text-slate-400 text-xs">{stock.name}</p>
                        </div>
                        <div className={`flex items-center gap-1 ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stock.changePercent >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span className="text-xs font-medium">
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-lg text-white font-bold">
                            ${stock.price.toFixed(2)}
                          </span>
                          <span className={`text-xs ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-700/30 rounded p-2">
                            <div className="text-slate-400">Change %</div>
                            <div className={`font-medium ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </div>
                          </div>
                          <div className="bg-slate-700/30 rounded p-2">
                            <div className="text-slate-400">Volume</div>
                            <div className="text-white">{stock.volume}</div>
                          </div>
                        </div>
                      </div>
                      {/* Show coming soon message for non-stock markets */}
                      {marketType !== 'stocks' && (
                        <div className="mt-2 p-1 bg-yellow-500/20 rounded text-center">
                          <p className="text-yellow-300 text-xs">Coming Soon</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-4">
                    <p className="text-slate-400">Loading market data...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* API Endpoint Controls */}
          <div className="mt-6">
            <EndpointControls />
          </div>
        </div>

        {/* Right Column - Controls and supporting panels */}
        <div className="w-80 flex flex-col gap-6 flex-shrink-0">
          {/* Input Panel - Directly below or to the side of chart */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden flex-shrink-0">
            <InputPanel />
          </div>

          {/* Live Predictions Feed */}
          <div className="flex-1 min-h-[150px] bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
            <LivePredictionsFeed />
          </div>

          {/* Execution Console */}
          <div className="flex-1 min-h-[150px] bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
            <ExecutionConsole />
          </div>

          {/* Chat Panel */}
          <div className="flex-1 min-h-[150px] bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
