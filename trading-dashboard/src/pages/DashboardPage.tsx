import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { stockAPI } from '../services/api';
import { TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw, AlertCircle, Sparkles, Plus, X, Search, Loader2, Trash2 } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const DashboardPage = () => {
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [dailyChange, setDailyChange] = useState(0);
  const [dailyChangePercent, setDailyChangePercent] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [totalGainPercent, setTotalGainPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topStocks, setTopStocks] = useState<any[]>([]);
  const [userAddedTrades, setUserAddedTrades] = useState<any[]>([]);
  const [hiddenTrades, setHiddenTrades] = useState<string[]>([]);
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [addTradeSymbol, setAddTradeSymbol] = useState('');
  const [addTradeLoading, setAddTradeLoading] = useState(false);
  const [addTradeError, setAddTradeError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{symbol: string, isUserAdded: boolean} | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [previousPortfolioValue, setPreviousPortfolioValue] = useState<number | null>(null);

  // Load user-added trades and hidden trades from localStorage on mount
  useEffect(() => {
    const savedTrades = localStorage.getItem('userAddedTrades');
    if (savedTrades) {
      try {
        setUserAddedTrades(JSON.parse(savedTrades));
      } catch (err) {
        console.error('Failed to load user-added trades:', err);
      }
    }
    
    const savedHidden = localStorage.getItem('hiddenTrades');
    if (savedHidden) {
      try {
        setHiddenTrades(JSON.parse(savedHidden));
      } catch (err) {
        console.error('Failed to load hidden trades:', err);
      }
    }
  }, []);

  useEffect(() => {
    // Check connection first, then load data
    const checkAndLoad = async () => {
      try {
        const connectionCheck = await stockAPI.checkConnection();
        if (!connectionCheck.connected) {
          setError(connectionCheck.error || 'Backend server is not reachable');
          setLoading(false);
          return;
        } else {
          // Clear error if connection is successful
          setError((prevError) => {
            if (prevError && prevError.includes('Unable to connect')) {
              return null;
            }
            return prevError;
          });
        }
      } catch (err) {
        console.error('Connection check failed:', err);
        setError('Failed to check backend connection');
        setLoading(false);
        return;
      }
      
      // If connected, load data
      try {
        await Promise.all([loadDashboardData(), loadHealthStatus()]);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        // Don't set error here - let individual load functions handle errors
      }
    };
    
    checkAndLoad();
    
    // Refresh every 40 seconds
    const interval = setInterval(() => {
      checkAndLoad();
    }, 40000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run on mount

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
      // Use predict instead of scanAll - predict doesn't require authentication
      // and works better for dashboard display
      const response = await stockAPI.predict(symbols, 'intraday');
      
      // Check for errors in metadata
      if (response.metadata?.error) {
        throw new Error(response.metadata.error);
      }
      
      // Backend returns: { metadata, predictions }
      // Filter out predictions with errors
      const validPredictions = (response.predictions || []).filter((p: any) => !p.error);
      
      if (validPredictions.length > 0) {
        // Sort by confidence and take top performers
        const sorted = [...validPredictions]
          .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
          .slice(0, 6);
        setTopStocks(sorted);
      } else {
        setTopStocks([]);
        if (response.metadata?.count === 0 || validPredictions.length === 0) {
          // Check if there are predictions with errors (indicating training needed)
          const predictionsWithErrors = (response.predictions || []).filter((p: any) => p.error);
          if (predictionsWithErrors.length > 0 && predictionsWithErrors[0].error?.includes('training')) {
            setError('Models need to be trained. This may take 60-90 seconds per symbol. Use the Market Scan page to train models, or click Retry to attempt automatic training.');
          } else {
            setError('No predictions generated. The backend may be processing data or models may need training.');
          }
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

  // Save user-added trades to localStorage
  const saveUserAddedTrades = (trades: any[]) => {
    setUserAddedTrades(trades);
    localStorage.setItem('userAddedTrades', JSON.stringify(trades));
  };

  // Save hidden trades to localStorage
  const saveHiddenTrades = (symbols: string[]) => {
    setHiddenTrades(symbols);
    localStorage.setItem('hiddenTrades', JSON.stringify(symbols));
  };

  // Add trade to Top Performers
  const handleAddTrade = async () => {
    if (!addTradeSymbol || addTradeSymbol.trim() === '') {
      setAddTradeError('Please enter a symbol');
      return;
    }

    const symbol = addTradeSymbol.trim().toUpperCase();
    setAddTradeLoading(true);
    setAddTradeError(null);

    try {
      // Check if trade already exists
      const existingTrade = userAddedTrades.find(t => t.symbol === symbol);
      if (existingTrade) {
        setAddTradeError('This symbol is already in your Top Performers');
        setAddTradeLoading(false);
        return;
      }

      // Fetch prediction for the symbol
      const response = await stockAPI.predict([symbol], 'intraday');
      
      if (response.metadata?.error) {
        throw new Error(response.metadata.error);
      }

      const validPredictions = (response.predictions || []).filter((p: any) => !p.error);
      
      if (validPredictions.length === 0) {
        throw new Error(`No predictions found for "${symbol}". The symbol may not exist or models may need training.`);
      }

      const prediction = validPredictions[0];
      
      // Add to user-added trades
      const newTrade = {
        ...prediction,
        isUserAdded: true, // Mark as user-added
      };

      const updatedTrades = [...userAddedTrades, newTrade];
      saveUserAddedTrades(updatedTrades);

      // Close modal and reset
      setShowAddTradeModal(false);
      setAddTradeSymbol('');
      setAddTradeError(null);
    } catch (error: any) {
      console.error('Failed to add trade:', error);
      setAddTradeError(error.message || 'Failed to fetch prediction for this symbol');
    } finally {
      setAddTradeLoading(false);
    }
  };

  // Remove trade from Top Performers
  const handleRemoveTrade = (symbol: string, isUserAdded: boolean) => {
    if (isUserAdded) {
      // Remove from user-added trades (permanent deletion)
      const updatedTrades = userAddedTrades.filter(t => t.symbol !== symbol);
      saveUserAddedTrades(updatedTrades);
    } else {
      // Hide backend trade (temporary, can be restored by refreshing)
      const updatedHidden = [...hiddenTrades, symbol];
      saveHiddenTrades(updatedHidden);
    }
    setDeleteConfirm(null);
  };

  // Filter out hidden trades
  const visibleTopStocks = topStocks.filter(stock => !hiddenTrades.includes(stock.symbol));
  
  // Combine backend stocks and user-added trades
  const allTopStocks = [...visibleTopStocks, ...userAddedTrades];

  // Generate chart data from top stocks (only real data, no fallback)
  const chartData = allTopStocks.length > 0 ? allTopStocks.map((stock) => ({
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
      <div className="space-y-4 animate-fadeIn">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 gradient-text">Dashboard</h1>
            <p className="text-xs text-gray-400 flex items-center gap-2">
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Connection Error Banner */}
        {error && error.includes('Unable to connect to backend') && (
          <div className="bg-red-900/30 border-2 border-red-500/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 font-semibold mb-2">Backend Server Not Running</p>
                <p className="text-red-300 text-sm mb-3">{error}</p>
                <div className="bg-slate-800/50 rounded-lg p-3 mt-2">
                  <p className="text-gray-300 text-xs font-medium mb-1">To start the backend server:</p>
                  <code className="text-xs text-green-400 block bg-slate-900/50 p-2 rounded">
                    cd backend && python api_server.py
                  </code>
                  <p className="text-gray-400 text-xs mt-2">
                    Or use the startup script: <code className="text-yellow-400">START_BACKEND_WATCHDOG.bat</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Status Banner */}
        {healthStatus && !error && (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold text-sm">System Healthy</span>
              <span className="text-gray-400 text-xs">
                CPU: {healthStatus.system?.cpu_usage_percent?.toFixed(1) || 'N/A'}% • 
                Memory: {healthStatus.system?.memory_percent?.toFixed(1) || 'N/A'}%
              </span>
            </div>
          </div>
        )}

        {/* General Error Banner */}
        {error && !error.includes('Unable to connect to backend') && (
          <div className="bg-yellow-900/30 border-2 border-yellow-500/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-yellow-400 font-semibold mb-2">Warning</p>
                <p className="text-yellow-300 text-sm">{error}</p>
                <button
                  onClick={loadDashboardData}
                  className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-all hover:scale-105"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {loading && topStocks.length === 0 && !error ? (
            // Show skeleton loaders while loading (only if no error)
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
          ) : error && error.includes('Unable to connect to backend') ? (
            // Show empty state if backend is not connected
            [1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="bg-slate-800/80 rounded-xl p-6 border border-slate-700/50 opacity-50"
              >
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-sm">Backend not connected</p>
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.label} 
                  className={`bg-gradient-to-br ${stat.bgGradient} rounded-lg p-3 border border-slate-700/50 card-hover shine relative overflow-hidden group`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-white/5 rounded group-hover:bg-white/10 transition-colors">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className={`${stat.changeColor} text-xs font-semibold bg-white/5 px-1.5 py-0.5 rounded`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Portfolio Performance Chart */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50 card-hover">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
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
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50 card-hover">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Top Performers
              </h2>
              <button
                onClick={() => {
                  setShowAddTradeModal(true);
                  setAddTradeError(null);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold transition-all hover:scale-105"
                title="Add trade to Top Performers"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
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
            ) : allTopStocks.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                {allTopStocks.map((stock, index) => {
                  const isPositive = (stock.predicted_return || 0) > 0;
                  const confidence = (stock.confidence || 0) * 100;
                  const isUserAdded = stock.isUserAdded || false;
                  return (
                    <div 
                      key={`${stock.symbol}-${index}`} 
                      className="flex items-center justify-between p-2 bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded border border-slate-600/50 hover:border-blue-500/50 transition-all card-hover group"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-white text-xs ${
                          stock.action === 'LONG' ? 'bg-green-500/20 border border-green-500/50' :
                          stock.action === 'SHORT' ? 'bg-red-500/20 border border-red-500/50' :
                          'bg-yellow-500/20 border border-yellow-500/50'
                        }`}>
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-white font-bold text-sm">{stock.symbol}</p>
                            {isUserAdded && (
                              <span className="text-xs text-blue-400 bg-blue-500/20 px-1 py-0.5 rounded" title="User added">
                                ★
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
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
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-white font-bold text-sm">
                            ${(stock.predicted_price || stock.current_price || 0).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-1.5 justify-end">
                            <div className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${
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
                            <p className={`text-xs font-bold mt-0.5 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                              {isPositive ? <TrendingUp className="w-3 h-3 inline mr-0.5" /> : <TrendingDown className="w-3 h-3 inline mr-0.5" />}
                              {isPositive ? '+' : ''}{stock.predicted_return.toFixed(2)}%
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => setDeleteConfirm({ symbol: stock.symbol, isUserAdded })}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-all hover:scale-110 flex-shrink-0"
                          title={isUserAdded ? "Delete from Top Performers" : "Hide from Top Performers"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  {deleteConfirm.isUserAdded ? 'Delete Trade' : 'Hide Trade'}
                </h3>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300">
                  {deleteConfirm.isUserAdded 
                    ? `Are you sure you want to permanently delete "${deleteConfirm.symbol}" from Top Performers?`
                    : `Are you sure you want to hide "${deleteConfirm.symbol}" from Top Performers? It will reappear after refresh.`
                  }
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleRemoveTrade(deleteConfirm.symbol, deleteConfirm.isUserAdded)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all hover:scale-105"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{deleteConfirm.isUserAdded ? 'Delete' : 'Hide'}</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Trade Modal */}
        {showAddTradeModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-400" />
                  Add Trade to Top Performers
                </h3>
                <button
                  onClick={() => {
                    setShowAddTradeModal(false);
                    setAddTradeSymbol('');
                    setAddTradeError(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stock Symbol
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={addTradeSymbol}
                      onChange={(e) => {
                        setAddTradeSymbol(e.target.value.toUpperCase());
                        setAddTradeError(null);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !addTradeLoading) {
                          handleAddTrade();
                        }
                      }}
                      placeholder="e.g., AAPL, TSLA, GOOGL"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={addTradeLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Enter a stock symbol to fetch its prediction and add it to Top Performers
                  </p>
                </div>

                {addTradeError && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-300 text-sm">{addTradeError}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleAddTrade}
                    disabled={addTradeLoading || !addTradeSymbol.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {addTradeLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add Trade</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddTradeModal(false);
                      setAddTradeSymbol('');
                      setAddTradeError(null);
                    }}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Recent Activity
          </h2>
          <div className="space-y-2">
            {allTopStocks.slice(0, 3).map((stock, index) => {
              const isPositive = (stock.predicted_return || 0) > 0;
              const actionType = stock.action === 'LONG' ? 'BUY' : stock.action === 'SHORT' ? 'SELL' : 'HOLD';
              return (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded border border-slate-600/50 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${
                      stock.action === 'LONG' ? 'bg-green-500/20' :
                      stock.action === 'SHORT' ? 'bg-red-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      {stock.action === 'LONG' ? (
                        <TrendingUp className={`w-4 h-4 ${stock.action === 'LONG' ? 'text-green-400' : 'text-yellow-400'}`} />
                      ) : stock.action === 'SHORT' ? (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      ) : (
                        <Activity className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {actionType} {stock.symbol}
                      </p>
                      <p className="text-gray-400 text-xs">
                        ${(stock.predicted_price || stock.current_price || 0).toFixed(2)} • 
                        Confidence: {((stock.confidence || 0) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {stock.predicted_return !== undefined && (
                      <span className={`font-bold text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{stock.predicted_return.toFixed(2)}%
                      </span>
                    )}
                    <p className="text-gray-400 text-xs mt-0.5">{new Date().toLocaleTimeString()}</p>
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

