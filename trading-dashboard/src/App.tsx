import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { AppRoutes } from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import BackendConnectionBanner from './components/BackendConnectionBanner';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ConnectionProvider>
            <AuthProvider>
              <WebSocketProvider>
                <NotificationProvider>
                  <BackendConnectionBanner />
                  <AppRoutes />
                </NotificationProvider>
              </WebSocketProvider>
            </AuthProvider>
          </ConnectionProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

