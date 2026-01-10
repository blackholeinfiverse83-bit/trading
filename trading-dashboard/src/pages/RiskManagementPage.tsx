import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Shield, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { riskAPI } from '../services/api';

const RiskManagementPage = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isSpace = theme === 'space';
  
  const [symbol, setSymbol] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [timeframe, setTimeframe] = useState('1d');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSetStopLoss = async () => {
    if (!symbol || !stopLossPrice) {
      setMessage('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await riskAPI.setStopLoss(
        symbol.toUpperCase(),
        parseFloat(stopLossPrice),
        side,
        timeframe,
        'manual'
      );
      setMessage('Stop loss set successfully!');
      setSymbol('');
      setStopLossPrice('');
    } catch (error: any) {
      setMessage(error.message || 'Failed to set stop loss');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-500" />
          <div>
            <h1 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Risk Management
            </h1>
            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Manage your trading risks and set stop losses
            </p>
          </div>
        </div>

        {/* Stop Loss Section */}
        <div className={`${isLight 
          ? 'bg-white border border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
          : isSpace 
            ? 'bg-slate-800/30 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20'
            : 'bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-500/30 shadow-xl shadow-yellow-500/10'
        } rounded-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Set Stop Loss
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                Symbol
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL, TSLA"
                className={`w-full px-4 py-3 rounded-lg border ${isLight
                  ? 'bg-gray-50 border-gray-300 text-gray-900'
                  : 'bg-slate-700 border-slate-600 text-white'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                Stop Loss Price
              </label>
              <input
                type="number"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className={`w-full px-4 py-3 rounded-lg border ${isLight
                  ? 'bg-gray-50 border-gray-300 text-gray-900'
                  : 'bg-slate-700 border-slate-600 text-white'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                Side
              </label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value as 'BUY' | 'SELL')}
                className={`w-full px-4 py-3 rounded-lg border ${isLight
                  ? 'bg-gray-50 border-gray-300 text-gray-900'
                  : 'bg-slate-700 border-slate-600 text-white'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} mb-2`}>
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${isLight
                  ? 'bg-gray-50 border-gray-300 text-gray-900'
                  : 'bg-slate-700 border-slate-600 text-white'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="1d">1 Day</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSetStopLoss}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-all"
            >
              <Shield className="w-5 h-5" />
              {loading ? 'Setting...' : 'Set Stop Loss'}
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-4 rounded-lg ${message.includes('success') 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Risk Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Portfolio Risk', value: '2.5%', icon: TrendingDown, color: 'red' },
            { label: 'Max Drawdown', value: '5.2%', icon: AlertTriangle, color: 'orange' },
            { label: 'Risk/Reward', value: '1:3', icon: DollarSign, color: 'green' },
          ].map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className={`${isLight 
                  ? 'bg-white border border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
                  : isSpace 
                    ? 'bg-slate-800/30 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20'
                    : 'bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-500/30 shadow-xl shadow-yellow-500/10'
                } rounded-lg p-6`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Icon className={`w-6 h-6 text-${metric.color}-500`} />
                  <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {metric.label}
                  </h3>
                </div>
                <p className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {metric.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default RiskManagementPage;