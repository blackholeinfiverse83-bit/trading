import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { apiService } from '../../services/api';
import { toast } from 'sonner@2.0.3';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
}

interface MarketPageProps {
  onAddToPortfolio?: (stock: Stock) => void;
}

export function MarketPage({ onAddToPortfolio }: MarketPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Search for stocks
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a stock symbol');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      // Search for the stock symbol
      const symbols = [searchQuery.toUpperCase()];
      const scanResults = await apiService.scanAll(symbols, 'short');

      // Transform API response to match component interface
      const transformedStocks: Stock[] = scanResults.map((item: any) => ({
        symbol: item.symbol,
        name: item.name || `${item.symbol} Inc.`,
        price: item.price,
        change: item.change,
        changePercent: item.change_percent,
        volume: item.volume,
      }));

      setSearchResults(transformedStocks);
      setLoading(false);

      if (transformedStocks.length === 0) {
        toast.error('No stocks found');
      }
    } catch (error: any) {
      // Handle different types of errors
      if (error.response?.status === 422) {
        setError('Invalid request format. Please check the symbol.');
        toast.error('Invalid request format. Please check the symbol.');
      } else if (error.response?.status === 429) {
        setError('Rate limit exceeded. Please wait before making more requests.');
        toast.error('Rate limit exceeded. Please wait before making more requests.');
      } else if (error.response?.status === 400) {
        setError(error.response?.data?.detail || 'Bad request. Please check your input.');
        toast.error(`Bad request: ${error.response?.data?.detail || 'Invalid parameters'}`);
      } else {
        setError(error.response?.data?.message || 'Failed to search stocks. Make sure the backend is running.');
        toast.error('Failed to search stocks. Backend may be offline.');
      }
      setLoading(false);
    }
  };

  const handleAddToPortfolio = (stock: Stock) => {
    if (onAddToPortfolio) {
      onAddToPortfolio(stock);
      toast.success(`${stock.symbol} added to portfolio`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl text-white mb-2">Market</h1>
          <p className="text-slate-400">Search and explore stocks</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Enter stock symbol (e.g., AAPL, GOOGL, MSFT)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Searching...
            </>
          ) : (
            'Search'
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Results Table */}
      {hasSearched && (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-800/30">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h2 className="text-white">Search Results</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/30 border-b border-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-slate-400">Symbol</th>
                  <th className="px-6 py-4 text-left text-sm text-slate-400">Name</th>
                  <th className="px-6 py-4 text-right text-sm text-slate-400">Price</th>
                  <th className="px-6 py-4 text-right text-sm text-slate-400">Change</th>
                  <th className="px-6 py-4 text-right text-sm text-slate-400">Volume</th>
                  <th className="px-6 py-4 text-right text-sm text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((stock, index) => (
                  <motion.tr
                    key={stock.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-white">{stock.symbol}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300">{stock.name}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-white">${stock.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {stock.changePercent >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}
                        >
                          {stock.changePercent >= 0 ? '+' : ''}
                          {stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-slate-300">{stock.volume}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleAddToPortfolio(stock)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add to Portfolio
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {searchResults.length === 0 && !loading && (
              <div className="p-12 text-center">
                <p className="text-slate-400">No stocks found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-12 text-center">
          <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl text-white mb-2">Search for Stocks</h3>
          <p className="text-slate-400">Enter a stock symbol above to search and add to your portfolio</p>
        </div>
      )}
    </div>
  );
}
