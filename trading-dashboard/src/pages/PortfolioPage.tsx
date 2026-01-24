import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { TrendingUp, TrendingDown, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { stockAPI, TimeoutError, type PredictionItem } from '../services/api';
import { riskAPI, tradeAPI } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { formatUSDToINR } from '../utils/currencyConverter';
import { Holding } from '../types';

const PortfolioPage = () => {
  const { showNotification } = useNotification();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPosition, setNewPosition] = useState({ symbol: '', shares: 0, avgPrice: 0 });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Risk assessment state
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [riskChecking, setRiskChecking] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);
  const [pendingTrade, setPendingTrade] = useState<any>(null);

  // Available stocks list - US + Indian stocks
  const availableStocks = [
    // US Stocks
    'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'META', 'AMZN', 'NVDA', 'AMD', 'INTC', 'NFLX',
    'IBM', 'ORACLE', 'CISCO', 'UBER', 'COIN', 'PYPL', 'SHOP', 'SQ', 'DDOG', 'NET',
    // Indian Stocks - Banking & Finance
    'SBIN.NS', 'AXISBANK.NS', 'ICICIBANK.NS', 'KOTAKBANK.NS', 'HDFC.NS', 'BAJAJFINSV.NS',
    // Indian Stocks - IT & Tech
    'TCS.NS', 'INFY.NS', 'WIPRO.NS', 'HCLTECH.NS', 'TECHM.NS',
    // Indian Stocks - Automobiles
    'TATAMOTORS.NS', 'M&M.NS', 'MARUTI.NS', 'BAJAJ-AUTO.NS', 'EICHERMOT.NS',
    // Indian Stocks - Steel & Metal
    'TATASTEEL.NS', 'JSWSTEEL.NS', 'HINDALCO.NS', 'NMDC.NS',
    // Indian Stocks - Energy
    'GAIL.NS', 'POWERGRID.NS', 'NTPC.NS', 'COAL.NS', 'BPCL.NS',
    // Indian Stocks - Infrastructure & Transport
    'ADANIPORTS.NS', 'ADANIGREEN.NS', 'ADANITRANS.NS', 'LT.NS',
    // Indian Stocks - Consumer & Others
    'ASIANPAINT.NS', 'ULTRACEMCO.NS', 'SUNPHARMA.NS', 'NESTLEIND.NS', 'BRITANNIA.NS',
    'HINDUNILVR.NS', 'ITC.NS'
  ];

  const handleSymbolInput = (value: string) => {
    const upperValue = value.toUpperCase();
    setNewPosition({ ...newPosition, symbol: upperValue });
    
    // Filter suggestions based on input
    if (upperValue.length > 0) {
      const filtered = availableStocks.filter(stock => 
        stock.includes(upperValue)
      );
      setSuggestions(filtered.slice(0, 6)); // Show max 6 suggestions
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (symbol: string) => {
    setNewPosition({ ...newPosition, symbol });
    setSuggestions([]);
  };

  useEffect(() => {
    loadPortfolio();
    // Refresh every 120 seconds (2 minutes) to reduce API calls and avoid rate limits
    const interval = setInterval(() => {
      loadPortfolio();
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      // Load holdings from localStorage (user-managed portfolio)
      const savedHoldings = localStorage.getItem('portfolio_holdings');
      let userHoldings: Holding[] = savedHoldings ? JSON.parse(savedHoldings) : [];
      
      // If no holdings, show empty state
      if (userHoldings.length === 0) {
        setHoldings([]);
        setTotalValue(0);
        setTotalGain(0);
        setLoading(false);
        return;
      }
      
      // Fetch real-time prices from backend
      const symbols = userHoldings.map(h => h.symbol);
      
      try {
        const response = await stockAPI.predict(symbols, 'intraday');
        
        // Check for errors in metadata
        if (response.metadata?.error) {
          throw new Error(response.metadata.error);
        }
        
        if (response.predictions) {
          // Filter out predictions with errors and map to holdings
          const validPredictions = response.predictions.filter((p: PredictionItem) => !p.error);
          
          // Update holdings with real-time prices
          const updatedHoldings = userHoldings.map((holding) => {
            const prediction = validPredictions.find((p: PredictionItem) => p.symbol === holding.symbol);
            if (prediction) {
              const currentPrice = prediction.predicted_price || prediction.current_price || holding.avgPrice;
              return {
                ...holding,
                currentPrice: currentPrice,
                value: holding.shares * currentPrice,
              };
            }
            // If no prediction available, use stored price
            return {
              ...holding,
              currentPrice: holding.currentPrice || holding.avgPrice,
              value: holding.shares * (holding.currentPrice || holding.avgPrice),
            };
          });
          
          setHoldings(updatedHoldings);
          
          // Calculate totals using real prices
          const total = updatedHoldings.reduce((sum, h) => sum + h.value, 0);
          const gain = updatedHoldings.reduce((sum, h) => sum + (h.currentPrice - h.avgPrice) * h.shares, 0);
          setTotalValue(total);
          setTotalGain(gain);
        } else {
          // No predictions, use stored data
          setHoldings(userHoldings);
          const total = userHoldings.reduce((sum, h) => sum + (h.value || h.shares * (h.currentPrice || h.avgPrice)), 0);
          const gain = userHoldings.reduce((sum, h) => sum + (h.currentPrice - h.avgPrice) * h.shares, 0);
          setTotalValue(total);
          setTotalGain(gain);
        }
      } catch (apiError: unknown) {
        // Handle TimeoutError - backend is still processing
        if (apiError instanceof TimeoutError) {
          // Keep loading state active, use stored holdings for now
          console.log('PortfolioPage: Request timed out but backend is still processing');
          setHoldings(userHoldings);
          const total = userHoldings.reduce((sum, h) => sum + (h.value || h.shares * (h.currentPrice || h.avgPrice)), 0);
          const gain = userHoldings.reduce((sum, h) => sum + (h.currentPrice - h.avgPrice) * h.shares, 0);
          setTotalValue(total);
          setTotalGain(gain);
          // Don't clear loading - backend is still working
          return;
        }
        
        // Handle actual errors - use stored holdings without price updates
        console.error('Failed to fetch real-time prices:', apiError);
        setHoldings(userHoldings);
        const total = userHoldings.reduce((sum, h) => sum + (h.value || h.shares * (h.currentPrice || h.avgPrice)), 0);
        const gain = userHoldings.reduce((sum, h) => sum + (h.currentPrice - h.avgPrice) * h.shares, 0);
        setTotalValue(total);
        setTotalGain(gain);
      }
      setLoading(false);
    } catch (error: unknown) {
      console.error('Failed to load portfolio:', error);
      setHoldings([]);
      setTotalValue(0);
      setTotalGain(0);
      setLoading(false);
    }
  };

  const calculateGain = (holding: Holding) => {
    const gain = (holding.currentPrice - holding.avgPrice) * holding.shares;
    const gainPercent = ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
    return { gain, gainPercent };
  };

  const addPosition = async () => {
    if (newPosition.symbol && newPosition.shares > 0 && newPosition.avgPrice > 0) {
      // Fetch current price from backend
      let currentPrice = newPosition.avgPrice;
      try {
        const response = await stockAPI.predict([newPosition.symbol], 'intraday');
        if (response.predictions && response.predictions.length > 0) {
          const prediction = response.predictions.find((p: PredictionItem) => !p.error);
          if (prediction) {
            currentPrice = prediction.predicted_price || prediction.current_price || newPosition.avgPrice;
          }
        }
      } catch (error) {
        console.warn('Failed to fetch current price, using average price:', error);
      }
      
      const holding = {
        symbol: newPosition.symbol.toUpperCase(),
        shares: newPosition.shares,
        avgPrice: newPosition.avgPrice,
        currentPrice: currentPrice,
        value: newPosition.shares * currentPrice,
      };
      
      // Save to localStorage
      const updatedHoldings = [...holdings, holding];
      localStorage.setItem('portfolio_holdings', JSON.stringify(updatedHoldings));
      setHoldings(updatedHoldings);
      setNewPosition({ symbol: '', shares: 0, avgPrice: 0 });
      setShowAddModal(false);
      
      // Update totals
      const total = updatedHoldings.reduce((sum, h) => sum + h.value, 0);
      const gain = updatedHoldings.reduce((sum, h) => sum + (h.currentPrice - h.avgPrice) * h.shares, 0);
      setTotalValue(total);
      setTotalGain(gain);
    }
  };

  const removePosition = (index: number) => {
    const newHoldings = holdings.filter((_, i) => i !== index);
    // Save to localStorage
    localStorage.setItem('portfolio_holdings', JSON.stringify(newHoldings));
    setHoldings(newHoldings);
    // Update totals
    const total = newHoldings.reduce((sum, h) => sum + h.value, 0);
    const gain = newHoldings.reduce((sum, h) => sum + (h.currentPrice - h.avgPrice) * h.shares, 0);
    setTotalValue(total);
    setTotalGain(gain);
  };

  // Assess risk before executing trade
  const handleAssessRisk = async (holding: any, action: 'BUY' | 'SELL') => {
    setRiskChecking(true);
    setRiskError(null);
    setPendingTrade({ holding, action });
    
    try {
      // Calculate stop-loss (assume 5% below entry for risk assessment)
      const stopLoss = holding.currentPrice * (action === 'BUY' ? 0.95 : 1.05);
      
      // Call risk assessment endpoint
      const riskResult = await riskAPI.assess(
        holding.symbol,
        holding.shares,
        holding.currentPrice,
        stopLoss,
        1.0 // 1% capital at risk
      );
      
      setRiskAssessment(riskResult);
      setShowRiskModal(true);
      
      // Check if risk is acceptable
      const riskScore = riskResult.risk_score || 0;
      if (riskScore > 5) {
        // High risk - show warning but allow confirmation
        showNotification('warning', 'High Risk', `Risk score: ${riskScore.toFixed(1)}. Proceed with caution.`);
      } else {
        showNotification('success', 'Risk OK', `Risk score: ${riskScore.toFixed(1)}. Safe to proceed.`);
      }
    } catch (error: any) {
      const msg = error.message || 'Failed to assess risk';
      setRiskError(msg);
      showNotification('error', 'Risk Assessment Failed', msg);
      setRiskChecking(false);
    }
  };

  // Execute trade after confirmation
  const handleExecuteTrade = async () => {
    if (!pendingTrade) return;
    
    const { holding, action } = pendingTrade;
    setRiskChecking(true);
    
    try {
      // Check if risk is too high (> 5%)
      if (riskAssessment?.risk_score > 5) {
        // Block trade if risk too high
        const msg = `Trade blocked: Risk score ${riskAssessment.risk_score.toFixed(1)} exceeds maximum of 5%.`;
        showNotification('error', 'Trade Blocked', msg);
        setRiskChecking(false);
        setShowConfirmModal(false);
        setShowRiskModal(false);
        return;
      }
      
      // Execute trade
      const stopLoss = holding.currentPrice * (action === 'BUY' ? 0.95 : 1.05);
      const tradeResult = await tradeAPI.execute(
        holding.symbol,
        action,
        holding.shares,
        holding.currentPrice,
        stopLoss
      );
      
      if (tradeResult.success) {
        showNotification('success', `Trade ${action === 'BUY' ? 'Executed' : 'Closed'}`, 
          `${holding.symbol} ${action} order placed. ID: ${tradeResult.order_id || 'pending'}`);
        
        // Close modals
        setShowConfirmModal(false);
        setShowRiskModal(false);
        setPendingTrade(null);
        setRiskAssessment(null);
      } else {
        throw new Error(tradeResult.message || 'Trade execution failed');
      }
    } catch (error: any) {
      const msg = error.message || 'Failed to execute trade';
      showNotification('error', 'Trade Failed', msg);
    } finally {
      setRiskChecking(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">Portfolio</h1>
            <p className="text-gray-400 text-xs">Manage your holdings</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Position</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-gray-400 text-xs mb-1">Total Value</p>
            <p className="text-xl font-bold text-white">{formatUSDToINR(totalValue)}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-gray-400 text-xs mb-1">Total Gain/Loss</p>
            <p className={`text-xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}{formatUSDToINR(totalGain)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-gray-400 text-xs mb-1">Holdings</p>
            <p className="text-xl font-bold text-white">{holdings.length}</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-3 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-white">Holdings</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Symbol</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Shares</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Avg Price</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Current Price</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Value</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Gain/Loss</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {holdings.map((holding, index) => {
                    const { gain, gainPercent } = calculateGain(holding);
                    return (
                      <tr key={index} className="hover:bg-slate-700/50">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="text-white font-semibold">{holding.symbol}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{holding.shares}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">${holding.avgPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">${holding.currentPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">{formatUSDToINR(holding.value)}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {gain >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <span className={gain >= 0 ? 'text-green-400' : 'text-red-400'}>
                              ${gain.toFixed(2)} ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleAssessRisk(holding, 'BUY')}
                              disabled={riskChecking}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white text-sm rounded transition-colors"
                            >
                              Buy
                            </button>
                            <button 
                              onClick={() => handleAssessRisk(holding, 'SELL')}
                              disabled={riskChecking}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white text-sm rounded transition-colors"
                            >
                              Sell
                            </button>
                            <button 
                              onClick={() => removePosition(index)}
                              className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">No holdings found</div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-white mb-4">Add Position</h3>
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
                  <input
                    type="text"
                    value={newPosition.symbol}
                    onChange={(e) => handleSymbolInput(e.target.value)}
                    placeholder="e.g., AAPL, TCS.NS"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {/* Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10">
                      {suggestions.map((stock) => (
                        <button
                          key={stock}
                          type="button"
                          onClick={() => handleSelectSuggestion(stock)}
                          className="w-full px-4 py-2 text-left text-white hover:bg-slate-600 transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-slate-600 last:border-b-0"
                        >
                          {stock}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Shares</label>
                  <input
                    type="number"
                    value={newPosition.shares || ''}
                    onChange={(e) => setNewPosition({ ...newPosition, shares: parseFloat(e.target.value) || 0 })}
                    placeholder="Number of shares"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Average Price</label>
                  <input
                    type="number"
                    value={newPosition.avgPrice || ''}
                    onChange={(e) => setNewPosition({ ...newPosition, avgPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="Purchase price per share"
                    step="0.01"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={addPosition}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewPosition({ symbol: '', shares: 0, avgPrice: 0 });
                    }}
                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Assessment Modal */}
        {showRiskModal && riskAssessment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                {riskAssessment.risk_score > 5 ? (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
                <h3 className="text-xl font-semibold text-white">
                  Risk Assessment
                </h3>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-gray-300 text-sm mb-1">Risk Score</p>
                  <p className={`text-2xl font-bold ${
                    riskAssessment.risk_score > 5 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {riskAssessment.risk_score.toFixed(1)} / 10
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    {riskAssessment.risk_level || 'Medium Risk'}
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-gray-300 text-sm mb-2">Recommendation</p>
                  <p className="text-white text-sm">
                    {riskAssessment.recommendation || 'Proceed with caution'}
                  </p>
                </div>

                {riskAssessment.risk_score > 5 && (
                  <div className="bg-red-900/30 border border-red-800 rounded-lg p-3">
                    <p className="text-red-200 text-sm">
                      ⚠️ High Risk Alert: Risk score exceeds 5%. Confirm to proceed or cancel.
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={riskChecking}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg font-semibold"
                  >
                    {riskChecking ? 'Processing...' : 'Proceed to Confirm'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRiskModal(false);
                      setPendingTrade(null);
                      setRiskAssessment(null);
                    }}
                    disabled={riskChecking}
                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-500 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trade Confirmation Modal */}
        {showConfirmModal && pendingTrade && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 max-w-md w-full">
              <h3 className="text-xl font-semibold text-white mb-4">
                Confirm {pendingTrade.action === 'BUY' ? 'Buy' : 'Sell'} Order
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Symbol:</span>
                  <span className="text-white font-semibold">{pendingTrade.holding.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Action:</span>
                  <span className={`font-semibold ${
                    pendingTrade.action === 'BUY' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {pendingTrade.action}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Quantity:</span>
                  <span className="text-white">{pendingTrade.holding.shares} shares</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Price:</span>
                  <span className="text-white">${pendingTrade.holding.currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-3">
                  <span className="text-gray-300 font-semibold">Total:</span>
                  <span className="text-white font-bold">
                    ${(pendingTrade.holding.shares * pendingTrade.holding.currentPrice).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-3 mb-4">
                <p className="text-yellow-200 text-sm">
                  📋 Please review the order details carefully before confirming.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleExecuteTrade}
                  disabled={riskChecking}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-lg font-semibold"
                >
                  {riskChecking ? 'Executing...' : 'Confirm & Execute'}
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setShowRiskModal(true);
                  }}
                  disabled={riskChecking}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-500 text-white rounded-lg"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PortfolioPage;

