import { useState } from 'react';
import { stockAPI } from '../services/api';
import { AlertTriangle, Shield, TrendingDown, DollarSign, Calculator, Loader2, CheckCircle2, XCircle } from 'lucide-react';
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

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-red-400" />
        <h2 className="text-lg font-semibold text-white">Stop-Loss Calculator</h2>
      </div>

      <form onSubmit={calculateStopLoss} className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Symbol <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              className="w-full px-3 py-1.5 text-sm bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-1.5 text-sm bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

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
              className="w-full px-3 py-1.5 text-sm bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-1.5 text-sm bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {result && (
        <div className="mt-4 space-y-3 animate-fadeIn">
          {/* Compact Results - Single Row */}
          <div className={`p-3 rounded-lg border ${
            result.riskLevel === 'safe' ? 'bg-green-500/10 border-green-500/30' :
            result.riskLevel === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
            'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {result.riskLevel === 'safe' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : result.riskLevel === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm font-bold ${
                  result.riskLevel === 'safe' ? 'text-green-400' :
                  result.riskLevel === 'warning' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {result.riskLevel.toUpperCase()} Risk
                </span>
              </div>
            </div>

            {/* Compact Metrics Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-slate-900/50 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingDown className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-gray-400">Stop-Loss</span>
                </div>
                <p className="text-sm font-bold text-white">
                  ${result.stopLossPrice.toFixed(2)}
                </p>
              </div>

              <div className="bg-slate-900/50 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <DollarSign className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-gray-400">Risk</span>
                </div>
                <p className="text-sm font-bold text-white">
                  ${result.riskAmount.toFixed(0)}
                </p>
              </div>

              <div className="bg-slate-900/50 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Calculator className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-gray-400">Shares</span>
                </div>
                <p className="text-sm font-bold text-white">
                  {result.positionSize.toFixed(0)}
                </p>
              </div>

              <div className="bg-slate-900/50 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Shield className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-gray-400">Entry</span>
                </div>
                <p className="text-sm font-bold text-white">
                  ${result.entryPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Compact Chart - Smaller */}
          <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-3 h-3 text-red-400" />
              <span className="text-xs font-semibold text-gray-300">Price Levels</span>
            </div>
            <ResponsiveContainer width="100%" height={120}>
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
                  tick={{ fill: '#9CA3AF', fontSize: 10 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 10 }}
                  domain={[result.stopLossPrice * 0.98, result.entryPrice * 1.02]}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                  width={50}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '6px',
                    fontSize: '11px'
                  }}
                  labelStyle={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '11px' }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 3 }}
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
                    fontSize: 9
                  }}
                />
                <ReferenceLine 
                  y={result.entryPrice} 
                  stroke="#22C55E" 
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  label={{ 
                    value: `Entry: $${result.entryPrice.toFixed(0)}`, 
                    position: 'left',
                    fill: '#22C55E',
                    fontSize: 9
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default StopLoss;

