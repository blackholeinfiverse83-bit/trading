import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import { AssetTypeProvider, useAssetType } from '../contexts/AssetTypeContext';
import { useTheme } from '../contexts/ThemeContext';
import UniGuruBackground from './UniGuruBackground';
import FloatingAIButton from './FloatingAIButton';
import QuickActions from './QuickActions';
import ToastContainer, { Toast } from './ToastContainer';
import { useKeyboardShortcuts } from '../utils/keyboardShortcuts';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutContent = ({ children }: LayoutProps) => {
  const { assetType, setAssetType } = useAssetType();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (query: string) => {
    // Navigate to market scan with search query and asset type
    navigate(`/market-scan?q=${encodeURIComponent(query)}&type=${assetType}`);
  };

  const handleTabChange = (tab: 'stocks' | 'crypto' | 'commodities') => {
    setAssetType(tab);
    // If on market-scan page, navigate to refresh with new asset type
    if (window.location.pathname === '/market-scan') {
      navigate(`/market-scan?type=${tab}`, { replace: true });
    }
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleQuickPredict = () => {
    navigate('/dashboard');
    addToast({
      type: 'info',
      title: 'Quick Predict',
      message: 'Navigate to dashboard to make predictions'
    });
  };

  const handleQuickScan = () => {
    navigate('/market-scan');
    addToast({
      type: 'info',
      title: 'Market Scanner',
      message: 'Opening market scanner'
    });
  };

  const handleQuickSearch = () => {
    // Focus on search input in navbar
    const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  // Enable keyboard shortcuts
  useKeyboardShortcuts({
    onQuickPredict: handleQuickPredict,
    onQuickScan: handleQuickScan,
    onFocusSearch: handleQuickSearch
  });

  return (
    <div 
      className={`flex h-screen relative overflow-hidden ${
        theme === 'light' ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50' : 
        theme === 'space' ? 'bg-gradient-to-br from-black via-slate-900 to-black' :
        'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
      }`}
    >
      {theme === 'space' && <UniGuruBackground />}
      
      {/* Smart Sidebar with Backdrop */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
        sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      </div>
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Smart Navbar */}
        <div className="sticky top-0 z-30">
          <Navbar 
            onSearch={handleSearch} 
            activeTab={assetType} 
            onTabChange={handleTabChange}
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>
        
        {/* Content Container with Smart Scrolling */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar relative ${
          theme === 'light' ? 'bg-white/30' : 
          theme === 'space' ? 'bg-black/20' : 'bg-slate-800/30'
        } backdrop-blur-sm`}>
          <div className="container mx-auto px-4 py-1 max-w-none min-h-full">
            <div className="animate-fadeIn h-full">
              {children}
            </div>
          </div>
        </main>
        
        {/* Smart Floating Elements */}
        <FloatingAIButton />
        <QuickActions 
          onPredict={handleQuickPredict}
          onScan={handleQuickScan}
          onSearch={handleQuickSearch}
        />
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <AssetTypeProvider>
      <LayoutContent>{children}</LayoutContent>
    </AssetTypeProvider>
  );
};

export default Layout;

