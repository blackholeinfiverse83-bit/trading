import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { config } from '../config';

interface User {
  username: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  _isProvider: boolean; // Internal flag to check if we're inside a provider
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize user from localStorage synchronously to prevent redirect on page reload
const initializeUser = (): User | null => {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  // Only return user if token is a valid JWT (not 'no-auth-required')
  if (token && token !== 'no-auth-required' && username) {
    return { username, token };
  }
  // Clear invalid tokens
  if (token === 'no-auth-required') {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if backend auth is disabled (open access mode)
  // In open access mode, we allow anonymous users
  const [authEnabled, setAuthEnabled] = useState(true);
  const [user, setUser] = useState<User | null>(initializeUser);

  useEffect(() => {
    // Check backend auth status on mount
    checkAuthStatus();
    
    // Verify token is still valid on mount
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    // If we have a valid token, restore user state
    if (token && token !== 'no-auth-required' && username && !user) {
      setUser({ username, token });
    } else if (token === 'no-auth-required') {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setUser(null);
    } else if (!token && !user && authEnabled) {
      // No token and auth is enabled - try auto-login with default credentials
      // This is a fallback to ensure the app works
      const tryAutoLogin = async () => {
        try {
          await login('admin', 'admin123');
        } catch (err) {
          // Auto-login failed - user will need to login manually
          console.log('Auto-login failed, user needs to login manually');
        }
      };
      // Only try auto-login if we're not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        tryAutoLogin();
      }
    }
  }, [user, authEnabled]);

  const checkAuthStatus = async () => {
    try {
      // Use the API service for consistent error handling
      const response = await fetch(`${config.API_BASE_URL}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000), // 10 second timeout (increased from 5)
      });
      
      if (response.ok) {
        const data = await response.json();
        // Backend specifies auth_status: 'disabled' when auth is off
        if (data.auth_status === 'disabled') {
          setAuthEnabled(false);
          // Auto-login as anonymous user when auth is disabled
          const anonymousUser = { username: 'anonymous', token: 'no-auth-required' };
          setUser(anonymousUser);
          localStorage.setItem('token', 'no-auth-required');
          localStorage.setItem('username', 'anonymous');
        } else {
          // Auth is enabled - check if we have a valid token
          setAuthEnabled(true);
          const currentToken = localStorage.getItem('token');
          const currentUsername = localStorage.getItem('username');
          
          if (currentToken === 'no-auth-required' || !currentToken || !currentUsername) {
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            setUser(null);
          } else if (currentToken && currentUsername && !user) {
            // We have a token but user state is not set - restore it
            setUser({ username: currentUsername, token: currentToken });
          }
        }
      } else {
        // Non-200 response - assume auth is required
        setAuthEnabled(true);
      }
    } catch (error) {
      // If backend is not available, assume auth is required
      console.warn('Could not check auth status, assuming auth enabled');
      setAuthEnabled(true);
    }
  };

  const login = async (username: string, password: string) => {
    // If auth is disabled, allow any login or skip login
    if (!authEnabled) {
      const userData = { 
        username: username || 'anonymous', 
        token: 'no-auth-required' 
      };
      setUser(userData);
      localStorage.setItem('token', 'no-auth-required');
      localStorage.setItem('username', userData.username);
      return;
    }
    
    try {
      const response = await authAPI.login(username, password);
      
      if (response.success && response.token) {
        const userData = { 
          username: response.username || username, 
          token: response.token 
        };
        setUser(userData);
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username || username);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      // Handle axios errors
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  };

  const signup = async (username: string, password: string, email: string) => {
    // If auth is disabled, just log in as the username
    if (!authEnabled) {
      await login(username, password);
      return;
    }
    
    // Backend doesn't have signup endpoint, so we'll use the authAPI signup which simulates it
    // In production, you'd add a signup endpoint to the backend
    try {
      const response = await authAPI.signup(username, password, email);
      if (!response.success) {
        throw new Error(response.message || 'Signup failed');
      }
      // After successful signup, automatically log in
      await login(username, password);
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, _isProvider: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): Omit<AuthContextType, '_isProvider'> => {
  const context = useContext(AuthContext);
  if (!context || !context._isProvider) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  // Remove internal flag before returning
  const { _isProvider, ...publicContext } = context;
  return publicContext;
};

