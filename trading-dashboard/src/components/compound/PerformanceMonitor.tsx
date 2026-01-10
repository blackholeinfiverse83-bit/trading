import { useEffect, useState } from 'react';
import { Activity, Cpu, HardDrive, Wifi, Clock, TrendingUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  requests: number;
}

interface PerformanceMetric {
  label: string;
  value: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  threshold: { warning: number; critical: number };
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: 0,
    requests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    // Simulate real-time metrics
    const updateMetrics = () => {
      setMetrics({
        cpu: Math.random() * 100,
        memory: 60 + Math.random() * 30,
        disk: 45 + Math.random() * 20,
        network: Math.random() * 1000,
        uptime: Date.now() / 1000 - 86400, // 1 day uptime
        requests: Math.floor(Math.random() * 1000),
      });
      setIsLoading(false);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);

    return () => clearInterval(interval);
  }, []);

  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'CPU Usage',
      value: metrics.cpu,
      unit: '%',
      icon: Cpu,
      color: metrics.cpu > 80 ? 'text-red-400' : metrics.cpu > 60 ? 'text-yellow-400' : 'text-green-400',
      threshold: { warning: 60, critical: 80 },
    },
    {
      label: 'Memory',
      value: metrics.memory,
      unit: '%',
      icon: HardDrive,
      color: metrics.memory > 85 ? 'text-red-400' : metrics.memory > 70 ? 'text-yellow-400' : 'text-green-400',
      threshold: { warning: 70, critical: 85 },
    },
    {
      label: 'Network',
      value: metrics.network,
      unit: 'KB/s',
      icon: Wifi,
      color: 'text-blue-400',
      threshold: { warning: 500, critical: 800 },
    },
    {
      label: 'Requests',
      value: metrics.requests,
      unit: '/min',
      icon: TrendingUp,
      color: 'text-purple-400',
      threshold: { warning: 500, critical: 800 },
    },
  ];

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border rounded-lg p-4`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-4 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded w-1/3`}></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-16 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'} flex items-center gap-2`}>
          <Activity className="w-5 h-5 text-blue-400" />
          System Performance
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>
            Uptime: {formatUptime(metrics.uptime)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon;
          const isWarning = metric.value > metric.threshold.warning;
          const isCritical = metric.value > metric.threshold.critical;
          
          return (
            <div
              key={metric.label}
              className={`p-3 rounded-lg border ${
                isCritical
                  ? 'bg-red-500/10 border-red-500/30'
                  : isWarning
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : isLight
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-slate-700/50 border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${metric.color}`} />
                <span className={`text-xs font-medium ${
                  isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {isCritical ? 'Critical' : isWarning ? 'Warning' : 'Normal'}
                </span>
              </div>
              <div className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {metric.value.toFixed(1)}{metric.unit}
              </div>
              <div className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                {metric.label}
              </div>
              
              {/* Progress bar */}
              <div className={`mt-2 h-1 rounded-full overflow-hidden ${
                isLight ? 'bg-gray-200' : 'bg-slate-600'
              }`}>
                <div
                  className={`h-full transition-all duration-300 ${
                    isCritical ? 'bg-red-400' : isWarning ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${Math.min(metric.value, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time chart placeholder */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        <div className={`h-20 rounded ${isLight ? 'bg-gray-50' : 'bg-slate-700/50'} flex items-center justify-center`}>
          <span className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            Real-time performance chart (coming soon)
          </span>
        </div>
      </div>
    </div>
  );
};