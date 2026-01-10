import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { stockAPI, TimeoutError, type PredictionItem } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Brain, Cpu, TrendingUp, Zap, BarChart3, Search } from 'lucide-react';
import { convertUSDToINR, formatINR } from '../utils/currency';
import MarketScanner from '../components/MarketScanner';
import { useTheme } from '../contexts/ThemeContext';

const AnalyticsPage = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [analytics, setAnalytics] = useState<{
    predictions: PredictionItem[];
    buyCount: number;
    sellCount: number;
    holdCount: number;
    avgConfidence: number;
    avgReturn: number;
    totalReturn: number;
    ensembleStats: { aligned: number; priceAgreement: number; totalPredictions: number };
    modelPerformance: Record<string, { count: number; avgReturn: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [features, setFeatures] = useState<Record<string, unknown> | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    loadAnalytics();
    // Refresh every 120 seconds (2 minutes) to reduce API calls and avoid rate limits
    const interval = setInterval(() => {
      loadAnalytics();
    }, 120000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA','RELIANCE.NS'];
      const response = await stockAPI.scanAll(symbols, 'intraday', 0.3);
      
      // Check for errors in metadata
      if (response.metadata?.error) {
        throw new Error(response.metadata.error);
      }
      
      // Backend returns: { metadata, shortlist, all_predictions }
      // Filter out predictions with errors
      const allPredictions = response.all_predictions || response.shortlist || [];
      const predictions = allPredictions.filter((p: PredictionItem) => !p.error);
      
      // Process analytics data - backend uses LONG/SHORT/HOLD
      const buyCount = predictions.filter((p: PredictionItem) => p.action === 'LONG').length;
      const sellCount = predictions.filter((p: PredictionItem) => p.action === 'SHORT').length;
      const holdCount = predictions.filter((p: PredictionItem) => p.action === 'HOLD').length;
      
      // Calculate additional analytics
      const totalReturn = predictions.reduce((sum: number, p: PredictionItem) => sum + (p.predicted_return || 0), 0);
      const avgReturn = predictions.length > 0 ? totalReturn / predictions.length : 0;
      
      // Extract ensemble details
      const ensembleStats = {
        aligned: predictions.filter((p: PredictionItem) => p.ensemble_details?.models_align).length,
        priceAgreement: predictions.filter((p: PredictionItem) => p.ensemble_details?.price_agreement).length,
        totalPredictions: predictions.length
      };
      
      // Extract individual model performance
      const modelPerformance: any = {
        random_forest: { count: 0, avgReturn: 0 },
        lightgbm: { count: 0, avgReturn: 0 },
        xgboost: { count: 0, avgReturn: 0 },
        dqn: { count: 0, avgReturn: 0 }
      };
      
      predictions.forEach((p: PredictionItem) => {
        const ind = p.individual_predictions || {};
        if (ind.random_forest) {
          modelPerformance.random_forest.count++;
          modelPerformance.random_forest.avgReturn += (ind.random_forest as any)?.return || 0;
        }
        if (ind.lightgbm) {
          modelPerformance.lightgbm.count++;
          modelPerformance.lightgbm.avgReturn += (ind.lightgbm as any)?.return || 0;
        }
        if (ind.xgboost) {
          modelPerformance.xgboost.count++;
          modelPerformance.xgboost.avgReturn += (ind.xgboost as any)?.return || 0;
        }
        if (ind.dqn) {
          modelPerformance.dqn.count++;
        }
      });
      
      Object.keys(modelPerformance).forEach(key => {
        if (modelPerformance[key].count > 0) {
          modelPerformance[key].avgReturn = modelPerformance[key].avgReturn / modelPerformance[key].count;
        }
      });
      
      setAnalytics({
        predictions,
        buyCount,
        sellCount,
        holdCount,
        avgConfidence: predictions.length > 0 
          ? predictions.reduce((sum: number, p: PredictionItem) => sum + (p.confidence || 0), 0) / predictions.length 
          : 0,
        avgReturn,
        totalReturn,
        ensembleStats,
        modelPerformance
      });
      
      // Load features for first prediction if available
      if (predictions.length > 0 && !selectedSymbol) {
        loadFeaturesForSymbol(predictions[0].symbol);
      }
      setLoading(false);
      setError(null);
    } catch (error: unknown) {
      // Handle TimeoutError - backend is still processing
      if (error instanceof TimeoutError) {
        // Keep loading state active, don't show error
        console.log('AnalyticsPage: Request timed out but backend is still processing');
        // Don't clear loading - backend is still working
        return;
      }
      
      // Handle actual errors
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to load analytics:', err);
      setAnalytics(null);
      setError(err.message || 'Failed to load analytics');
      setLoading(false);
    }
  };

  const loadFeaturesForSymbol = async (symbol: string) => {
    try {
      setSelectedSymbol(symbol);
      const response = await stockAPI.fetchData([symbol], '2y', true);
      if (response.data && response.data[symbol] && response.data[symbol].features) {
        setFeatures(response.data[symbol].features);
      }
    } catch (error) {
      console.error('Failed to load features:', error);
    }
  };

  // Only use real data, no mock fallback
  const performanceData = analytics?.predictions
    ? analytics.predictions.slice(0, 10).map((p: any) => ({
        name: p.symbol || 'N/A',
        value: p.predicted_return || 0,
        confidence: (p.confidence || 0) * 100,
        price: p.predicted_price || p.current_price || 0
      }))
    : [];

  const pieData = analytics
    ? [
        { name: 'Buy', value: analytics.buyCount, color: '#10B981' },
        { name: 'Sell', value: analytics.sellCount, color: '#EF4444' },
        { name: 'Hold', value: analytics.holdCount, color: '#F59E0B' },
      ]
    : [];

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'} mb-1`}>Analytics</h1>
            <p className={isLight ? 'text-gray-600' : 'text-gray-400'}>Detailed analysis and insights</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {showScanner ? 'Hide Scanner' : 'Market Scanner'}
            </button>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className={`px-4 py-2 ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900' : 'bg-slate-700 border-slate-600 text-white'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className={`text-center py-8 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Loading analytics...</div>
        ) : error ? (
          <div className={`${isLight ? 'bg-red-50 border-red-300 text-red-700' : 'bg-red-900 border-red-700 text-red-200'} border rounded-lg p-4`}>
            <p className="font-semibold mb-1">Error Loading Analytics</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* Market Scanner */}
            {showScanner && (
              <MarketScanner onClose={() => setShowScanner(false)} />
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className={`${isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-slate-800/50 border border-slate-700/50'} rounded-lg p-3`}>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs mb-1`}>Total Predictions</p>
                <p className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{analytics?.predictions?.length || 0}</p>
              </div>
              <div className={`${isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-slate-800/50 border border-slate-700/50'} rounded-lg p-3`}>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs mb-1`}>Buy Signals</p>
                <p className="text-xl font-bold text-green-400">{analytics?.buyCount || 0}</p>
              </div>
              <div className={`${isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-slate-800/50 border border-slate-700/50'} rounded-lg p-3`}>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs mb-1`}>Sell Signals</p>
                <p className="text-xl font-bold text-red-400">{analytics?.sellCount || 0}</p>
              </div>
              <div className={`${isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-slate-800/50 border border-slate-700/50'} rounded-lg p-3`}>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs mb-1`}>Avg Confidence</p>
                <p className="text-xl font-bold text-blue-400">
                  {analytics ? (analytics.avgConfidence * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} rounded-lg p-3 border`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'} flex items-center gap-2`}>
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Performance Trend
                  </h2>
                  <div className={`flex gap-2 ${isLight ? 'bg-gray-100' : 'bg-slate-700'} rounded-lg p-1`}>
                    <button
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        chartType === 'bar' 
                          ? 'bg-blue-500 text-white' 
                          : isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Bar
                    </button>
                    <button
                      onClick={() => setChartType('line')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        chartType === 'line' 
                          ? 'bg-blue-500 text-white' 
                          : isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Line
                    </button>
                    <button
                      onClick={() => setChartType('area')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        chartType === 'area' 
                          ? 'bg-blue-500 text-white' 
                          : isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Area
                    </button>
                  </div>
                </div>
                {performanceData.length > 0 ? (
                  <div style={{ width: '100%', height: 300, minWidth: 0, minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height={300} minWidth={0}>
                    {chartType === 'bar' ? (
                      <BarChart data={performanceData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E5E7EB' : '#374151'} horizontal={true} vertical={false} />
                        <XAxis 
                          type="number" 
                          stroke={isLight ? '#6B7280' : '#9CA3AF'} 
                          tick={{ fill: isLight ? '#6B7280' : '#9CA3AF', fontSize: 12 }}
                          tickFormatter={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          stroke={isLight ? '#6B7280' : '#9CA3AF'} 
                          tick={{ fill: isLight ? '#6B7280' : '#9CA3AF', fontSize: 12 }}
                          width={80}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isLight ? '#FFFFFF' : '#1E293B', 
                            border: isLight ? '1px solid #D1D5DB' : '1px solid #475569',
                            borderRadius: '8px',
                            padding: '12px'
                          }}
                          labelStyle={{ color: isLight ? '#111827' : '#E2E8F0', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${value >= 0 ? '+' : ''}${value.toFixed(2)}%`, 'Return']}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[0, 8, 8, 0]}
                        >
                          {performanceData.map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.value >= 0 ? '#10B981' : '#EF4444'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : chartType === 'line' ? (
                      <LineChart data={performanceData}>
                        <defs>
                          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E5E7EB' : '#374151'} />
                        <XAxis 
                          dataKey="name" 
                          stroke={isLight ? '#6B7280' : '#9CA3AF'} 
                          tick={{ fill: isLight ? '#6B7280' : '#9CA3AF', fontSize: 12 }}
                        />
                        <YAxis 
                          stroke={isLight ? '#6B7280' : '#9CA3AF'}
                          tick={{ fill: isLight ? '#6B7280' : '#9CA3AF', fontSize: 12 }}
                          tickFormatter={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isLight ? '#FFFFFF' : '#1E293B', 
                            border: isLight ? '1px solid #D1D5DB' : '1px solid #475569',
                            borderRadius: '8px',
                            padding: '12px'
                          }}
                          labelStyle={{ color: isLight ? '#111827' : '#E2E8F0', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${value >= 0 ? '+' : ''}${value.toFixed(2)}%`, 'Return']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    ) : (
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E5E7EB' : '#374151'} />
                        <XAxis 
                          dataKey="name" 
                          stroke={isLight ? '#6B7280' : '#9CA3AF'} 
                          tick={{ fill: isLight ? '#6B7280' : '#9CA3AF', fontSize: 12 }}
                        />
                        <YAxis 
                          stroke={isLight ? '#6B7280' : '#9CA3AF'}
                          tick={{ fill: isLight ? '#6B7280' : '#9CA3AF', fontSize: 12 }}
                          tickFormatter={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isLight ? '#FFFFFF' : '#1E293B', 
                            border: isLight ? '1px solid #D1D5DB' : '1px solid #475569',
                            borderRadius: '8px',
                            padding: '12px'
                          }}
                          labelStyle={{ color: isLight ? '#111827' : '#E2E8F0', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${value >= 0 ? '+' : ''}${value.toFixed(2)}%`, 'Return']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          fill="url(#areaGradient)"
                        />
                      </AreaChart>
                    )}
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className={`flex items-center justify-center h-[300px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No performance data available</p>
                    </div>
                  </div>
                )}
              </div>

              <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} rounded-lg p-6 border`}>
                <h2 className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'} mb-4 flex items-center gap-2`}>
                  <Brain className="w-5 h-5 text-purple-400" />
                  Signal Distribution
                </h2>
                {pieData.length > 0 && pieData.some(d => d.value > 0) ? (
                  <div className="flex flex-col items-center" style={{ width: '100%', minWidth: 0 }}>
                    <div style={{ width: '100%', height: 250, minWidth: 0, minHeight: 250 }}>
                      <ResponsiveContainer width="100%" height={250} minWidth={0}>
                      <PieChart>
                        <Pie
                          data={pieData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent, value }) => 
                            value > 0 && percent !== undefined ? `${name}\n${(percent * 100).toFixed(0)}%` : ''
                          }
                          outerRadius={90}
                          innerRadius={40}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {pieData.filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isLight ? '#FFFFFF' : '#1E293B', 
                            border: isLight ? '1px solid #D1D5DB' : '1px solid #475569',
                            borderRadius: '8px',
                            padding: '12px'
                          }}
                          formatter={(value: any) => [value, 'Signals']}
                        />
                      </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-4">
                      {pieData.filter(d => d.value > 0).map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          ></div>
                          <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                            {entry.name}: {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`flex items-center justify-center h-[300px] ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    <div className="text-center">
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No signal data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} rounded-lg p-6 border`}>
              <h2 className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'} mb-4`}>Top Predictions</h2>
              <div className="space-y-3">
                {analytics?.predictions?.slice(0, 5).map((pred: PredictionItem, index: number) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 ${isLight ? 'bg-gray-50 hover:bg-gray-100' : 'bg-slate-700 hover:bg-slate-600'} rounded-lg transition-colors cursor-pointer`}
                    onClick={() => loadFeaturesForSymbol(pred.symbol)}
                  >
                    <div>
                      <p className={`${isLight ? 'text-gray-900' : 'text-white'} font-semibold`}>{pred.symbol}</p>
                      <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-sm`}>
                        {pred.action === 'LONG' ? 'BUY' : pred.action === 'SHORT' ? 'SELL' : pred.action || 'HOLD'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`${isLight ? 'text-gray-900' : 'text-white'} font-semibold`}>
                        {formatINR(convertUSDToINR(pred.predicted_price || pred.current_price || 0))}
                      </p>
                      <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-sm`}>
                        {((pred.confidence || 0) * 100).toFixed(1)}% confidence
                      </p>
                      {pred.predicted_return !== undefined && (
                        <p className={`text-xs ${pred.predicted_return > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pred.predicted_return > 0 ? '+' : ''}{pred.predicted_return.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ensemble Statistics */}
            {analytics?.ensembleStats && (
              <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} rounded-lg p-6 border`}>
                <h2 className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'} mb-4 flex items-center gap-2`}>
                  <Brain className="w-5 h-5 text-purple-400" />
                  Ensemble Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`${isLight ? 'bg-gray-50' : 'bg-slate-700/50'} rounded-lg p-4`}>
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-sm mb-1`}>Models Aligned</p>
                    <p className="text-2xl font-bold text-green-400">
                      {analytics.ensembleStats.aligned}/{analytics.ensembleStats.totalPredictions}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((analytics.ensembleStats.aligned / analytics.ensembleStats.totalPredictions) * 100).toFixed(1)}% agreement
                    </p>
                  </div>
                  <div className={`${isLight ? 'bg-gray-50' : 'bg-slate-700/50'} rounded-lg p-4`}>
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-sm mb-1`}>Price Agreement</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {analytics.ensembleStats.priceAgreement}/{analytics.ensembleStats.totalPredictions}
                    </p>
                    <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      {((analytics.ensembleStats.priceAgreement / analytics.ensembleStats.totalPredictions) * 100).toFixed(1)}% consensus
                    </p>
                  </div>
                  <div className={`${isLight ? 'bg-gray-50' : 'bg-slate-700/50'} rounded-lg p-4`}>
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-sm mb-1`}>Average Return</p>
                    <p className={`text-2xl font-bold ${analytics.avgReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {analytics.avgReturn >= 0 ? '+' : ''}{analytics.avgReturn.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Across all predictions</p>
                  </div>
                </div>
              </div>
            )}

            {/* Model Performance Comparison */}
            {analytics?.modelPerformance && (
              <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} rounded-lg p-6 border`}>
                <h2 className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'} mb-4 flex items-center gap-2`}>
                  <Cpu className="w-5 h-5 text-blue-400" />
                  Individual Model Performance
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(analytics.modelPerformance).map(([model, stats]: [string, any]) => (
                    <div key={model} className={`${isLight ? 'bg-gray-50' : 'bg-slate-700/50'} rounded-lg p-4`}>
                      <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs mb-2 capitalize`}>{model.replace('_', ' ')}</p>
                      <p className={`${isLight ? 'text-gray-900' : 'text-white'} font-semibold text-lg`}>{stats.count} predictions</p>
                      {stats.avgReturn !== undefined && (
                        <p className={`text-sm font-medium mt-1 ${stats.avgReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stats.avgReturn >= 0 ? '+' : ''}{stats.avgReturn.toFixed(2)}% avg
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features Display */}
            {features && selectedSymbol && (
              <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} rounded-lg p-6 border`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'} flex items-center gap-2`}>
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Technical Features - {selectedSymbol}
                  </h2>
                  <button
                    onClick={() => {
                      setFeatures(null);
                      setSelectedSymbol(null);
                    }}
                    className={`${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'} text-sm`}
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                  {Object.entries(features).slice(0, 50).map(([key, value]: [string, any]) => (
                    <div key={key} className={`${isLight ? 'bg-gray-50' : 'bg-slate-700/50'} rounded p-3`}>
                      <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'} mb-1 truncate`}>{key}</p>
                      <p className={`text-sm ${isLight ? 'text-gray-900' : 'text-white'} font-medium`}>
                        {typeof value === 'number' ? value.toFixed(4) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
                {Object.keys(features).length > 50 && (
                  <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-500'} mt-3 text-center`}>
                    Showing 50 of {Object.keys(features).length} features
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AnalyticsPage;

