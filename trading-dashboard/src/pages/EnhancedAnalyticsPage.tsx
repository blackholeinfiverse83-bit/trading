import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { AdvancedChart } from '../components/charts';
import { LivePriceTicker } from '../components/ui';
import { PerformanceMonitor } from '../components/compound';
import { useTheme } from '../contexts/ThemeContext';
import { stockAPI, PredictionItem } from '../services/api';
import { CandlestickData } from 'lightweight-charts';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';

const EnhancedAnalyticsPage = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'];

  useEffect(() => {
    loadData();
  }, [selectedSymbol]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load predictions
      const response = await stockAPI.predict([selectedSymbol], 'intraday');
      if (response.predictions) {
        setPredictions(response.predictions.filter((p: PredictionItem) => !p.error));
      }

      // Generate mock candlestick data
      const mockData = generateMockCandlestickData();
      setChartData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockCandlestickData = (): CandlestickData[] => {
    const data: CandlestickData[] = [];
    const now = Date.now() / 1000;
    let basePrice = 150;
    
    for (let i = 29; i >= 0; i--) {
      const time = (now - i * 24 * 60 * 60) as any;
      const variation = (Math.random() - 0.5) * 0.1;
      basePrice = basePrice * (1 + variation);
      
      const open = basePrice;
      const close = basePrice * (1 + (Math.random() - 0.5) * 0.05);
      const high = Math.max(open, close) * (1 + Math.random() * 0.03);
      const low = Math.min(open, close) * (1 - Math.random() * 0.03);
      
      data.push({ time, open, high, low, close });
    }
    return data;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'} flex items-center gap-2`}>
              <BarChart3 className="w-6 h-6 text-blue-400" />
              Advanced Analytics
            </h1>
            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Professional trading charts, real-time data, and system monitoring
            </p>
          </div>
          
          {/* Symbol Selector */}
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className={`px-4 py-2 rounded-lg border font-medium ${
              isLight 
                ? 'bg-white border-gray-300 text-gray-900' 
                : 'bg-slate-700 border-slate-600 text-white'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {symbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>

        {/* Main Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {loading ? (
              <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border rounded-lg p-6`}>
                <div className="animate-pulse space-y-4">
                  <div className={`h-6 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded w-1/4`}></div>
                  <div className={`h-96 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded`}></div>
                </div>
              </div>
            ) : (
              <AdvancedChart
                symbol={selectedSymbol}
                data={chartData}
                className="h-full"
              />
            )}
          </div>
          
          {/* Side Panel */}
          <div className="space-y-4">
            <LivePriceTicker symbols={symbols} />
            
            {/* Quick Stats */}
            <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border rounded-lg p-4`}>
              <h3 className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'} mb-3 flex items-center gap-2`}>
                <TrendingUp className="w-4 h-4 text-green-400" />
                Quick Stats
              </h3>
              {predictions.length > 0 ? (
                <div className="space-y-3">
                  {predictions.slice(0, 1).map(pred => (
                    <div key={pred.symbol}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Current Price</span>
                        <span className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                          ${pred.current_price?.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Predicted Return</span>
                        <span className={`font-bold ${
                          (pred.predicted_return || 0) > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {pred.predicted_return ? `${pred.predicted_return.toFixed(2)}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Confidence</span>
                        <span className={`font-bold ${
                          (pred.confidence || 0) > 0.7 ? 'text-green-400' : 
                          (pred.confidence || 0) > 0.5 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {pred.confidence ? `${(pred.confidence * 100).toFixed(0)}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-4 text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  No prediction data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Monitor */}
        <PerformanceMonitor />

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border rounded-lg p-6 text-center`}>
            <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'} mb-2`}>
              Advanced Charts
            </h3>
            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Professional TradingView-style charts with technical indicators, drawing tools, and multiple timeframes.
            </p>
          </div>
          
          <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border rounded-lg p-6 text-center`}>
            <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'} mb-2`}>
              Real-time Data
            </h3>
            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Live price updates via WebSocket connections with automatic reconnection and error handling.
            </p>
          </div>
          
          <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border rounded-lg p-6 text-center`}>
            <Activity className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'} mb-2`}>
              Performance Monitor
            </h3>
            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Real-time system metrics including CPU, memory, network usage, and application performance.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnhancedAnalyticsPage;