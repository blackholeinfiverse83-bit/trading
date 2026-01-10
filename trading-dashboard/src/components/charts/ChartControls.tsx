import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Square, 
  Circle, 
  MousePointer,
  Settings,
  Volume2,
  BarChart3
} from 'lucide-react';

interface ChartControlsProps {
  onToolSelect: (tool: string) => void;
  onIndicatorToggle: (indicator: string) => void;
  activeIndicators: string[];
}

export const ChartControls = ({ onToolSelect, onIndicatorToggle, activeIndicators }: ChartControlsProps) => {
  const [activeTool, setActiveTool] = useState('cursor');
  const [showSettings, setShowSettings] = useState(false);

  const tools = [
    { id: 'cursor', icon: MousePointer, label: 'Cursor' },
    { id: 'trendline', icon: TrendingUp, label: 'Trend Line' },
    { id: 'horizontal', icon: Minus, label: 'Horizontal Line' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
  ];

  const indicators = [
    { id: 'volume', label: 'Volume', icon: Volume2 },
    { id: 'rsi', label: 'RSI' },
    { id: 'macd', label: 'MACD' },
    { id: 'bollinger', label: 'Bollinger Bands' },
    { id: 'sma', label: 'SMA' },
    { id: 'ema', label: 'EMA' },
  ];

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
    onToolSelect(toolId);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 border-b">
      {/* Drawing Tools */}
      <div className="flex items-center gap-1 border-r pr-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${
                activeTool === tool.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : ''
              }`}
              title={tool.label}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* Indicators */}
      <div className="flex items-center gap-1 border-r pr-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          title="Indicators"
        >
          <BarChart3 className="h-4 w-4" />
        </button>
        
        {showSettings && (
          <div className="absolute top-12 left-0 bg-white dark:bg-slate-800 border rounded-lg shadow-lg p-2 z-10">
            <div className="space-y-1">
              {indicators.map((indicator) => {
                const Icon = indicator.icon;
                const isActive = activeIndicators.includes(indicator.id);
                return (
                  <button
                    key={indicator.id}
                    onClick={() => onIndicatorToggle(indicator.id)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-slate-700 ${
                      isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : ''
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {indicator.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">
          {activeTool === 'cursor' ? 'Select mode' : `Drawing: ${tools.find(t => t.id === activeTool)?.label}`}
        </span>
      </div>
    </div>
  );
};