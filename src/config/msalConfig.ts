/**
 * MSAL Configuration for Azure AD/Entra ID authentication
 * This configuration is used to initialize the MSAL instance for SSO
 */

import type { Configuration } from '@azure/msal-browser';
import { LogLevel, PublicClientApplication } from '@azure/msal-browser';

// Get environment variables with defaults
const AZURE_TENANT_ID = import.meta.env.VITE_AZURE_TENANT_ID || '';
const AZURE_CLIENT_ID = import.meta.env.VITE_AZURE_CLIENT_ID || '';
const REDIRECT_URI = import.meta.env.VITE_SSO_REDIRECT_URI || `${window.location.origin}/callback`;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

/**
 * MSAL configuration object
 * Using PKCE flow for SPA authentication (no client secret needed in frontend)
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`,
    redirectUri: REDIRECT_URI,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'localStorage', // Can be 'sessionStorage' for more security
    storeAuthStateInCookie: false, // Set to true for IE11 or Edge support
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
        }
      },
      logLevel: import.meta.env.DEV ? LogLevel.Verbose : LogLevel.Warning,
    },
  },
};

/**
 * Scopes for initial login request
 * These are the permissions your app is requesting from the user
 */
export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};

/**
 * Scopes for API access token request
 * Add any API-specific scopes here
 */
export const apiRequest = {
  scopes: [`api://${AZURE_CLIENT_ID}/access_as_user`], // Custom API scope if configured
};

/**
 * Create and export the MSAL instance
 * This will be used throughout the application
 */
let msalInstance: PublicClientApplication | null = null;

export const getMsalInstance = (): PublicClientApplication => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
  }
  return msalInstance;
};

/**
 * Initialize MSAL instance
 * Call this on app startup
 */
export const initializeMsal = async (): Promise<PublicClientApplication> => {
  const instance = getMsalInstance();
  await instance.initialize();
  
  // Handle redirect promise (for redirect flow)
  await instance.handleRedirectPromise()
    .then(response => {
      if (response) {
        console.log('MSAL redirect response:', response);
        // Token is handled by MSAL React provider
      }
    })
    .catch(error => {
      console.error('MSAL redirect error:', error);
    });
    
  return instance;
};

/**
 * Check if SSO is configured
 */
export const isSSOConfigured = (): boolean => {
  return !!(AZURE_TENANT_ID && AZURE_CLIENT_ID);
};

/**
 * Get SSO configuration status from backend
 */
export const getSSOConfig = async (): Promise<{
  enabled: boolean;
  configured: boolean;
  provider: string;
  allow_local_auth: boolean;
  auto_redirect: boolean;
}> => {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/sso/config`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch SSO config:', error);
  }
  
  return {
    enabled: false,
    configured: false,
    provider: '',
    allow_local_auth: true,
    auto_redirect: false,
  };
};