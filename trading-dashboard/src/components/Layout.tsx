import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import { AssetTypeProvider, useAssetType } from '../contexts/AssetTypeContext';
import { useTheme } from '../contexts/ThemeContext';
import UniGuruBackground from './UniGuruBackground';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutContent = ({ children }: LayoutProps) => {
  const { assetType, setAssetType } = useAssetType();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [, forceUpdate] = useState({});
  
  // Listen for theme changes to force re-render
  useEffect(() => {
    const handleThemeChange = () => {
      forceUpdate({});
    };
    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
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

  return (
    <div 
      key={theme} // Force re-render when theme changes
      className={`flex h-screen relative ${
        theme === 'light' ? 'bg-gray-100' : 
        theme === 'space' ? 'bg-[#1b0725]' : // Deep purple-black matching Uni-Guru
        'bg-slate-900'
      }`}
      style={theme === 'space' ? { backgroundColor: '#1b0725' } : undefined}
    >
      {theme === 'space' && <UniGuruBackground key="uniguru-bg" />}
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Navbar onSearch={handleSearch} activeTab={assetType} onTabChange={handleTabChange} />
        <main className="flex-1 overflow-y-auto p-6 relative z-10">
          {children}
        </main>
      </div>
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

