import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MarketScanPage from './pages/MarketScanPage';
import PortfolioPage from './pages/PortfolioPage';
import TradingHistoryPage from './pages/TradingHistoryPage';
import WatchListPage from './pages/WatchListPage';
import AnalyticsPage from './pages/AnalyticsPage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  // Allow access if authenticated OR if user is anonymous (auth disabled)
  const hasAccess = isAuthenticated || (user && user.username === 'anonymous');
  return hasAccess ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  // Redirect to dashboard only if authenticated (not anonymous)
  const shouldRedirect = isAuthenticated && user && user.username !== 'anonymous';
  return !shouldRedirect ? <>{children}</> : <Navigate to="/dashboard" />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/market-scan" element={<PrivateRoute><MarketScanPage /></PrivateRoute>} />
      <Route path="/portfolio" element={<PrivateRoute><PortfolioPage /></PrivateRoute>} />
      <Route path="/trading-history" element={<PrivateRoute><TradingHistoryPage /></PrivateRoute>} />
      <Route path="/watchlist" element={<PrivateRoute><WatchListPage /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

