import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { TrendingUp, TrendingDown, Plus, AlertTriangle, Shield } from 'lucide-react';
import { stockAPI, riskAPI, TimeoutError, type PredictionItem } from '../services/api';
import { formatUSDToINR } from '../utils/currencyConverter';
import { useTheme } from '../contexts/ThemeContext';
import { getRefreshInterval } from '../utils/marketHours';
import { type Holding, type Transaction } from '../types';
import {
  calculatePortfolioValue,
  calculatePortfolioGain,
  getPortfolioHoldings
} from '../utils/portfolioCalculations';

const PortfolioPage = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isSpace = theme === 'space';
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPosition, setNewPosition] = useState({ symbol: '', shares: 0, avgPrice: 0 });
  const [isAddingToExisting, setIsAddingToExisting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(-1); // For arrow key navigation
  const [riskLevels, setRiskLevels] = useState<{[key: string]: number}>({}); // Store risk levels by symbol
  const [stopLosses, setStopLosses] = useState<{[key: string]: number}>({}); // Store stop losses by symbol
  const [riskAssessment, setRiskAssessment] = useState<{[key: string]: string}>({}); // Store risk assessment by symbol
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskModalSymbol, setRiskModalSymbol] = useState('');
  
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddModal) {
        setShowAddModal(false);
        setNewPosition({ symbol: '', shares: 0, avgPrice: 0 });
      }
    };
    
    if (showAddModal) {
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [showAddModal]);

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
        stock.toUpperCase().includes(upperValue)
      );
      setSuggestions(filtered.slice(0, 6)); // Show max 6 suggestions
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (symbol: string) => {
    setNewPosition({ ...newPosition, symbol });
    setSuggestions([]);
    setSuggestionIndex(-1);
  };

  // Load user-added trades and portfolio holdings from localStorage on mount
  useEffect(() => {
    // Load risk management settings from localStorage
    const savedStopLosses = localStorage.getItem('portfolio_stop_losses');
    if (savedStopLosses) {
      try {
        setStopLosses(JSON.parse(savedStopLosses));
      } catch (err) {
        console.error('Failed to parse saved stop losses:', err);
      }
    }
    
    loadPortfolio();
    // Refresh with market-hour-appropriate interval to reduce API calls and avoid rate limits
    const interval = setInterval(() => {
      loadPortfolio();
    }, getRefreshInterval());
    return () => clearInterval(interval);
  }, []);
  
  // Listen for changes in userAddedTrades from dashboard
  useEffect(() => {
    const handleStorageChange = () => {
      loadPortfolio();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Watch for localStorage changes

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      // Load holdings from localStorage (user-managed portfolio)
      const savedHoldings = localStorage.getItem('portfolio_holdings');
      let userHoldings: Holding[] = savedHoldings ? JSON.parse(savedHoldings) : [];
      
      // Filter out any fake data that may have been previously stored
      userHoldings = userHoldings.filter(holding => {
        // Remove fake data with placeholder prices (typically 100.0) and fake symbols
        // But preserve legitimate RELIANCE.NS stock which is a real Indian stock
        return !(holding.currentPrice === 100.0 && holding.symbol === 'RE') &&
               !(holding.currentPrice === 100.0 && holding.symbol === 'REL') &&
               !(holding.currentPrice === 100.0 && holding.symbol === 'RELIANCE' && !holding.symbol.endsWith('.NS')) &&
               !holding.symbol.startsWith('FAKE') &&
               !holding.symbol.includes('TEST');
      });
      
      // Load user-added trades from dashboard and convert to holdings if they're not already in portfolio
      const savedUserTrades = localStorage.getItem('userAddedTrades');
      if (savedUserTrades) {
        try {
          const userTrades: PredictionItem[] = JSON.parse(savedUserTrades);
          
          // Add user trades that aren't already in the portfolio
          userTrades.forEach(trade => {
            const existingIndex = userHoldings.findIndex(h => h.symbol === trade.symbol);
            // Skip fake data symbols that have placeholder prices (e.g., current_price of exactly 100.0) or fake symbols
            // But preserve legitimate RELIANCE.NS stock which is a real Indian stock
            const isFakeData = (trade.current_price === 100.0 && trade.symbol === 'RE') || 
                             (trade.current_price === 100.0 && trade.symbol === 'REL') ||
                             (trade.current_price === 100.0 && trade.symbol === 'RELIANCE' && !trade.symbol.endsWith('.NS')) ||
                             (trade.current_price === 100.0 && trade.symbol.startsWith('FAKE')) ||
                             (trade.current_price === 100.0 && trade.symbol.includes('TEST'));
            
            if (existingIndex === -1 && !isFakeData) {
              // Add this trade to holdings if it's not already there and it's not fake data
              const avgPrice = trade.current_price || trade.predicted_price || 100; // Use current_price or predicted_price as avgPrice
              const newHolding: Holding = {
                symbol: trade.symbol,
                shares: 1, // Default to 1 share
                avgPrice: avgPrice,
                currentPrice: avgPrice,
                value: avgPrice
              };
              userHoldings.push(newHolding);
            }
          });
        } catch (err) {
          console.error('Failed to load user-added trades:', err);
        }
      }
      
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
          const total = calculatePortfolioValue(updatedHoldings);
          const gain = calculatePortfolioGain(updatedHoldings);
          setTotalValue(total);
          setTotalGain(gain);
          
              // Update localStorage with new prices
          localStorage.setItem('portfolio_holdings', JSON.stringify(updatedHoldings));
          
          // Assess risk for each holding
          await assessPortfolioRisk(updatedHoldings);
        } else {
          // No predictions, use stored data
          setHoldings(userHoldings);
          const total = calculatePortfolioValue(userHoldings);
          const gain = calculatePortfolioGain(userHoldings);
          setTotalValue(total);
          setTotalGain(gain);
        }
      } catch (apiError: unknown) {
        // Handle TimeoutError - backend is still processing
        if (apiError instanceof TimeoutError) {
          // Keep loading state active, use stored holdings for now
          console.log('PortfolioPage: Request timed out but backend is still processing');
          setHoldings(userHoldings);
          const total = calculatePortfolioValue(userHoldings);
          const gain = calculatePortfolioGain(userHoldings);
          setTotalValue(total);
          setTotalGain(gain);
          // Don't clear loading - backend is still working
          return;
        }
        
        // Handle actual errors - use stored holdings without price updates
        console.error('Failed to fetch real-time prices:', apiError);
        setHoldings(userHoldings);
        const total = calculatePortfolioValue(userHoldings);
        const gain = calculatePortfolioGain(userHoldings);
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

  // Function to record transaction in history
  const recordTransaction = (symbol: string, type: 'BUY' | 'SELL', shares: number, price: number) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      symbol,
      type,
      shares,
      price,
      timestamp: new Date().toISOString(),
      totalValue: shares * price
    };
    
    // Load existing transactions
    const existingTransactions = JSON.parse(localStorage.getItem('tradingHistory') || '[]');
    
    // Add new transaction and save
    const updatedTransactions = [transaction, ...existingTransactions];
    localStorage.setItem('tradingHistory', JSON.stringify(updatedTransactions));
  };
  
  const addPosition = async () => {
    // Determine shares and initial avgPrice based on mode
    const shares = isAddingToExisting ? newPosition.shares : 1;
    let avgPrice = isAddingToExisting ? newPosition.avgPrice : 0;
    
    // Validate required fields based on mode
    if (newPosition.symbol && (!isAddingToExisting || (shares > 0 && avgPrice > 0))) {
      // Fetch current price from backend
      let currentPrice = avgPrice > 0 ? avgPrice : 0; // Use provided avgPrice if available, otherwise fetch
      try {
        const response = await stockAPI.predict([newPosition.symbol], 'intraday');
        if (response.predictions && response.predictions.length > 0) {
          const prediction = response.predictions.find((p: PredictionItem) => !p.error);
          if (prediction) {
            // Check if this is fake data (typically has current_price of exactly 100.0 or other placeholder values)
            // But preserve legitimate RELIANCE.NS stock which is a real Indian stock
            const isFakeData = (prediction.current_price === 100.0 && prediction.symbol === 'RE') ||
                               (prediction.current_price === 100.0 && prediction.symbol === 'REL') ||
                               (prediction.current_price === 100.0 && prediction.symbol === 'RELIANCE' && !prediction.symbol.endsWith('.NS')) ||
                               (prediction.current_price === 100.0 && prediction.symbol.startsWith('FAKE')) ||
                               (prediction.current_price === 100.0 && prediction.symbol.includes('TEST'));
            
            if (!isFakeData) {
              currentPrice = prediction.predicted_price || prediction.current_price || (avgPrice > 0 ? avgPrice : 100);
              
              // If we're not adding to existing and didn't provide an avgPrice, use current price
              if (!isAddingToExisting && avgPrice <= 0) {
                // Update avgPrice to the fetched current price
              }
            } else {
              throw new Error('Cannot add fake data to portfolio. Please use a real stock symbol.');
            }
          }
        }
      } catch (error) {
        console.warn('Failed to fetch current price, using default:', error);
        if (avgPrice <= 0) {
          avgPrice = 100; // Default fallback
        }
        if (currentPrice <= 0) {
          currentPrice = avgPrice;
        }
      }
      
      // If we're not adding to existing and didn't provide an avgPrice, use current price
      if (!isAddingToExisting && avgPrice <= 0) {
        avgPrice = currentPrice;
      }
      
      const holding: Holding = {
        symbol: newPosition.symbol.toUpperCase(),
        shares: shares,
        avgPrice: avgPrice,
        currentPrice: currentPrice,
        value: shares * currentPrice,
      };
      
      // Check if this symbol already exists in holdings (for adding to existing)
      const existingIndex = holdings.findIndex(h => h.symbol === holding.symbol);
      let updatedHoldings;
      
      if (existingIndex !== -1) {
        // If adding to existing, merge with existing holding
        updatedHoldings = [...holdings];
        const existingHolding = updatedHoldings[existingIndex];
        updatedHoldings[existingIndex] = {
          symbol: holding.symbol,
          shares: existingHolding.shares + holding.shares,
          avgPrice: ((existingHolding.avgPrice * existingHolding.shares) + (holding.avgPrice * holding.shares)) / (existingHolding.shares + holding.shares), // Weighted average
          currentPrice: holding.currentPrice,
          value: (existingHolding.shares + holding.shares) * holding.currentPrice,
        };
      } else {
        // New holding
        updatedHoldings = [...holdings, holding];
      }
      
      // Save to localStorage
      localStorage.setItem('portfolio_holdings', JSON.stringify(updatedHoldings));
      
      // Dispatch storage event to notify other components (like Dashboard) of holdings change
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'portfolio_holdings',
        newValue: JSON.stringify(updatedHoldings)
      }));
      
      setHoldings(updatedHoldings);
      setNewPosition({ symbol: '', shares: 0, avgPrice: 0 });
      setShowAddModal(false);
      
      // Record transaction
      recordTransaction(newPosition.symbol.toUpperCase(), 'BUY', shares, avgPrice);
      
      // Update totals
      const total = calculatePortfolioValue(updatedHoldings);
      const gain = calculatePortfolioGain(updatedHoldings);
      setTotalValue(total);
      setTotalGain(gain);
      
      // Also add to userAddedTrades if not already there (for dashboard integration)
      try {
        const savedUserTrades = localStorage.getItem('userAddedTrades');
        let userTrades: PredictionItem[] = savedUserTrades ? JSON.parse(savedUserTrades) : [];
        
        const existingTradeIndex = userTrades.findIndex(t => t.symbol === holding.symbol);
        if (existingTradeIndex === -1) {
          // Create a prediction item for dashboard integration
          const newTrade: PredictionItem = {
            symbol: holding.symbol,
            action: 'HOLD', // Default action
            confidence: 0.5, // Default confidence
            predicted_return: 0,
            current_price: holding.currentPrice,
            predicted_price: holding.currentPrice,
            isUserAdded: true
          };
          userTrades = [...userTrades, newTrade];
          localStorage.setItem('userAddedTrades', JSON.stringify(userTrades));
          
          // Dispatch storage event to notify other components
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'userAddedTrades',
            newValue: JSON.stringify(userTrades)
          }));
        }
      } catch (err) {
        console.error('Failed to update userAddedTrades:', err);
      }
      
      // Refresh portfolio to ensure data consistency
      loadPortfolio();
    }
  };

  const removePosition = (index: number) => {
    const holding = holdings[index];
    
    // Record SELL transaction for the full position
    recordTransaction(holding.symbol, 'SELL', holding.shares, holding.currentPrice);
    
    const newHoldings = holdings.filter((_, i) => i !== index);
    // Save to localStorage
    localStorage.setItem('portfolio_holdings', JSON.stringify(newHoldings));
    
    // Dispatch storage event to notify other components (like Dashboard) of holdings change
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'portfolio_holdings',
      newValue: JSON.stringify(newHoldings)
    }));
    
    setHoldings(newHoldings);
    // Update totals
    const total = calculatePortfolioValue(newHoldings);
    const gain = calculatePortfolioGain(newHoldings);
    setTotalValue(total);
    setTotalGain(gain);
    
    // Also remove from userAddedTrades if it exists (for dashboard integration)
    try {
      const savedUserTrades = localStorage.getItem('userAddedTrades');
      if (savedUserTrades) {
        let userTrades: PredictionItem[] = JSON.parse(savedUserTrades);
        userTrades = userTrades.filter(t => t.symbol !== holding.symbol);
        localStorage.setItem('userAddedTrades', JSON.stringify(userTrades));
        
        // Dispatch storage event to notify other components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'userAddedTrades',
          newValue: JSON.stringify(userTrades)
        }));
      }
    } catch (err) {
      console.error('Failed to update userAddedTrades:', err);
    }
  };

  // Function to assess risk for portfolio holdings
  const assessPortfolioRisk = async (portfolioHoldings: Holding[]) => {
    try {
      // Get risk assessments for all holdings
      const newRiskLevels: {[key: string]: number} = {};
      const newRiskAssessments: {[key: string]: string} = {};
      
      for (const holding of portfolioHoldings) {
        try {
          // Call the risk API to assess risk for this symbol
          const riskResponse = await riskAPI.assessRisk(
            holding.symbol,
            holding.avgPrice,
            holding.currentPrice * 0.95, // Default stop loss at 5% below current price
            holding.shares,
            0.02 // 2% capital at risk
          );
          
          // Store the risk level and assessment
          newRiskLevels[holding.symbol] = riskResponse.risk_level || 0;
          newRiskAssessments[holding.symbol] = riskResponse.risk_assessment || 'Low';
        } catch (error) {
          // Default values if risk assessment fails
          newRiskLevels[holding.symbol] = 0.5; // Medium risk
          newRiskAssessments[holding.symbol] = 'Medium';
          console.warn(`Failed to assess risk for ${holding.symbol}:`, error);
        }
      }
      
      setRiskLevels(newRiskLevels);
      setRiskAssessment(newRiskAssessments);
    } catch (error) {
      console.error('Failed to assess portfolio risk:', error);
    }
  };
  
  // Function to set stop loss for a holding
  const setStopLoss = (symbol: string, stopLossPrice: number) => {
    const updatedStopLosses = { ...stopLosses, [symbol]: stopLossPrice };
    setStopLosses(updatedStopLosses);
    
    // Save to localStorage
    localStorage.setItem('portfolio_stop_losses', JSON.stringify(updatedStopLosses));
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'} mb-1`}>Positions</h1>
            <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs`}>Manage your active positions</p>
          </div>
          <button 
            onClick={() => {
              setNewPosition({ symbol: '', shares: 0, avgPrice: 0 });
              setIsAddingToExisting(false);
              setShowAddModal(true);
            }}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Position</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className={`${isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-slate-800/50 border border-slate-700/50'} rounded-lg p-3`}>
            <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs mb-1`}>Total Value</p>
            <p className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{formatUSDToINR(totalValue)}</p>
          </div>
          <div className={`${isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-slate-800/50 border border-slate-700/50'} rounded-lg p-3`}>
            <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs mb-1`}>Total Gain/Loss</p>
            <p className={`text-xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}{formatUSDToINR(totalGain)}
            </p>
          </div>
          <div className={`${isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-slate-800/50 border border-slate-700/50'} rounded-lg p-3`}>
            <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-xs mb-1`}>Active Positions</p>
            <p className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{holdings.length}</p>
          </div>
        </div>

        <div className={`${isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-slate-800/50 border border-slate-700/50'} rounded-lg overflow-hidden`}>
          <div className={`p-3 ${isLight ? 'border-b border-gray-200 bg-gray-50' : 'border-b border-slate-700'}`}>
            <h2 className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Active Positions</h2>
          </div>
          {loading ? (
            <div className={`p-8 text-center ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Loading...</div>
          ) : holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isLight ? 'bg-gray-100' : 'bg-slate-700'}>
                  <tr>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} uppercase`}>Symbol</th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} uppercase`}>Shares</th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} uppercase`}>Avg Price</th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} uppercase`}>Current Price</th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} uppercase`}>Value</th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} uppercase`}>Gain/Loss</th>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} uppercase`}>Risk & Actions</th>
                  </tr>
                </thead>
                <tbody className={`${isLight ? 'divide-y divide-gray-200' : 'divide-y divide-slate-700'}`}>
                  {holdings.map((holding, index) => {
                    const { gain, gainPercent } = calculateGain(holding);
                    return (
                      <tr key={index} className={`${isLight ? 'hover:bg-gray-50' : 'hover:bg-slate-700/50'}`}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`${isLight ? 'text-gray-900' : 'text-white'} font-semibold`}>{holding.symbol}</span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{holding.shares}</td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{formatUSDToINR(holding.avgPrice)}</td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isLight ? 'text-gray-900' : 'text-white'}`}>{formatUSDToINR(holding.currentPrice)}</td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isLight ? 'text-gray-900' : 'text-white'}`}>{formatUSDToINR(holding.value)}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {gain >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <span className={gain >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {formatUSDToINR(gain)} ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex flex-col space-y-2">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  setNewPosition({ 
                                    symbol: holding.symbol, 
                                    shares: 1, 
                                    avgPrice: holding.currentPrice 
                                  });
                                  setIsAddingToExisting(true);
                                  setShowAddModal(true);
                                }}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                              >
                                Buy More
                              </button>
                              <button 
                                onClick={() => {
                                  const currentShares = holding.shares;
                                  if (currentShares > 1) {
                                    // Reduce shares by 1
                                    const updated = holdings.map((h, i) => 
                                      i === index ? { ...h, shares: currentShares - 1, value: (currentShares - 1) * h.currentPrice } : h
                                    );
                                    // Save to localStorage
                                    localStorage.setItem('portfolio_holdings', JSON.stringify(updated));
                                    setHoldings(updated);
                                    // Update totals
                                    const total = calculatePortfolioValue(updated);
                                    const gain = calculatePortfolioGain(updated);
                                    setTotalValue(total);
                                    setTotalGain(gain);
                                    
                                    // Record SELL transaction for 1 share
                                    recordTransaction(holding.symbol, 'SELL', 1, holding.currentPrice);
                                  } else {
                                    removePosition(index);
                                  }
                                }}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                              >
                                Sell 1
                              </button>
                              <button 
                                onClick={() => {
                                  // Sell all shares
                                  recordTransaction(holding.symbol, 'SELL', holding.shares, holding.currentPrice);
                                  removePosition(index);
                                }}
                                className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded transition-colors"
                              >
                                Sell All
                              </button>
                            </div>
                            
                            {/* Risk Management Controls */}
                            <div className="mt-2 pt-2 border-t border-gray-600">
                              <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-yellow-500" />
                                <span className="text-xs text-gray-300 font-semibold">Risk:</span>
                                <span className={`text-xs font-semibold ${
                                  (riskLevels[holding.symbol] || 0) > 0.7 ? 'text-red-400' : 
                                  (riskLevels[holding.symbol] || 0) > 0.4 ? 'text-yellow-400' : 
                                  'text-green-400'
                                }`}>
                                  {(riskAssessment[holding.symbol] || 'Medium')}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs text-gray-300 font-semibold">Stop Loss:</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  defaultValue={stopLosses[holding.symbol] || holding.avgPrice * 0.95} // Default to 5% below avg price
                                  onChange={(e) => {
                                    const stopLoss = parseFloat(e.target.value);
                                    if (!isNaN(stopLoss)) {
                                      setStopLoss(holding.symbol, stopLoss);
                                    }
                                  }}
                                  className="w-20 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Stop Loss"
                                />
                              </div>
                              
                              <div className="mt-1">
                                <button
                                  onClick={() => {
                                    setRiskModalSymbol(holding.symbol);
                                    setShowRiskModal(true);
                                  }}
                                  className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs rounded transition-all flex items-center gap-1"
                                >
                                  <Shield className="w-3 h-3" />
                                  <span>Advanced</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`p-8 text-center ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>No active positions found</div>
          )}
        </div>

        {showAddModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998]"
            onClick={(e) => {
              // Only close if clicking on the backdrop, not the modal content
              if (e.target === e.currentTarget) {
                setShowAddModal(false);
                setNewPosition({ symbol: '', shares: 0, avgPrice: 0 });
                setSuggestions([]);
                setSuggestionIndex(-1);
              }
            }}
            aria-modal="true"
            role="dialog"
          >
            <div 
              className={`${isLight ? 'bg-white/80 backdrop-blur-sm border border-gray-200/50' : isSpace ? 'bg-slate-800/80 backdrop-blur-sm border border-purple-500/30' : 'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50'} rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl`}
              onClick={(e) => e.stopPropagation()} // Prevent click propagation to backdrop
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Add New Position</h3>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setNewPosition({ symbol: '', shares: 0, avgPrice: 0 });
                    setSuggestions([]);
                    setSuggestionIndex(-1);
                  }}
                  className={`p-1 rounded-lg transition-colors ${isLight ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-400 hover:bg-slate-700'}`}
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Symbol</label>
                  <input
                    type="text"
                    value={newPosition.symbol}
                    onChange={(e) => handleSymbolInput(e.target.value)}
                    placeholder="e.g., AAPL, TCS.NS"
                    className={`w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight 
                        ? 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500' 
                        : isSpace
                          ? 'bg-slate-700/70 border border-purple-500/30 text-white placeholder-gray-400'
                          : 'bg-slate-700/70 border border-slate-600 text-white placeholder-gray-400'
                    }`}
                    onFocus={() => {
                      if (newPosition.symbol.length > 0 && suggestions.length > 0) {
                        setSuggestions(suggestions); // Show suggestions when input is focused and there are suggestions
                      }
                    }}
                    onBlur={() => setTimeout(() => setSuggestions([]), 150)} // Clear suggestions with delay to allow click
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && suggestions.length > 0) {
                        if (suggestionIndex >= 0) {
                          // Select the currently highlighted suggestion
                          handleSelectSuggestion(suggestions[suggestionIndex]);
                        } else {
                          // Select the first suggestion when Enter is pressed
                          handleSelectSuggestion(suggestions[0]);
                        }
                        setSuggestions([]);
                        setSuggestionIndex(-1);
                        e.preventDefault(); // Prevent form submission
                      } else if (e.key === 'Escape') {
                        setSuggestions([]);
                        setSuggestionIndex(-1);
                      } else if (e.key === 'ArrowDown' && suggestions.length > 0) {
                        // Navigate down the suggestions
                        setSuggestionIndex(prev => 
                          prev < suggestions.length - 1 ? prev + 1 : 0
                        );
                        e.preventDefault();
                      } else if (e.key === 'ArrowUp' && suggestions.length > 0) {
                        // Navigate up the suggestions
                        setSuggestionIndex(prev => 
                          prev > 0 ? prev - 1 : suggestions.length - 1
                        );
                        e.preventDefault();
                      }
                    }}
                  />
                  
                  {/* Suggestions Dropdown - Positioned with high z-index to appear above global header */}
                  {suggestions.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto ${
                      isLight 
                        ? 'bg-white border border-gray-200' 
                        : isSpace
                          ? 'bg-slate-700/90 border border-purple-500/30'
                          : 'bg-slate-700/90 border border-slate-600'
                    }`}>
                      {suggestions.map((stock, index) => (
                        <button
                          key={stock}
                          type="button"
                          onMouseDown={(e) => {
                            // Prevent the input from losing focus when clicking a suggestion
                            e.preventDefault();
                          }}
                          onClick={() => {
                            handleSelectSuggestion(stock);
                            setSuggestions([]); // Clear suggestions after selection
                            setSuggestionIndex(-1); // Reset suggestion index
                          }}
                          className={`w-full px-4 py-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg border-b ${
                            index === suggestionIndex
                              ? (isLight
                                  ? 'bg-blue-100 text-blue-900'
                                  : isSpace
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-blue-600 text-white')
                              : (isLight
                                  ? 'text-gray-900 hover:bg-gray-100 border-gray-100 last:border-b-0'
                                  : isSpace
                                    ? 'text-white hover:bg-purple-500/20 border-purple-500/20 last:border-b-0'
                                    : 'text-white hover:bg-slate-600 border-slate-600 last:border-b-0')
                          }`}
                        >
                          {stock}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Conditional fields: Show only when adding to existing holding */}
                {isAddingToExisting && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Shares</label>
                      <input
                        type="number"
                        value={newPosition.shares || ''}
                        onChange={(e) => setNewPosition({ ...newPosition, shares: parseFloat(e.target.value) || 0 })}
                        placeholder="Number of shares"
                        min="1"
                        className={`w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isLight 
                            ? 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500' 
                            : isSpace
                              ? 'bg-slate-700/70 border border-purple-500/30 text-white placeholder-gray-400'
                              : 'bg-slate-700/70 border border-slate-600 text-white placeholder-gray-400'
                        }`} />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Average Price</label>
                      <input
                        type="number"
                        value={newPosition.avgPrice || ''}
                        onChange={(e) => setNewPosition({ ...newPosition, avgPrice: parseFloat(e.target.value) || 0 })}
                        placeholder="Purchase price per share"
                        step="0.01"
                        min="0.01"
                        className={`w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isLight 
                            ? 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500' 
                            : isSpace
                              ? 'bg-slate-700/70 border border-purple-500/30 text-white placeholder-gray-400'
                              : 'bg-slate-700/70 border border-slate-600 text-white placeholder-gray-400'
                        }`} />
                    </div>
                  </>
                )}
                

                
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={addPosition}
                    disabled={!newPosition.symbol || (isAddingToExisting && (newPosition.shares <= 0 || newPosition.avgPrice <= 0))}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      !newPosition.symbol || (isAddingToExisting && (newPosition.shares <= 0 || newPosition.avgPrice <= 0))
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isSpace
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                    }`}
                  >
                    {isAddingToExisting ? 'Add Shares' : 'Add Position'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewPosition({ symbol: '', shares: 0, avgPrice: 0 });
                      setSuggestions([]);
                      setSuggestionIndex(-1);
                    }}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isLight 
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        : isSpace
                          ? 'bg-slate-700 hover:bg-slate-600 text-white border border-purple-500/30'
                          : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Risk Management Modal */}
        {showRiskModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998]"
            onClick={(e) => {
              // Only close if clicking on the backdrop, not the modal content
              if (e.target === e.currentTarget) {
                setShowRiskModal(false);
                setRiskModalSymbol('');
              }
            }}
            aria-modal="true"
            role="dialog"
          >
            <div 
              className={`${isLight ? 'bg-white/80 backdrop-blur-sm border border-gray-200/50' : isSpace ? 'bg-slate-800/80 backdrop-blur-sm border border-purple-500/30' : 'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50'} rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl`}
              onClick={(e) => e.stopPropagation()} // Prevent click propagation to backdrop
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Risk Settings: {riskModalSymbol}</h3>
                <button 
                  onClick={() => {
                    setShowRiskModal(false);
                    setRiskModalSymbol('');
                  }}
                  className={`p-1 rounded-lg transition-colors ${isLight ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-400 hover:bg-slate-700'}`}
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Stop Loss Price</label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={stopLosses[riskModalSymbol] || 0}
                    onChange={(e) => {
                      const stopLoss = parseFloat(e.target.value);
                      if (!isNaN(stopLoss)) {
                        setStopLoss(riskModalSymbol, stopLoss);
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight 
                        ? 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500' 
                        : isSpace
                          ? 'bg-slate-700/70 border border-purple-500/30 text-white placeholder-gray-400'
                          : 'bg-slate-700/70 border border-slate-600 text-white placeholder-gray-400'
                    }`} 
                    placeholder="Stop loss price"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Risk Level</label>
                  <select
                    value={riskAssessment[riskModalSymbol] || 'Medium'}
                    onChange={(e) => {
                      const updatedRiskAssessment = { ...riskAssessment, [riskModalSymbol]: e.target.value };
                      setRiskAssessment(updatedRiskAssessment);
                      
                      // Save to localStorage
                      localStorage.setItem('portfolio_risk_assessment', JSON.stringify(updatedRiskAssessment));
                    }}
                    className={`w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight 
                        ? 'bg-gray-50 border border-gray-300 text-gray-900' 
                        : isSpace
                          ? 'bg-slate-700/70 border border-purple-500/30 text-white'
                          : 'bg-slate-700/70 border border-slate-600 text-white'
                    }`} 
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setShowRiskModal(false);
                      setRiskModalSymbol('');
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isSpace
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                    }`}
                  >
                    Apply Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowRiskModal(false);
                      setRiskModalSymbol('');
                    }}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isLight 
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        : isSpace
                          ? 'bg-slate-700 hover:bg-slate-600 text-white border border-purple-500/30'
                          : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PortfolioPage;

