import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { HealthProvider } from './contexts/HealthContext';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { NotificationProvider } from './contexts/NotificationContext';
// WebSocketProvider disabled: Backend does not support WebSocket/Socket.IO
// All real-time updates use REST API polling instead
import { AppRoutes } from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ConnectionProvider>
            <HealthProvider>
              <AuthProvider>
                <PortfolioProvider>
                  {/* WebSocketProvider removed - backend uses REST API only */}
                  <NotificationProvider>
                    <AppRoutes />
                  </NotificationProvider>
                </PortfolioProvider>
              </AuthProvider>
            </HealthProvider>
          </ConnectionProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

