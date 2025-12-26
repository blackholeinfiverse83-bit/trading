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
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 card-hover">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Stop-Loss Calculator</h2>
            <p className="text-sm text-gray-400">Calculate risk parameters for your trades</p>
          </div>
        </div>
      </div>

      <form onSubmit={calculateStopLoss} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Symbol <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Entry Price ($) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="150.00"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Capital ($) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              placeholder="10000.00"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Risk Percentage (%) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={riskPercentage}
              onChange={(e) => setRiskPercentage(e.target.value)}
              placeholder="2.0"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 1-5% for conservative, 5-10% for moderate</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                <span>Calculate Stop-Loss</span>
              </>
            )}
          </button>
          {result && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {result && (
        <div className="mt-6 space-y-4 animate-fadeIn">
          {/* Stop-Loss Chart Visualization */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              Price Chart with Stop-Loss
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={[
                  { name: 'Entry', price: result.entryPrice },
                  { name: 'Current', price: result.entryPrice },
                ]}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  domain={[result.stopLossPrice * 0.98, result.entryPrice * 1.02]}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                  labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                {/* Stop-Loss Reference Line */}
                <ReferenceLine 
                  y={result.stopLossPrice} 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ 
                    value: `Stop-Loss: $${result.stopLossPrice.toFixed(2)}`, 
                    position: 'right',
                    fill: '#EF4444',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}
                />
                {/* Entry Price Reference Line */}
                <ReferenceLine 
                  y={result.entryPrice} 
                  stroke="#22C55E" 
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{ 
                    value: `Entry: $${result.entryPrice.toFixed(2)}`, 
                    position: 'left',
                    fill: '#22C55E',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            result.riskLevel === 'safe' ? 'bg-green-500/10 border-green-500/30' :
            result.riskLevel === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
            'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {result.riskLevel === 'safe' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : result.riskLevel === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`font-bold text-lg ${
                  result.riskLevel === 'safe' ? 'text-green-400' :
                  result.riskLevel === 'warning' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  Risk Level: {result.riskLevel.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-gray-400">Stop-Loss Price</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${result.stopLossPrice.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {((result.entryPrice - result.stopLossPrice) / result.entryPrice * 100).toFixed(2)}% below entry
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-400">Risk Amount</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${result.riskAmount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {riskPercentage}% of ${parseFloat(capital).toLocaleString()}
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Position Size</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {result.positionSize.toFixed(2)} shares
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  At ${result.entryPrice.toFixed(2)} per share
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">Entry Price</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${result.entryPrice.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Symbol: {result.symbol}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StopLoss;

