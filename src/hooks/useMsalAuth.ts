/**
 * Custom hook for MSAL authentication
 * Provides SSO authentication functionality with Azure AD
 */

import { useState, useEffect, useCallback } from 'react';
import type { 
  AccountInfo,
  AuthenticationResult,
  EventMessage,
  SilentRequest,
  RedirectRequest,
  PopupRequest
} from '@azure/msal-browser';
import { 
  InteractionRequiredAuthError,
  EventType,
  AuthError
} from '@azure/msal-browser';
import { getMsalInstance, loginRequest, apiRequest } from '../config/msalConfig';
import { api } from '../utils/api';

export interface MsalAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  account: AccountInfo | null;
  error: string | null;
}

export interface UseMsalAuthReturn extends MsalAuthState {
  login: (usePopup?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  acquireToken: (scopes?: string[]) => Promise<string | null>;
  handleSSOCallback: (authResult: AuthenticationResult) => Promise<void>;
}

/**
 * Custom hook for MSAL authentication
 */
export const useMsalAuth = (): UseMsalAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const msalInstance = getMsalInstance();

  /**
   * Initialize MSAL and check for existing session
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is already signed in
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsAuthenticated(true);
          
          // Try to acquire token silently
          await acquireTokenSilent();
        }
      } catch (err) {
        console.error('MSAL initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    // Set up event callbacks
    const callbackId = msalInstance.addEventCallback((event: EventMessage) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const authResult = event.payload as AuthenticationResult;
        if (authResult.account) {
          setAccount(authResult.account);
          setIsAuthenticated(true);
        }
      } else if (event.eventType === EventType.LOGOUT_SUCCESS) {
        setAccount(null);
        setIsAuthenticated(false);
      } else if (event.eventType === EventType.LOGIN_FAILURE) {
        const authError = event.error as AuthError;
        setError(authError?.message || 'Login failed');
        setIsAuthenticated(false);
      }
    });

    initAuth();

    // Cleanup
    return () => {
      if (callbackId) {
        msalInstance.removeEventCallback(callbackId);
      }
    };
  }, []);

  /**
   * Acquire token silently
   */
  const acquireTokenSilent = async (scopes?: string[]): Promise<string | null> => {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      return null;
    }

    const request: SilentRequest = {
      scopes: scopes || apiRequest.scopes,
      account: accounts[0],
    };

    try {
      const response = await msalInstance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Silent token acquisition failed, interaction required
        console.log('Silent token acquisition failed, interaction required');
        return null;
      }
      console.error('Token acquisition error:', error);
      return null;
    }
  };

  /**
   * Login with redirect or popup
   */
  const login = useCallback(async (usePopup = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: RedirectRequest | PopupRequest = {
        ...loginRequest,
        prompt: 'select_account', // Force account selection
      };

      let response: AuthenticationResult;
      
      if (usePopup) {
        response = await msalInstance.loginPopup(request);
      } else {
        // For redirect flow, this won't return immediately
        await msalInstance.loginRedirect(request);
        return; // The page will redirect
      }

      if (response.account) {
        setAccount(response.account);
        setIsAuthenticated(true);
        
        // Exchange MSAL token for backend JWT
        await handleSSOCallback(response);
      }
    } catch (err) {
      const authError = err as AuthError;
      console.error('Login error:', authError);
      setError(authError.message || 'Login failed');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Clear local authentication state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      
      // Logout from MSAL
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutRedirect({
          account: accounts[0],
          postLogoutRedirectUri: window.location.origin,
        });
      }
      
      setAccount(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Acquire access token for API calls
   */
  const acquireToken = useCallback(async (scopes?: string[]): Promise<string | null> => {
    try {
      // First try silent acquisition
      let token = await acquireTokenSilent(scopes);
      
      if (!token) {
        // If silent fails, try interactive
        const request: PopupRequest = {
          scopes: scopes || apiRequest.scopes,
          account: account || undefined,
        };
        
        const response = await msalInstance.acquireTokenPopup(request);
        token = response.accessToken;
      }
      
      return token;
    } catch (err) {
      console.error('Token acquisition error:', err);
      setError('Failed to acquire access token');
      return null;
    }
  }, [account]);

  /**
   * Handle SSO callback - exchange MSAL token for backend JWT
   */
  const handleSSOCallback = useCallback(async (authResult: AuthenticationResult) => {
    try {
      // Get the ID token from MSAL
      const idToken = authResult.idToken;
      
      if (!idToken) {
        throw new Error('No ID token received from Azure AD');
      }

      // Exchange the Azure AD token for backend JWT tokens
      const response = await api.post('/api/v1/auth/sso/exchange', {
        azure_token: idToken,
        account: {
          username: authResult.account?.username,
          email: authResult.account?.username, // Azure AD username is usually email
          name: authResult.account?.name,
        }
      });

      const { access_token, refresh_token } = response.data;

      // Store backend tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Set authorization header for API calls
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      setIsAuthenticated(true);
    } catch (err) {
      console.error('SSO token exchange error:', err);
      setError('Failed to complete SSO authentication');
      throw err;
    }
  }, []);

  return {
    isAuthenticated,
    isLoading,
    account,
    error,
    login,
    logout,
    acquireToken,
    handleSSOCallback,
  };
};