import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import axios from 'axios';
import { api } from '../utils/api';
import { isTokenExpired, getUserFromToken, setupTokenRefreshTimer } from '../utils/tokenUtils';

interface User {
  username: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear refresh timer
  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  // Load tokens from localStorage on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (accessToken && refreshToken) {
      // Check if access token is expired
      if (isTokenExpired(accessToken)) {
        // Try to refresh if access token is expired
        refreshTokenHandler()
          .then(() => {
            const newAccessToken = localStorage.getItem('access_token');
            if (newAccessToken) {
              const userInfo = getUserFromToken(newAccessToken);
              if (userInfo) {
                setUser(userInfo);
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                
                // Set up auto-refresh timer
                refreshTimerRef.current = setupTokenRefreshTimer(newAccessToken, refreshTokenHandler);
              }
            }
          })
          .catch(() => {
            logout();
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // Token is still valid
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        const userInfo = getUserFromToken(accessToken);
        if (userInfo) {
          setUser(userInfo);
          
          // Set up auto-refresh timer
          refreshTimerRef.current = setupTokenRefreshTimer(accessToken, refreshTokenHandler);
        } else {
          logout();
        }
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
    
    // Cleanup on unmount
    return () => {
      clearRefreshTimer();
    };
  }, []);

  // Setup axios interceptors for token refresh
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await refreshTokenHandler();
            const newToken = localStorage.getItem('access_token');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Create form data for OAuth2 password flow
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await api.post('/api/v1/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, refresh_token } = response.data;

      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Get user info from token
      const userInfo = getUserFromToken(access_token);
      if (userInfo) {
        setUser(userInfo);
        
        // Clear any existing timer and set up new auto-refresh timer
        clearRefreshTimer();
        refreshTimerRef.current = setupTokenRefreshTimer(access_token, refreshTokenHandler);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear refresh timer
    clearRefreshTimer();
    
    // Clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const refreshTokenHandler = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        `${api.defaults.baseURL}/api/v1/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      const { access_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Update user info from new token
      const userInfo = getUserFromToken(access_token);
      if (userInfo) {
        setUser(userInfo);
        
        // Clear any existing timer and set up new auto-refresh timer
        clearRefreshTimer();
        refreshTimerRef.current = setupTokenRefreshTimer(access_token, refreshTokenHandler);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  const refreshToken = refreshTokenHandler;

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};