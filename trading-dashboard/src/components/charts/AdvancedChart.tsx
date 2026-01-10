import { useState, useEffect } from 'react';
import { TradingChart } from './TradingChart';
import { TechnicalIndicators } from './TechnicalIndicators';
import { ChartControls } from './ChartControls';
import { CandlestickData, HistogramData, LineData } from 'lightweight-charts';

interface AdvancedChartProps {
  symbol: string;
  data: CandlestickData[];
  className?: string;
}

export const AdvancedChart = ({ symbol, data, className = '' }: AdvancedChartProps) => {
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['volume']);
  const [activeTool, setActiveTool] = useState('cursor');
  const [volumeData, setVolumeData] = useState<HistogramData[]>([]);
  const [rsiData, setRsiData] = useState<LineData[]>([]);
  const [macdData, setMacdData] = useState<{ macd: LineData[]; signal: LineData[]; histogram: LineData[] }>();

  // Generate mock technical indicator data
  useEffect(() => {
    if (data.length === 0) return;

    // Mock volume data
    const volume = data.map((candle, index) => ({
      time: candle.time,
      value: Math.random() * 1000000 + 500000,
      color: candle.close > candle.open ? '#10b981' : '#ef4444'
    }));
    setVolumeData(volume);

    // Mock RSI data
    const rsi = data.map((candle, index) => ({
      time: candle.time,
      value: 30 + Math.random() * 40 // RSI between 30-70
    }));
    setRsiData(rsi);

    // Mock MACD data
    const macd = data.map((candle, index) => ({
      time: candle.time,
      value: (Math.random() - 0.5) * 2
    }));
    const signal = data.map((candle, index) => ({
      time: candle.time,
      value: (Math.random() - 0.5) * 1.5
    }));
    const histogram = data.map((candle, index) => ({
      time: candle.time,
      value: (Math.random() - 0.5) * 0.5
    }));
    setMacdData({ macd, signal, histogram });
  }, [data]);

  const handleToolSelect = (tool: string) => {
    setActiveTool(tool);
  };

  const handleIndicatorToggle = (indicator: string) => {
    setActiveIndicators(prev => 
      prev.includes(indicator) 
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border ${className}`}>
      <ChartControls
        onToolSelect={handleToolSelect}
        onIndicatorToggle={handleIndicatorToggle}
        activeIndicators={activeIndicators}
      />
      
      <div className="p-4">
        <TradingChart
          symbol={symbol}
          data={data}
          volumeData={activeIndicators.includes('volume') ? volumeData : undefined}
          height={400}
        />
        
        {(activeIndicators.includes('rsi') || activeIndicators.includes('macd')) && (
          <div className="mt-4">
            <TechnicalIndicators
              rsiData={activeIndicators.includes('rsi') ? rsiData : undefined}
              macdData={activeIndicators.includes('macd') ? macdData : undefined}
              height={200}
            />
          </div>
        )}
      </div>
    </div>
  );
};