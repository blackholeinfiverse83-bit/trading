import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './components/pages/DashboardPage';
import { MarketPage } from './components/pages/MarketPage';
import { PortfolioPage } from './components/pages/PortfolioPage';
import { ComingSoonPage } from './components/pages/ComingSoonPage';
import { SpaceBackground } from './components/SpaceBackground';
import { History, Brain, Star, Beaker, LineChart } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

interface PortfolioStock {
  symbol: string;
  name: string;
  price: number;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [portfolioStocks, setPortfolioStocks] = useState<PortfolioStock[]>([]);
  const [accountValue, setAccountValue] = useState(0);
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [marketType, setMarketType] = useState('stocks'); // 'stocks', 'crypto', 'commodities'

  // Add stock to portfolio
  const handleAddToPortfolio = (stock: PortfolioStock) => {
    // Check if stock already exists
    if (!portfolioStocks.find(s => s.symbol === stock.symbol)) {
      setPortfolioStocks([...portfolioStocks, stock]);
    }
  };

  // Remove stock from portfolio
  const handleRemoveFromPortfolio = (symbol: string) => {
    setPortfolioStocks(portfolioStocks.filter(s => s.symbol !== symbol));
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage marketType={marketType} />;
      case 'market':
        return <MarketPage onAddToPortfolio={handleAddToPortfolio} />;
      case 'portfolio':
        return <PortfolioPage addedStocks={portfolioStocks} onRemoveStock={handleRemoveFromPortfolio} />;
      case 'history':
        return (
          <ComingSoonPage
            title="History"
            description="View your complete trading history and past transactions"
            icon={History}
          />
        );
      case 'predictions':
        return (
          <ComingSoonPage
            title="Predictions"
            description="AI-powered market predictions and analysis"
            icon={Brain}
          />
        );
      case 'watchlist':
        return (
          <ComingSoonPage
            title="Watchlist"
            description="Track your favorite stocks and assets"
            icon={Star}
          />
        );
      case 'test':
        return (
          <ComingSoonPage
            title="Test"
            description="Test trading strategies in a sandbox environment"
            icon={Beaker}
          />
        );
      case 'chart':
        return (
          <ComingSoonPage
            title="Chart"
            description="Advanced charting tools and technical analysis"
            icon={LineChart}
          />
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex relative">
      {/* Animated Space Background */}
      <SpaceBackground />

      {/* Sidebar - Fixed width of 240px */}
      <div className="flex-shrink-0 w-60 h-full">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>

      {/* Main Content - Fluid area that expands to fill available space */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-full">
        {/* Header */}
        <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40 flex-shrink-0">
          <div className="px-6 py-3 flex items-center justify-between gap-4">
            {/* Market Type Selector */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setMarketType('stocks')}
                className={`px-3 py-1 rounded-lg text-sm ${marketType === 'stocks' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Stocks
              </button>
              <button 
                onClick={() => setMarketType('crypto')}
                className={`px-3 py-1 rounded-lg text-sm ${marketType === 'crypto' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Crypto
              </button>
              <button 
                onClick={() => setMarketType('commodities')}
                className={`px-3 py-1 rounded-lg text-sm ${marketType === 'commodities' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Commodities
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm text-slate-300">
                  {isMarketOpen ? 'Market Open' : 'Market Closed'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Account Value</p>
                <p className="text-lg text-white">${accountValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-auto">
          <div className="w-full h-full min-h-full">
            {renderPage()}
          </div>
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}