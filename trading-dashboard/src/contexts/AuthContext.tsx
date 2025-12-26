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
  if (token && username) {
    return { username, token };
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
    
    // Verify token is still valid on mount (optional: could add token validation here)
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username && !user) {
      setUser({ username, token });
    }
  }, [user]);

  const checkAuthStatus = async () => {
    try {
      // Try to get API info to check if auth is required
      const response = await fetch(`${config.API_BASE_URL}/`);
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
        }
      }
    } catch (error) {
      // If backend is not available, assume auth is required
      console.warn('Could not check auth status, assuming auth enabled');
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

