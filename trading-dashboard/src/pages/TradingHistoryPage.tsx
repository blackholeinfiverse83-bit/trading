import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { formatUSDToINR } from '../utils/currencyConverter';
import { useTheme } from '../contexts/ThemeContext';
import { type Transaction } from '../types';

const TradingHistoryPage = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTradingHistory();
  }, []);

  const loadTradingHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load from localStorage (user's saved transactions)
      // In a real app, this would come from backend API
      const saved = localStorage.getItem('tradingHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        setTransactions(parsed);
      } else {
        // No mock data - show empty state
        setTransactions([]);
      }
    } catch (error: any) {
      console.error('Failed to load trading history:', error);
      setError('Failed to load trading history');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className={`text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'} mb-2`}>Trade History</h1>
          <p className={isLight ? 'text-gray-600' : 'text-gray-400'}>View all your past transactions</p>
        </div>

        {loading ? (
          <div className={`text-center py-8 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Loading...</div>
        ) : error ? (
          <div className={`${isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-slate-800/50 border border-slate-700/50'} rounded-lg p-6`}>
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        ) : transactions.length > 0 ? (
          <div className={`${isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-slate-800/50 border border-slate-700/50'} rounded-lg overflow-hidden`}>
            <div className={`p-6 ${isLight ? 'border-b border-gray-200 bg-gray-50' : 'border-b border-slate-700'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Trade Transactions</h2>
                <div className="flex space-x-2">
                  <button className={`px-4 py-2 ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-slate-700 hover:bg-slate-600 text-white'} text-sm rounded-lg transition-colors`}>
                    Filter
                  </button>
                  <button className={`px-4 py-2 ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-slate-700 hover:bg-slate-600 text-white'} text-sm rounded-lg transition-colors`}>
                    Export
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isLight ? 'bg-gray-100' : 'bg-slate-700'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} uppercase`}>Date</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} uppercase`}>Type</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} uppercase`}>Symbol</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} uppercase`}>Shares</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} uppercase`}>Price</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} uppercase`}>Total</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'} uppercase`}>Status</th>
                  </tr>
                </thead>
                <tbody className={`${isLight ? 'divide-y divide-gray-200' : 'divide-y divide-slate-700'}`}>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{new Date(transaction.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {transaction.type === 'BUY' ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <span className={transaction.type === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">{transaction.symbol}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{transaction.shares}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{formatUSDToINR(transaction.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">
                        {formatUSDToINR(transaction.totalValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={`${isLight ? 'bg-white/50 border border-gray-200/50' : 'bg-slate-800/50 border border-slate-700/50'} rounded-lg p-12 text-center`}>
            <AlertCircle className={`w-12 h-12 ${isLight ? 'text-gray-400' : 'text-gray-500'} mx-auto mb-4`} />
            <h3 className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'} mb-2`}>No Trade History</h3>
            <p className={isLight ? 'text-gray-600' : 'text-gray-400'}>Your trade history will appear here once you make transactions.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TradingHistoryPage;
