import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { config } from '../config';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  lastLogin: string;
  preferences: {
    theme: string;
    defaultHorizon: string;
    riskTolerance: string;
    currency: string;
    notifications: boolean;
  };
  accountBalance?: number;
  portfolioValue?: number;
}

interface User {
  username: string;
  token: string;
  profile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<void>;
  _isProvider: boolean; // Internal flag to check if we're inside a provider
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize user from localStorage synchronously to prevent redirect on page reload
const initializeUser = (): User | null => {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const profileData = localStorage.getItem('userProfile');
  
  // Only return user if token is a valid JWT (not 'no-auth-required')
  if (token && token !== 'no-auth-required' && username) {
    const profile = profileData ? JSON.parse(profileData) : undefined;
    return { username, token, profile };
  }
  
  // Check for anonymous user in no-auth mode
  if (token === 'no-auth-required' && username) {
    const profile = profileData ? JSON.parse(profileData) : undefined;
    return { username, token, profile };
  }
  
  // Clear invalid tokens
  if (token === 'no-auth-required') {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userProfile');
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if backend auth is disabled (open access mode)
  // In open access mode, we allow anonymous users
  const [authEnabled, setAuthEnabled] = useState<boolean | null>(null); // null = not checked yet
  const [user, setUser] = useState<User | null>(initializeUser);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initializeUser()?.profile || null);

  const checkAuthStatus = useCallback(async () => {
    try {
      // Use fetch with better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(`${config.API_BASE_URL}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          // Backend specifies auth_status: 'disabled' when auth is off
          if (data.auth_status === 'disabled') {
            setAuthEnabled(false);
            // Auto-login as anonymous user when auth is disabled
            // Create a default profile for anonymous user
            const defaultProfile: UserProfile = {
              id: 'anonymous',
              username: 'anonymous',
              email: 'anonymous@trading-dashboard.com',
              firstName: 'Anonymous',
              lastName: 'User',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              preferences: {
                theme: 'dark',
                defaultHorizon: 'intraday',
                riskTolerance: 'moderate',
                currency: 'INR',
                notifications: true,
              },
              accountBalance: 100000, // Default demo balance
              portfolioValue: 0,
            };
            
            localStorage.setItem('token', 'no-auth-required');
            localStorage.setItem('username', 'anonymous');
            localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
            
            const anonymousUser = { 
              username: 'anonymous', 
              token: 'no-auth-required',
              profile: defaultProfile
            };
            setUser(anonymousUser);
            setUserProfile(defaultProfile);
          } else {
            // Auth is enabled
            setAuthEnabled(true);
            const currentToken = localStorage.getItem('token');
            const currentUsername = localStorage.getItem('username');
            
            if (currentToken === 'no-auth-required') {
              // Clear invalid token (auth is enabled but we have no-auth token)
              localStorage.removeItem('token');
              localStorage.removeItem('username');
              localStorage.removeItem('userProfile');
              setUser(null);
              setUserProfile(null);
            } else if (currentToken && currentUsername && currentToken !== 'no-auth-required') {
              // We have a valid token - restore user
              const profileData = localStorage.getItem('userProfile');
              const profile = profileData ? JSON.parse(profileData) : undefined;
              setUser({ username: currentUsername, token: currentToken, profile });
              if (profile) {
                setUserProfile(profile);
              }
            }
          }
        } else {
          // Non-200 response - assume auth is required
          setAuthEnabled(true);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // If it's an abort (timeout), try to use cached auth status
        if (fetchError.name === 'AbortError') {
          // Check if we have a cached auth status
          const cachedToken = localStorage.getItem('token');
          if (cachedToken === 'no-auth-required') {
            // We've been in no-auth mode before, assume it's still disabled
            setAuthEnabled(false);
            const anonymousUser = { username: 'anonymous', token: 'no-auth-required' };
            setUser(anonymousUser);
            return;
          }
        }
        
        // For other errors, assume auth is required but don't log as warning
        // This is normal if backend is starting up
        setAuthEnabled(true);
      }
    } catch (error) {
      // Fallback: check localStorage for previous auth status
      const cachedToken = localStorage.getItem('token');
      if (cachedToken === 'no-auth-required') {
        // We've been in no-auth mode before, assume it's still disabled
        setAuthEnabled(false);
        const profileData = localStorage.getItem('userProfile');
        const profile = profileData ? JSON.parse(profileData) : {
          id: 'anonymous',
          username: 'anonymous',
          email: 'anonymous@trading-dashboard.com',
          firstName: 'Anonymous',
          lastName: 'User',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          preferences: {
            theme: 'dark',
            defaultHorizon: 'intraday',
            riskTolerance: 'moderate',
            currency: 'INR',
            notifications: true,
          },
          accountBalance: 100000,
          portfolioValue: 0,
        };
        
        const anonymousUser = { 
          username: 'anonymous', 
          token: 'no-auth-required',
          profile
        };
        setUser(anonymousUser);
        setUserProfile(profile);
      } else {
        // Assume auth is required
        setAuthEnabled(true);
      }
    }
  }, []);

