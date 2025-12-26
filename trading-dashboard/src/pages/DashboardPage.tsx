import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { stockAPI } from '../services/api';
import { TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const DashboardPage = () => {
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [dailyChange, setDailyChange] = useState(0);
  const [dailyChangePercent, setDailyChangePercent] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [totalGainPercent, setTotalGainPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topStocks, setTopStocks] = useState<any[]>([]);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [previousPortfolioValue, setPreviousPortfolioValue] = useState<number | null>(null);

  useEffect(() => {
    loadDashboardData();
    loadHealthStatus();
    // Refresh every 60 seconds
    const interval = setInterval(() => {
      loadDashboardData();
      loadHealthStatus();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadHealthStatus = async () => {
    try {
      const health = await stockAPI.health();
      setHealthStatus(health);
    } catch (error) {
      console.error('Failed to load health status:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    // Show loading state immediately
    setTopStocks([]);
    try {
      // Reduced symbols for faster loading - show top 4 most popular
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
      const response = await stockAPI.scanAll(symbols, 'intraday', 0.3);
      
      // Check for errors in metadata
      if (response.metadata?.error) {
        throw new Error(response.metadata.error);
      }
      
      // Backend returns: { metadata, shortlist, all_predictions }
      // Filter out predictions with errors
      const validPredictions = (response.all_predictions || []).filter((p: any) => !p.error);
      
      if (response.shortlist && response.shortlist.length > 0) {
        setTopStocks(response.shortlist.slice(0, 6));
      } else if (validPredictions.length > 0) {
        // Sort by confidence and take top performers
        const sorted = [...validPredictions]
          .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
          .slice(0, 6);
        setTopStocks(sorted);
      } else {
        setTopStocks([]);
        if (response.metadata?.predictions_generated === 0) {
          setError('No predictions generated. The backend may be processing data or models may need training.');
        }
      }
      
      // Calculate real portfolio metrics from predictions
      if (validPredictions.length > 0) {
        // Calculate total portfolio value (sum of all predicted prices)
        const totalValue = validPredictions.reduce((sum: number, pred: any) => {
          return sum + (pred.predicted_price || pred.current_price || 0);
        }, 0);
        
        // Calculate total gain/loss from predicted returns
        const totalReturn = validPredictions.reduce((sum: number, pred: any) => {
          const currentPrice = pred.current_price || 0;
          const predictedPrice = pred.predicted_price || currentPrice;
          const returnValue = ((predictedPrice - currentPrice) / currentPrice) * 100;
          return sum + (returnValue * currentPrice / 100); // Convert percentage to dollar amount
        }, 0);
        
        // Calculate daily change (difference from previous portfolio value)
        if (previousPortfolioValue !== null && previousPortfolioValue > 0) {
          const change = totalValue - previousPortfolioValue;
          const changePercent = (change / previousPortfolioValue) * 100;
          setDailyChange(change);
          setDailyChangePercent(changePercent);
        } else {
          // First load - use average return as daily change estimate
          const avgReturn = validPredictions.reduce((sum: number, pred: any) => {
            return sum + (pred.predicted_return || 0);
          }, 0) / validPredictions.length;
          const estimatedChange = (avgReturn / 100) * totalValue;
          setDailyChange(estimatedChange);
          setDailyChangePercent(avgReturn);
        }
        
        setPortfolioValue(totalValue);
        setTotalGain(totalReturn);
        setTotalGainPercent((totalReturn / totalValue) * 100);
        setPreviousPortfolioValue(totalValue);
      } else {
        // Reset to 0 if no predictions
        setPortfolioValue(0);
        setDailyChange(0);
        setDailyChangePercent(0);
        setTotalGain(0);
        setTotalGainPercent(0);
      }
      
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data. Please ensure the backend is running.');
      setTopStocks([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate chart data from top stocks (only real data, no fallback)
  const chartData = topStocks.length > 0 ? topStocks.map((stock, index) => ({
    name: stock.symbol,
    value: stock.predicted_price || stock.current_price || 0,
    confidence: (stock.confidence || 0) * 100,
    return: stock.predicted_return || 0,
  })) : [];

  // Calculate real stats from actual data
  const stats = [
    { 
      label: 'Portfolio Value', 
      value: `$${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: DollarSign, 
      change: dailyChangePercent >= 0 ? `+${dailyChangePercent.toFixed(2)}%` : `${dailyChangePercent.toFixed(2)}%`,
      changeColor: dailyChangePercent >= 0 ? 'text-green-400' : 'text-red-400',
      bgGradient: 'from-green-500/20 to-emerald-500/10'
    },
    { 
      label: 'Daily Change', 
      value: `$${dailyChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: Activity, 
      change: dailyChangePercent >= 0 ? `+${dailyChangePercent.toFixed(2)}%` : `${dailyChangePercent.toFixed(2)}%`,
      changeColor: dailyChange >= 0 ? 'text-green-400' : 'text-red-400',
      bgGradient: 'from-blue-500/20 to-cyan-500/10'
    },
    { 
      label: 'Total Gain', 
      value: `$${totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: TrendingUp, 
      change: totalGainPercent >= 0 ? `+${totalGainPercent.toFixed(2)}%` : `${totalGainPercent.toFixed(2)}%`,
      changeColor: totalGain >= 0 ? 'text-green-400' : 'text-red-400',
      bgGradient: 'from-purple-500/20 to-pink-500/10'
    },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 gradient-text">Dashboard</h1>
            <p className="text-gray-400 flex items-center gap-2">
              <span>Overview of your trading portfolio</span>
              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  • Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Health Status Banner */}
        {healthStatus && (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold">System Healthy</span>
              <span className="text-gray-400 text-sm">
                CPU: {healthStatus.system?.cpu_usage_percent?.toFixed(1) || 'N/A'}% • 
                Memory: {healthStatus.system?.memory_percent?.toFixed(1) || 'N/A'}%
              </span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading && topStocks.length === 0 ? (
            // Show skeleton loaders while loading
            [1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="bg-slate-800/80 rounded-xl p-6 border border-slate-700/50 animate-pulse"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-lg"></div>
                  <div className="w-16 h-6 bg-slate-700 rounded-md"></div>
                </div>
                <div className="w-24 h-4 bg-slate-700 rounded mb-2"></div>
                <div className="w-32 h-8 bg-slate-700 rounded"></div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className={`bg-gradient-to-br ${stat.bgGradient} rounded-xl p-6 border border-slate-700/50 card-hover shine relative overflow-hidden group`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className={`${stat.changeColor} text-sm font-semibold bg-white/5 px-2 py-1 rounded-md`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Performance Chart */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 card-hover">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Portfolio Performance
              </h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton h-12 w-full"></div>
                ))}
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1E293B', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                    labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Value']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
                <p className="text-gray-400">No data available</p>
                <p className="text-gray-500 text-sm mt-1">Predictions will appear here once available</p>
              </div>
            )}
          </div>

          {/* Top Performers */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 card-hover">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Top Performers
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="skeleton h-16 w-full rounded-lg"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={loadDashboardData}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-all hover:scale-105"
                >
                  Retry
                </button>
              </div>
            ) : topStocks.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {topStocks.map((stock, index) => {
                  const isPositive = (stock.predicted_return || 0) > 0;
                  const confidence = (stock.confidence || 0) * 100;
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg border border-slate-600/50 hover:border-blue-500/50 transition-all card-hover group"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${
                          stock.action === 'LONG' ? 'bg-green-500/20 border border-green-500/50' :
                          stock.action === 'SHORT' ? 'bg-red-500/20 border border-red-500/50' :
                          'bg-yellow-500/20 border border-yellow-500/50'
                        }`}>
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{stock.symbol}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              stock.action === 'LONG' ? 'bg-green-500/20 text-green-400' :
                              stock.action === 'SHORT' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {stock.action === 'LONG' ? 'BUY' : stock.action === 'SHORT' ? 'SELL' : stock.action || 'HOLD'}
                            </span>
                            {stock.horizon && (
                              <span className="text-xs text-gray-400 capitalize">{stock.horizon}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">
                          ${(stock.predicted_price || stock.current_price || 0).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 justify-end">
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${
                              confidence > 70 ? 'bg-green-400' :
                              confidence > 50 ? 'bg-yellow-400' :
                              'bg-red-400'
                            }`}></div>
                            <p className={`text-xs font-semibold ${
                              confidence > 70 ? 'text-green-400' :
                              confidence > 50 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {confidence.toFixed(0)}%
                            </p>
                          </div>
                        </div>
                        {stock.predicted_return !== undefined && (
                          <p className={`text-sm font-bold mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? <TrendingUp className="w-4 h-4 inline mr-1" /> : <TrendingDown className="w-4 h-4 inline mr-1" />}
                            {isPositive ? '+' : ''}{stock.predicted_return.toFixed(2)}%
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
                <p className="text-gray-400">No predictions available</p>
                <p className="text-gray-500 text-sm mt-1">Try refreshing or check your connection</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {topStocks.slice(0, 3).map((stock, index) => {
              const isPositive = (stock.predicted_return || 0) > 0;
              const actionType = stock.action === 'LONG' ? 'BUY' : stock.action === 'SHORT' ? 'SELL' : 'HOLD';
              return (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg border border-slate-600/50 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      stock.action === 'LONG' ? 'bg-green-500/20' :
                      stock.action === 'SHORT' ? 'bg-red-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      {stock.action === 'LONG' ? (
                        <TrendingUp className={`w-5 h-5 ${stock.action === 'LONG' ? 'text-green-400' : 'text-yellow-400'}`} />
                      ) : stock.action === 'SHORT' ? (
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      ) : (
                        <Activity className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {actionType} {stock.symbol}
                      </p>
                      <p className="text-gray-400 text-sm">
                        ${(stock.predicted_price || stock.current_price || 0).toFixed(2)} • 
                        Confidence: {((stock.confidence || 0) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {stock.predicted_return !== undefined && (
                      <span className={`font-bold text-lg ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{stock.predicted_return.toFixed(2)}%
                      </span>
                    )}
                    <p className="text-gray-400 text-xs mt-1">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              );
            })}
            {topStocks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;

