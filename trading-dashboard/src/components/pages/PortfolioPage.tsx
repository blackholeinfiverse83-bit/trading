import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, TrendingUp, TrendingDown, Trash2, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { apiService } from '../../services/api';
import { toast } from 'sonner@2.0.3';

interface Holding {
  stock: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalCost: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
}

interface PortfolioPageProps {
  addedStocks?: Array<{
    symbol: string;
    name: string;
    price: number;
  }>;
  onRemoveStock?: (symbol: string) => void;
}

export function PortfolioPage({ addedStocks = [], onRemoveStock }: PortfolioPageProps) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalInvested: 0,
    currentValue: 0,
    totalPnL: 0,
    pnlPercent: 0,
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updatePortfolio = async () => {
    if (addedStocks.length === 0) {
      setHoldings([]);
      setPortfolioStats({
        totalInvested: 0,
        currentValue: 0,
        totalPnL: 0,
        pnlPercent: 0,
      });
      return;
    }

    try {
      setIsRefreshing(true);

      // Fetch current prices from backend
      const symbols = addedStocks.map(s => s.symbol);
      const scanResults = await apiService.scanAll(symbols, 'short');

      // Update holdings with current prices
      const updatedHoldings: Holding[] = addedStocks.map((stock) => {
        const currentData = scanResults.find((s: any) => s.symbol === stock.symbol);
        const currentPrice = currentData?.price || stock.price;
        const avgPrice = stock.price; // Initial price when added
        const quantity = 1; // Default quantity
        const totalCost = quantity * avgPrice;
        const totalValue = quantity * currentPrice;
        const pnl = totalValue - totalCost;
        const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

        return {
          stock: stock.symbol,
          symbol: stock.name,
          quantity,
          avgPrice,
          currentPrice,
          totalCost,
          totalValue,
          pnl,
          pnlPercent,
        };
      });

      setHoldings(updatedHoldings);

      // Calculate portfolio stats
      const totalInvested = updatedHoldings.reduce((sum, h) => sum + h.totalCost, 0);
      const currentValue = updatedHoldings.reduce((sum, h) => sum + h.totalValue, 0);
      const totalPnL = currentValue - totalInvested;
      const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

      setPortfolioStats({
        totalInvested,
        currentValue,
        totalPnL,
        pnlPercent,
      });

      setLastUpdate(new Date());
      setIsRefreshing(false);
    } catch (error: any) {
      // Handle different types of errors
      setIsRefreshing(false);
      
      if (error.response?.status === 422) {
        toast.error('Invalid request format for portfolio update.');
      } else if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please wait before making more requests.');
      } else if (error.response?.status === 400) {
        toast.error(`Bad request: ${error.response.data.detail || 'Invalid parameters'}`);
      } else {
        toast.error('Failed to update portfolio. Backend may be offline.');
      }
    }
  };

  useEffect(() => {
    updatePortfolio();

    // Refresh every 30 seconds to reduce API calls and avoid rate limiting
    if (addedStocks.length > 0) {
      const interval = setInterval(updatePortfolio, 30000);
      return () => clearInterval(interval);
    }
  }, [addedStocks]);

  const handleRemove = (symbol: string) => {
    if (onRemoveStock) {
      onRemoveStock(symbol);
      toast.success(`${symbol} removed from portfolio`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl text-white mb-2">Portfolio</h1>
          <p className="text-slate-400">Track your investments and performance</p>
        </div>
        {holdings.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
              <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>

      {holdings.length > 0 ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6"
            >
              <p className="text-sm text-slate-400 mb-2">Total Invested</p>
              <p className="text-3xl text-white">
                ${portfolioStats.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6"
            >
              <p className="text-sm text-slate-400 mb-2">Current Value</p>
              <p className="text-3xl text-white">
                ${portfolioStats.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6"
            >
              <p className="text-sm text-slate-400 mb-2">Total P&L</p>
              <p className={`text-3xl ${portfolioStats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${portfolioStats.totalPnL >= 0 ? '' : '-'}
                {Math.abs(portfolioStats.totalPnL).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-sm ${portfolioStats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {portfolioStats.pnlPercent >= 0 ? '+' : ''}
                {portfolioStats.pnlPercent.toFixed(2)}%
              </p>
            </motion.div>
          </div>

          {/* Holdings Table */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-800/30">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <h2 className="text-white">Your Holdings</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/30 border-b border-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm text-slate-400">Stock</th>
                    <th className="px-6 py-4 text-right text-sm text-slate-400">Quantity</th>
                    <th className="px-6 py-4 text-right text-sm text-slate-400">Avg Price</th>
                    <th className="px-6 py-4 text-right text-sm text-slate-400">Current Price</th>
                    <th className="px-6 py-4 text-right text-sm text-slate-400">Total Cost</th>
                    <th className="px-6 py-4 text-right text-sm text-slate-400">Total Value</th>
                    <th className="px-6 py-4 text-right text-sm text-slate-400">P&L</th>
                    <th className="px-6 py-4 text-right text-sm text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding, index) => (
                    <motion.tr
                      key={holding.stock}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white">{holding.stock}</p>
                          <p className="text-xs text-slate-400">{holding.symbol}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-white">{holding.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-slate-300">${holding.avgPrice.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-white">${holding.currentPrice.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-slate-300">
                          ${holding.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-white">
                          ${holding.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div>
                          <div className="flex items-center justify-end gap-1">
                            {holding.pnl >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span className={holding.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                              ${holding.pnl >= 0 ? '' : '-'}
                              {Math.abs(holding.pnl).toFixed(2)}
                            </span>
                          </div>
                          <p className={`text-xs ${holding.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ({holding.pnlPercent >= 0 ? '+' : ''}
                            {holding.pnlPercent.toFixed(2)}%)
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemove(holding.stock)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-12 text-center">
          <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl text-white mb-2">No Holdings Yet</h3>
          <p className="text-slate-400">Search for stocks in the Market page and add them to your portfolio</p>
        </div>
      )}
    </div>
  );
}
