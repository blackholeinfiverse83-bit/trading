import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';
import { Badge } from './ui/badge';
import { apiService } from '../services/api';

interface ExecutionEvent {
  id: string;
  timestamp: string;
  type: 'entry' | 'exit' | 'analysis' | 'alert';
  status: 'success' | 'pending' | 'failed';
  asset: string;
  action: string;
  details: string;
  price?: number;
  pnl?: number;
}

export function ExecutionConsole() {
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch real execution events from backend
    const fetchExecutionEvents = async () => {
      try {
        setLoading(true);
        // For now, we'll use mock data since there's no specific endpoint for execution events
        // In a real implementation, this would fetch from an actual endpoint
        const mockEvents: ExecutionEvent[] = [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            type: 'entry',
            status: 'success',
            asset: 'AAPL',
            action: 'LONG Entry Executed',
            details: 'AI model confidence 87.5% - Entered long position at support level',
            price: 145.30,
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 180000).toISOString(),
            type: 'analysis',
            status: 'pending',
            asset: 'GOOGL',
            action: 'Signal Analysis',
            details: 'Monitoring RSI divergence, awaiting confirmation',
          },
          {
            id: '3',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            type: 'exit',
            status: 'success',
            asset: 'MSFT',
            action: 'Target Reached',
            details: 'Closed position at 5% profit target',
            price: 245.78,
            pnl: 12.29,
          },
          {
            id: '4',
            timestamp: new Date(Date.now() - 480000).toISOString(),
            type: 'alert',
            status: 'failed',
            asset: 'NVDA',
            action: 'Entry Rejected',
            details: 'Market conditions outside acceptable risk parameters',
          },
          {
            id: '5',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            type: 'entry',
            status: 'success',
            asset: 'TSLA',
            action: 'SHORT Entry Executed',
            details: 'Resistance rejection pattern confirmed - 82.3% confidence',
            price: 235.45,
          },
        ];

        setEvents(mockEvents);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch execution events:', error);
        setLoading(false);
        // Fallback to mock data on error
        const mockEvents: ExecutionEvent[] = [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            type: 'entry',
            status: 'success',
            asset: 'AAPL',
            action: 'LONG Entry Executed',
            details: 'AI model confidence 87.5% - Entered long position at support level',
            price: 145.30,
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 180000).toISOString(),
            type: 'analysis',
            status: 'pending',
            asset: 'GOOGL',
            action: 'Signal Analysis',
            details: 'Monitoring RSI divergence, awaiting confirmation',
          },
        ];
        setEvents(mockEvents);
      }
    };

    fetchExecutionEvents();

    // Simulate new events periodically
    const interval = setInterval(() => {
      const newEvent: ExecutionEvent = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: ['entry', 'analysis', 'alert'][Math.floor(Math.random() * 3)] as any,
        status: ['success', 'pending'][Math.floor(Math.random() * 2)] as any,
        asset: ['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA'][Math.floor(Math.random() * 5)],
        action: 'New AI Decision',
        details: 'Processing market data and technical indicators',
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 10));
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'entry':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'exit':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'analysis':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'alert':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden flex-1" style={{ minHeight: '300px' }}>
      <div className="px-5 py-4 border-b border-slate-800/50 bg-slate-800/30">
        <h2 className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          Execution Console
        </h2>
        <p className="text-sm text-slate-400 mt-1">AI decision log & trade execution</p>
      </div>

      <div className="p-4 space-y-3 h-full overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-slate-400 text-sm">Loading execution events...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getStatusIcon(event.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white">{event.action}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTypeColor(event.type)}`}
                        >
                          {event.type.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-blue-400">{event.asset}</span>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed mb-3">
                      {event.details}
                    </p>

                    {(event.price || event.pnl !== undefined) && (
                      <div className="flex items-center gap-4 pt-2 border-t border-slate-700/50">
                        {event.price && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Price:</span>
                            <span className="text-sm text-white">${event.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        {event.pnl !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">P&L:</span>
                            <span className={`text-sm ${event.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {event.pnl >= 0 ? '+' : ''}${event.pnl.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
