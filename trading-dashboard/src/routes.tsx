import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import EnhancedAnalyticsPage from './pages/EnhancedAnalyticsPage';
import AlertsPage from './pages/AlertsPage';
import ComparePage from './pages/ComparePage';
import MarketScanPage from './pages/MarketScanPage';
import PortfolioPage from './pages/PortfolioPage';
import SettingsPage from './pages/SettingsPage';
import TradingHistoryPage from './pages/TradingHistoryPage';
import WatchListPage from './pages/WatchListPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TestAnalyzePage from './pages/TestAnalyzePage';
import TrainModelPage from './pages/TrainModelPage';
import ApiTestPage from './pages/ApiTestPage';
import RiskManagementPage from './pages/RiskManagementPage';
import EndpointTestPage from './pages/EndpointTestPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/enhanced-analytics" element={<EnhancedAnalyticsPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/compare" element={<ComparePage />} />
      <Route path="/market-scan" element={<MarketScanPage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/trading-history" element={<TradingHistoryPage />} />
      <Route path="/watchlist" element={<WatchListPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/train-model" element={<TrainModelPage />} />
      <Route path="/risk-management" element={<RiskManagementPage />} />
      <Route path="/endpoint-test" element={<EndpointTestPage />} />
      <Route path="/api-test" element={<ApiTestPage />} />
      <Route path="/test-analyze" element={<TestAnalyzePage />} />
      {/* Add more routes as needed */}
    </Routes>
  );
};