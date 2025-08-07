/**
 * SSO Callback Component
 * Handles the OAuth2 redirect callback from Azure AD
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper, Alert } from '@mui/material';
import { getMsalInstance } from '../config/msalConfig';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const SSOCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // We'll need to update this to handle SSO
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const msalInstance = getMsalInstance();
        
        // Handle the redirect promise
        const response = await msalInstance.handleRedirectPromise();
        
        if (response) {
          // Successfully authenticated with Azure AD
          console.log('SSO authentication successful:', response);
          
          // Exchange Azure AD token for backend JWT
          const exchangeResponse = await api.post('/api/v1/auth/sso/exchange', {
            azure_token: response.idToken,
            access_token: response.accessToken,
            account: {
              username: response.account?.username || response.account?.localAccountId,
              email: response.account?.username, // Usually email in Azure AD
              name: response.account?.name,
            }
          });

          const { access_token, refresh_token } = exchangeResponse.data;

          // Store tokens
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          
          // Set authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

          // Get return URL from state or default to home
          const returnUrl = response.state ? 
            JSON.parse(response.state).returnUrl || '/' : '/';
          
          // Navigate to the return URL
          navigate(returnUrl, { replace: true });
        } else {
          // Check if we have error parameters in the URL
          const urlParams = new URLSearchParams(location.search);
          const errorParam = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');
          
          if (errorParam) {
            throw new Error(errorDescription || errorParam);
          }
          
          // No response and no error - might be a direct navigation to callback
          console.log('No SSO response, redirecting to login');
          navigate('/login', { replace: true });
        }
      } catch (err: any) {
        console.error('SSO callback error:', err);
        setError(err.message || 'Failed to complete SSO authentication');
        
        // Redirect to login after showing error
        setTimeout(() => {
          navigate('/login', { 
            replace: true,
            state: { error: err.message || 'SSO authentication failed' }
          });
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {isProcessing ? (
          <>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Completing Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we complete your authentication...
            </Typography>
          </>
        ) : error ? (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Redirecting to login page...
            </Typography>
          </>
        ) : (
          <>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Authentication Successful
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting...
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SSOCallback;