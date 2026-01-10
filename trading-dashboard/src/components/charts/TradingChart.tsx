import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData } from 'lightweight-charts';
import { useTheme } from '../../contexts/ThemeContext';

interface TradingChartProps {
  symbol: string;
  data: CandlestickData[];
  volumeData?: HistogramData[];
  height?: number;
}

export const TradingChart = ({ symbol, data, volumeData, height = 400 }: TradingChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState('1D');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = theme === 'dark' || theme === 'space';
    
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: isDark ? '#1e293b' : '#ffffff' },
        textColor: isDark ? '#e2e8f0' : '#374151',
      },
      grid: {
        vertLines: { color: isDark ? '#334155' : '#f1f5f9' },
        horzLines: { color: isDark ? '#334155' : '#f1f5f9' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: isDark ? '#475569' : '#d1d5db',
      },
      timeScale: {
        borderColor: isDark ? '#475569' : '#d1d5db',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Candlestick series
    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    // Volume series
    if (volumeData) {
      volumeSeriesRef.current = chartRef.current.addHistogramSeries({
        color: isDark ? '#64748b' : '#94a3b8',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [theme, height]);

  useEffect(() => {
    if (candlestickSeriesRef.current && data.length > 0) {
      candlestickSeriesRef.current.setData(data);
    }
  }, [data]);

  useEffect(() => {
    if (volumeSeriesRef.current && volumeData && volumeData.length > 0) {
      volumeSeriesRef.current.setData(volumeData);
    }
  }, [volumeData]);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{symbol}</h3>
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                timeframe === tf
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full border rounded-lg" />
    </div>
  );
};