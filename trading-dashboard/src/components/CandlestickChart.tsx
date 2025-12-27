import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { stockAPI } from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Settings, 
  ZoomIn, 
  ZoomOut, 
  Type,
  X
} from 'lucide-react';

interface CandlestickChartProps {
  symbol: string;
  exchange?: string;
  onClose?: () => void;
}

const CandlestickChart = ({ symbol, exchange = 'NSE', onClose }: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  
  const [timeframe, setTimeframe] = useState<string>('5m');
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [ohlc, setOhlc] = useState({ open: 0, high: 0, low: 0, close: 0, change: 0, changePercent: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIndicators, setShowIndicators] = useState(false);
  const [showOptionsChain, setShowOptionsChain] = useState(false);

  // Timeframe options
  const timeframes = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '30m', label: '30m' },
    { value: '1h', label: '1h' },
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: '1mo', label: '1M' },
  ];

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1e293b' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#334155', style: 1 },
        horzLines: { color: '#334155', style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#475569',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: '#475569',
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: '#475569',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#475569',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    chartRef.current = chart;

    // Create candlestick series (v4.x API)
    const candlestickSeries = (chart as any).addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    }) as ISeriesApi<'Candlestick'>;
    candlestickSeriesRef.current = candlestickSeries;

    // Create volume series (v4.x API)
    const volumeSeries = (chart as any).addHistogramSeries({
      color: '#3b82f6',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    }) as ISeriesApi<'Histogram'>;
    volumeSeriesRef.current = volumeSeries;

    // Set up volume price scale
    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Fetch and update chart data
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch historical data from backend
        const response = await stockAPI.fetchData([symbol], '1mo', false, false);
        
        if (response.data && response.data[symbol] && response.data[symbol].history) {
          const history = response.data[symbol].history;
          
          // Convert to candlestick format
          const candlestickData: CandlestickData[] = history.map((item: any, index: number) => ({
            time: (index + 1) as Time,
            open: item.open || item.Close || 0,
            high: item.high || item.Close || 0,
            low: item.low || item.Close || 0,
            close: item.close || item.Close || 0,
          }));

          // Calculate volume data (if available)
          const volumeData = history.map((item: any, index: number) => ({
            time: (index + 1) as Time,
            value: item.volume || 0,
            color: (item.close || item.Close || 0) >= (item.open || item.Close || 0) ? '#10b981' : '#ef4444',
          }));

          // Update series
          if (candlestickSeriesRef.current) {
            candlestickSeriesRef.current.setData(candlestickData);
          }
          if (volumeSeriesRef.current) {
            volumeSeriesRef.current.setData(volumeData);
          }

          // Calculate OHLC from latest data
          if (candlestickData.length > 0) {
            const latest = candlestickData[candlestickData.length - 1];
            const previous = candlestickData.length > 1 ? candlestickData[candlestickData.length - 2] : latest;
            
            setOhlc({
              open: latest.open,
              high: latest.high,
              low: latest.low,
              close: latest.close,
              change: latest.close - previous.close,
              changePercent: ((latest.close - previous.close) / previous.close) * 100,
            });
          }
        } else {
          // No data available from backend
          setError('No historical data available for this symbol. Please ensure the backend is running and the symbol is valid.');
          if (candlestickSeriesRef.current) {
            candlestickSeriesRef.current.setData([]);
          }
          if (volumeSeriesRef.current) {
            volumeSeriesRef.current.setData([]);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch chart data:', err);
        setError(err.message || 'Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [symbol, timeframe]);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">{symbol}</h3>
              <p className="text-xs text-gray-400">{exchange} • {timeframe}</p>
            </div>
            <button
              onClick={() => setShowOptionsChain(!showOptionsChain)}
              className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-sm font-medium transition-colors"
            >
              Chain
            </button>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* OHLC Display */}
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div>
            <p className="text-gray-400">O</p>
            <p className="text-white font-semibold">{ohlc.open.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400">H</p>
            <p className="text-white font-semibold">{ohlc.high.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400">L</p>
            <p className="text-white font-semibold">{ohlc.low.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400">C</p>
            <p className="text-white font-semibold">{ohlc.close.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400">Change</p>
            <p className={`font-semibold ${ohlc.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {ohlc.change >= 0 ? '+' : ''}{ohlc.change.toFixed(2)} ({ohlc.changePercent >= 0 ? '+' : ''}{ohlc.changePercent.toFixed(2)}%)
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  timeframe === tf.value
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                chartType === 'candlestick'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                chartType === 'area'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Type className="w-4 h-4" />
            </button>
          </div>

          {/* Indicators Button */}
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded text-xs font-medium transition-colors flex items-center gap-1"
          >
            <Settings className="w-4 h-4" />
            <span>Indicators</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
            <button className="p-1 text-gray-300 hover:text-white transition-colors">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-300 hover:text-white transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-800/80 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Loading chart data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-slate-800/80 flex items-center justify-center z-10">
            <div className="text-center">
              <p className="text-red-400 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div ref={chartContainerRef} className="w-full" style={{ height: '500px' }} />
      </div>

      {/* Indicators Panel */}
      {showIndicators && (
        <div className="bg-slate-900 border-t border-slate-700 p-3">
          <h4 className="text-sm font-semibold text-white mb-2">Technical Indicators</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['SMA', 'EMA', 'RSI', 'MACD', 'Bollinger Bands', 'Volume SMA'].map((indicator) => (
              <button
                key={indicator}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded text-xs font-medium transition-colors"
              >
                {indicator}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Options Chain Panel (Simplified) */}
      {showOptionsChain && (
        <div className="bg-slate-900 border-t border-slate-700 p-3 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">Options Chain</h4>
            <button
              onClick={() => setShowOptionsChain(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-gray-400 text-center py-4">
            Options chain data will be displayed here. Integration with options API needed.
          </div>
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;