  useEffect(() => {
    // Check backend auth status on mount
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Auto-login attempt when auth is enabled and no token exists
  useEffect(() => {
    // Don't try auto-login if auth is disabled or not yet determined
    if (authEnabled !== true) {
      return;
    }
    
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    // Only try auto-login if no token exists and not on login page
    if (!token && !username && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      const tryAutoLogin = async () => {
        try {
          const response = await authAPI.login('admin', 'admin123');
          if (response.success && response.token) {
            const userData = { 
              username: response.username || 'admin', 
              token: response.token 
            };
            setUser(userData);
            localStorage.setItem('token', response.token);
            localStorage.setItem('username', response.username || 'admin');
          }
        } catch (err) {
          // Auto-login failed silently - user will need to login manually
          // Don't log this as it's expected behavior
        }
      };
      tryAutoLogin();
    }
  }, [authEnabled]);

  const login = useCallback(async (username: string, password: string) => {
    // If auth is disabled, allow any login or skip login
    if (authEnabled === false) {
      // Create a default profile for new anonymous user
      const defaultProfile: UserProfile = {
        id: Date.now().toString(),
        username: username || 'anonymous',
        email: `${username || 'anonymous'}@trading-dashboard.com`,
        firstName: username || 'Anonymous',
        lastName: 'User',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferences: {
          theme: 'dark',
          defaultHorizon: 'intraday',
          riskTolerance: 'moderate',
          currency: 'INR',
          notifications: true,
        },
        accountBalance: 100000, // Default demo balance
        portfolioValue: 0,
      };
                  
      const userData = { 
        username: username || 'anonymous', 
        token: 'no-auth-required',
        profile: defaultProfile
      };
      setUser(userData);
      setUserProfile(defaultProfile);
      localStorage.setItem('token', 'no-auth-required');
      localStorage.setItem('username', userData.username);
      localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
      return;
    }
    
    // Only try to login via API if auth is enabled
    if (authEnabled === true) {
      try {
        const response = await authAPI.login(username, password);
        
        if (response.success && response.token) {
          // Create or update user profile
          const existingProfileData = localStorage.getItem('userProfile');
          const existingProfile = existingProfileData ? JSON.parse(existingProfileData) : null;
          
          const profile: UserProfile = existingProfile || {
            id: Date.now().toString(),
            username: response.username || username,
            email: `${response.username || username}@trading-dashboard.com`,
            firstName: response.username || username,
            lastName: 'User',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            preferences: {
              theme: 'dark',
              defaultHorizon: 'intraday',
              riskTolerance: 'moderate',
              currency: 'INR',
              notifications: true,
            },
            accountBalance: 100000,
            portfolioValue: 0,
          };
          
          // Update last login time
          profile.lastLogin = new Date().toISOString();
          
          const userData = { 
            username: response.username || username, 
            token: response.token,
            profile
          };
          setUser(userData);
          setUserProfile(profile);
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.username || username);
          localStorage.setItem('userProfile', JSON.stringify(profile));
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
    }
  }, [authEnabled]);

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
    // Clear user state and localStorage regardless of auth status
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userProfile');
    // Note: Navigation is handled by the component calling logout
    // This allows React Router to handle navigation properly
  };
  
  const updateUserProfile = async (profileUpdates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const updatedProfile: UserProfile = {
      ...userProfile!,
      ...profileUpdates,
      lastLogin: userProfile?.lastLogin || new Date().toISOString(),
    };
    
    // Update in state
    setUser({ ...user, profile: updatedProfile });
    setUserProfile(updatedProfile);
    
    // Update in localStorage
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
  };
  
  const updateUserPreferences = async (preferencesUpdates: Partial<UserProfile['preferences']>) => {
    if (!user || !userProfile) {
      throw new Error('User not authenticated');
    }
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      preferences: {
        ...userProfile.preferences,
        ...preferencesUpdates,
      },
      lastLogin: new Date().toISOString(),
    };
    
    // Update in state
    setUser({ ...user, profile: updatedProfile });
    setUserProfile(updatedProfile);
    
    // Update in localStorage
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    // Update theme context if theme changed
    if (preferencesUpdates.theme) {
      document.documentElement.setAttribute('data-theme', preferencesUpdates.theme);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        userProfile,
        login, 
        signup, 
        logout, 
        isAuthenticated: !!user, 
        updateUserProfile,
        updateUserPreferences,
        _isProvider: true 
      }}
    >
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

