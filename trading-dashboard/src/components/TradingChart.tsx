import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { apiService } from '../services/api';

interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
}

export function TradingChart() {
  const [timeframe, setTimeframe] = useState('1H');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedAsset, setSelectedAsset] = useState('AAPL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        
        // Map timeframe to horizon
        const horizonMap: { [key: string]: string } = {
          '15M': 'intraday',
          '1H': 'intraday',
          '4H': 'short',
          '1D': 'medium',
        };
        
        const horizon = horizonMap[timeframe] || 'intraday';
        
        // Fetch analysis data from backend (with automatic fallback to mock)
        const response = await apiService.analyze(selectedAsset, [horizon]);
        
        // Transform API response to chart data
        const horizonData = response.horizons[horizon];
        if (!horizonData || !horizonData.price_data) {
          setLoading(false);
          return;
        }
        
        const priceData = horizonData.price_data;
        
        // Transform to simple chart data
        const transformedData: ChartDataPoint[] = priceData.map((item: any) => ({
          time: item.time,
          price: item.close,
          volume: item.volume,
        }));
        
        setChartData(transformedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setLoading(false);
      }
    };

    fetchChartData();
  }, [timeframe, selectedAsset]);

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
  const previousPrice = chartData.length > 1 ? chartData[chartData.length - 2].price : 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0;

  if (loading && chartData.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800/50 bg-slate-800/30">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="text-white">{selectedAsset}</h2>
              <p className="text-sm text-slate-400">Technical Analysis</p>
            </div>
          </div>
        </div>
        <div className="p-12 text-center">
          <div className="animate-pulse text-slate-400">Loading chart data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-800/30 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <div>
            <h2 className="text-white font-medium">{selectedAsset}</h2>
            <p className="text-xs text-slate-400">Technical Analysis</p>
          </div>
        </div>
        
        {/* Asset Selector */}
        <div className="flex gap-1">
          {['AAPL', 'GOOGL', 'MSFT'].map((asset) => (
            <button
              key={asset}
              onClick={() => setSelectedAsset(asset)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                selectedAsset === asset
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {asset}
            </button>
          ))}
        </div>

        {/* Price Info */}
        <div className="flex items-center gap-3">
          <div className="text-lg text-white font-medium">
            ${currentPrice.toFixed(2)}
          </div>
          <div className={`text-xs flex items-center gap-1 ${
            priceChange >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            <TrendingUp className={`w-3 h-3 ${priceChange < 0 ? 'rotate-180' : ''}`} />
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="ml-auto flex gap-1 bg-slate-800/50 rounded-md p-1">
          {['15M', '1H', '4H', '1D'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                timeframe === tf
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              tickMargin={8}
            />
            <YAxis 
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              width={40}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                borderColor: '#334155', 
                borderRadius: '0.375rem',
                color: '#f1f5f9',
                fontSize: '0.75rem'
              }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
              labelStyle={{ color: '#94a3b8', fontSize: '0.625rem' }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              strokeWidth={1.5} 
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}