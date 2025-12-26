import { useState } from 'react';
import { stockAPI } from '../services/api';
import { AlertTriangle, Shield, TrendingDown, DollarSign, Calculator, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface StopLossProps {
  onStopLossCalculated?: (stopLossPrice: number, symbol: string) => void;
}

interface StopLossResult {
  stopLossPrice: number;
  riskAmount: number;
  positionSize: number;
  riskLevel: 'safe' | 'warning' | 'danger';
  entryPrice: number;
  symbol: string;
}

const StopLoss = ({ onStopLossCalculated }: StopLossProps) => {
  const [symbol, setSymbol] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [capital, setCapital] = useState('');
  const [riskPercentage, setRiskPercentage] = useState('2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StopLossResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const calculateStopLoss = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol || !entryPrice || !capital || !riskPercentage) {
      setError('Please fill in all fields');
      return;
    }

    const entry = parseFloat(entryPrice);
    const cap = parseFloat(capital);
    const riskPct = parseFloat(riskPercentage);

    if (isNaN(entry) || entry <= 0) {
      setError('Entry price must be a positive number');
      return;
    }
    if (isNaN(cap) || cap <= 0) {
      setError('Capital must be a positive number');
      return;
    }
    if (isNaN(riskPct) || riskPct <= 0 || riskPct > 100) {
      setError('Risk percentage must be between 0 and 100');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Calculate stop-loss percentage from risk percentage
      // Risk percentage is the % of capital at risk
      // Stop-loss percentage is the % price drop from entry
      const stopLossPct = riskPct; // Using risk percentage as stop-loss percentage
      
      // Call analyze endpoint with calculated stop-loss
      const response = await stockAPI.analyze(
        symbol.toUpperCase(),
        ['intraday'],
        stopLossPct,
        riskPct, // capital_risk_pct
        5.0 // drawdown_limit_pct (default)
      );

      // Check for errors in metadata
      if (response.metadata?.error) {
        throw new Error(response.metadata.error);
      }

      // Calculate stop-loss price from entry price and risk percentage
      const stopLossPrice = entry * (1 - riskPct / 100);
      const riskAmount = (cap * riskPct) / 100;
      const positionSize = cap / entry;
      
      // Determine risk level
      let riskLevel: 'safe' | 'warning' | 'danger';
      if (riskPct <= 2) {
        riskLevel = 'safe';
      } else if (riskPct <= 5) {
        riskLevel = 'warning';
      } else {
        riskLevel = 'danger';
      }

      const stopLossResult: StopLossResult = {
        stopLossPrice,
        riskAmount,
        positionSize,
        riskLevel,
        entryPrice: entry,
        symbol: symbol.toUpperCase(),
      };

      setResult(stopLossResult);
      
      // Notify parent component if callback provided
      if (onStopLossCalculated) {
        onStopLossCalculated(stopLossPrice, symbol.toUpperCase());
      }
    } catch (error: any) {
      console.error('Stop-loss calculation failed:', error);
      setError(error.message || 'Failed to calculate stop-loss. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSymbol('');
    setEntryPrice('');
    setCapital('');
    setRiskPercentage('2');
    setError(null);
    setResult(null);
  };

  // If minimized, show compact button
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-all hover:scale-105"
        >
          <Shield className="w-5 h-5" />
          <span className="font-semibold">Stop-Loss</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 w-80 z-40 bg-slate-800/95 backdrop-blur-sm rounded-lg border border-slate-700/50 shadow-2xl">
      {/* Compact Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-white">Stop-Loss</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title="Minimize"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Compact Form */}
      <div className="p-3">
        <form onSubmit={calculateStopLoss} className="space-y-2">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Symbol <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="AAPL"
                  className="w-full px-2 py-1.5 text-sm bg-slate-700/50 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Entry ($) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="150.00"
                  className="w-full px-2 py-1.5 text-sm bg-slate-700/50 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Capital ($) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  placeholder="10000"
                  className="w-full px-2 py-1.5 text-sm bg-slate-700/50 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Risk (%) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={riskPercentage}
                  onChange={(e) => setRiskPercentage(e.target.value)}
                  placeholder="2.0"
                  className="w-full px-2 py-1.5 text-sm bg-slate-700/50 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 p-1.5 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                <span>Calculate</span>
              </>
            )}
          </button>
          {result && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-semibold transition-all"
            >
              Reset
            </button>
          )}
        </form>

        {result && (
          <div className={`mt-3 space-y-2 animate-fadeIn border-t border-slate-700/50 pt-3 ${!isExpanded ? 'max-h-0 overflow-hidden' : ''}`}>
            {/* Compact Results */}
            <div className={`p-2 rounded border ${
              result.riskLevel === 'safe' ? 'bg-green-500/10 border-green-500/30' :
              result.riskLevel === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-1.5 mb-2">
                {result.riskLevel === 'safe' ? (
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                ) : result.riskLevel === 'warning' ? (
                  <AlertTriangle className="w-3 h-3 text-yellow-400" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400" />
                )}
                <span className={`text-xs font-bold ${
                  result.riskLevel === 'safe' ? 'text-green-400' :
                  result.riskLevel === 'warning' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {result.riskLevel.toUpperCase()}
                </span>
              </div>

              {/* Compact Metrics - 2x2 Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-slate-900/50 rounded p-1.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <TrendingDown className="w-2.5 h-2.5 text-red-400" />
                    <span className="text-xs text-gray-400">Stop-Loss</span>
                  </div>
                  <p className="text-xs font-bold text-white">
                    ${result.stopLossPrice.toFixed(2)}
                  </p>
                </div>

                <div className="bg-slate-900/50 rounded p-1.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <DollarSign className="w-2.5 h-2.5 text-yellow-400" />
                    <span className="text-xs text-gray-400">Risk</span>
                  </div>
                  <p className="text-xs font-bold text-white">
                    ${result.riskAmount.toFixed(0)}
                  </p>
                </div>

                <div className="bg-slate-900/50 rounded p-1.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Calculator className="w-2.5 h-2.5 text-blue-400" />
                    <span className="text-xs text-gray-400">Shares</span>
                  </div>
                  <p className="text-xs font-bold text-white">
                    {result.positionSize.toFixed(0)}
                  </p>
                </div>

                <div className="bg-slate-900/50 rounded p-1.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Shield className="w-2.5 h-2.5 text-purple-400" />
                    <span className="text-xs text-gray-400">Entry</span>
                  </div>
                  <p className="text-xs font-bold text-white">
                    ${result.entryPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Compact Chart - Only when expanded */}
            {isExpanded && (
              <div className="bg-slate-900/50 rounded p-2 border border-slate-700/50">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingDown className="w-3 h-3 text-red-400" />
                  <span className="text-xs font-semibold text-gray-300">Price Levels</span>
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart
                    data={[
                      { name: 'Entry', price: result.entryPrice },
                      { name: 'Current', price: result.entryPrice },
                    ]}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF" 
                      tick={{ fill: '#9CA3AF', fontSize: 9 }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF', fontSize: 9 }}
                      domain={[result.stopLossPrice * 0.98, result.entryPrice * 1.02]}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E293B', 
                        border: '1px solid #475569',
                        borderRadius: '4px',
                        padding: '4px',
                        fontSize: '10px'
                      }}
                      labelStyle={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '10px' }}
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3B82F6" 
                      strokeWidth={1.5}
                      dot={{ fill: '#3B82F6', r: 2 }}
                    />
                    <ReferenceLine 
                      y={result.stopLossPrice} 
                      stroke="#EF4444" 
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      label={{ 
                        value: `SL: $${result.stopLossPrice.toFixed(0)}`, 
                        position: 'right',
                        fill: '#EF4444',
                        fontSize: 8
                      }}
                    />
                    <ReferenceLine 
                      y={result.entryPrice} 
                      stroke="#22C55E" 
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      label={{ 
                        value: `$${result.entryPrice.toFixed(0)}`, 
                        position: 'left',
                        fill: '#22C55E',
                        fontSize: 8
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default StopLoss;

