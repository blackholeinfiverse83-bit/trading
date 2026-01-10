import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, LineData } from 'lightweight-charts';
import { useTheme } from '../../contexts/ThemeContext';

interface TechnicalIndicatorsProps {
  rsiData?: LineData[];
  macdData?: { macd: LineData[]; signal: LineData[]; histogram: LineData[] };
  height?: number;
}

export const TechnicalIndicators = ({ rsiData, macdData, height = 200 }: TechnicalIndicatorsProps) => {
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const macdContainerRef = useRef<HTMLDivElement>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const macdChartRef = useRef<IChartApi | null>(null);
  const { theme } = useTheme();

  const isDark = theme === 'dark' || theme === 'space';

  const chartOptions = {
    layout: {
      background: { color: isDark ? '#1e293b' : '#ffffff' },
      textColor: isDark ? '#e2e8f0' : '#374151',
    },
    grid: {
      vertLines: { color: isDark ? '#334155' : '#f1f5f9' },
      horzLines: { color: isDark ? '#334155' : '#f1f5f9' },
    },
    rightPriceScale: {
      borderColor: isDark ? '#475569' : '#d1d5db',
    },
    timeScale: {
      borderColor: isDark ? '#475569' : '#d1d5db',
      visible: false,
    },
  };

  // RSI Chart
  useEffect(() => {
    if (!rsiContainerRef.current || !rsiData) return;

    rsiChartRef.current = createChart(rsiContainerRef.current, {
      ...chartOptions,
      width: rsiContainerRef.current.clientWidth,
      height: height / 2,
    });

    const rsiSeries = rsiChartRef.current.addLineSeries({
      color: '#8b5cf6',
      lineWidth: 2,
    });

    rsiSeries.setData(rsiData);

    // Add RSI levels
    rsiChartRef.current.addLineSeries({
      color: '#ef4444',
      lineWidth: 1,
      lineStyle: 2,
    }).setData(rsiData.map(d => ({ time: d.time, value: 70 })));

    rsiChartRef.current.addLineSeries({
      color: '#10b981',
      lineWidth: 1,
      lineStyle: 2,
    }).setData(rsiData.map(d => ({ time: d.time, value: 30 })));

    return () => {
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
      }
    };
  }, [rsiData, theme, height]);

  // MACD Chart
  useEffect(() => {
    if (!macdContainerRef.current || !macdData) return;

    macdChartRef.current = createChart(macdContainerRef.current, {
      ...chartOptions,
      width: macdContainerRef.current.clientWidth,
      height: height / 2,
    });

    const macdSeries = macdChartRef.current.addLineSeries({
      color: '#3b82f6',
      lineWidth: 2,
    });

    const signalSeries = macdChartRef.current.addLineSeries({
      color: '#f59e0b',
      lineWidth: 2,
    });

    const histogramSeries = macdChartRef.current.addHistogramSeries({
      color: '#6b7280',
    });

    macdSeries.setData(macdData.macd);
    signalSeries.setData(macdData.signal);
    histogramSeries.setData(macdData.histogram);

    return () => {
      if (macdChartRef.current) {
        macdChartRef.current.remove();
      }
    };
  }, [macdData, theme, height]);

  return (
    <div className="space-y-4">
      {rsiData && (
        <div>
          <h4 className="text-sm font-medium mb-2">RSI (14)</h4>
          <div ref={rsiContainerRef} className="border rounded" />
        </div>
      )}
      {macdData && (
        <div>
          <h4 className="text-sm font-medium mb-2">MACD (12,26,9)</h4>
          <div ref={macdContainerRef} className="border rounded" />
        </div>
      )}
    </div>
  );
};