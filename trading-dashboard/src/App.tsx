import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppRoutes } from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import { CommandPalette } from './components/ui/CommandPalette';
import { ModalContainer } from './components/ui/ModalContainer';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import './App.css';

function AppContent() {
  useGlobalShortcuts();
  
  return (
    <>
      <AppRoutes />
      <CommandPalette />
      <ModalContainer />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ConnectionProvider>
            <AuthProvider>
              <NotificationProvider>
                <AppContent />
              </NotificationProvider>
            </AuthProvider>
          </ConnectionProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

