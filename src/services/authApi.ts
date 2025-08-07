/**
 * Authentication API Service
 * Handles authentication-related API calls including SSO
 */

import { api } from '../utils/api';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
  user?: {
    username: string;
    email?: string;
    name?: string;
    provider?: string;
  };
}

export interface SSOExchangeRequest {
  azure_id_token: string;
  azure_access_token: string;
  account: {
    username: string;
    email?: string;
    name?: string;
  };
}

export interface SSOConfig {
  enabled: boolean;
  configured: boolean;
  provider: string;
  allow_local_auth: boolean;
  auto_redirect: boolean;
  login_endpoint?: string;
  callback_endpoint?: string;
}

class AuthAPI {
  /**
   * Standard username/password login
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post<LoginResponse>('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.data;
  }

  /**
   * Exchange Azure AD tokens for backend JWT
   */
  async exchangeSSOToken(request: SSOExchangeRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/v1/auth/sso/exchange', request);
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      '/api/v1/auth/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    
    return response.data;
  }

  /**
   * Logout (including SSO logout URL if applicable)
   */
  async logout(): Promise<{ logout_url?: string }> {
    try {
      const response = await api.post<{ logout_url?: string }>('/api/v1/auth/sso/logout');
      return response.data;
    } catch (error) {
      // If SSO logout fails, just return empty
      return {};
    }
  }

  /**
   * Get SSO configuration from backend
   */
  async getSSOConfig(): Promise<SSOConfig> {
    const response = await api.get<SSOConfig>('/api/v1/auth/sso/config');
    return response.data;
  }

  /**
   * Initiate SSO login flow
   */
  async initiateSSOLogin(returnUrl?: string): Promise<{ auth_url: string; state: string }> {
    const params = returnUrl ? `?return_url=${encodeURIComponent(returnUrl)}` : '';
    const response = await api.get<{ auth_url: string; state: string }>(
      `/api/v1/auth/sso/login${params}`
    );
    return response.data;
  }

  /**
   * Handle SSO callback
   */
  async handleSSOCallback(code: string, state: string): Promise<LoginResponse> {
    const params = new URLSearchParams({ code, state });
    const response = await api.get<LoginResponse>(
      `/api/v1/auth/sso/callback?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get current user SSO information
   */
  async getSSOUserInfo(): Promise<any> {
    const response = await api.get('/api/v1/auth/sso/user');
    return response.data;
  }

  /**
   * Validate SSO configuration (admin endpoint)
   */
  async validateSSOConfig(): Promise<any> {
    const response = await api.get('/api/v1/auth/sso/validate');
    return response.data;
  }
}

export const authAPI = new AuthAPI();