import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Container,
} from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import SSOLoginButton from '../components/SSOLoginButton';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSSO, ssoConfig } = useAuth();
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get the redirect path from location state or default to home
  const from = (location.state as any)?.from?.pathname || '/';
  
  // Check for SSO error in location state
  useEffect(() => {
    const stateError = (location.state as any)?.error;
    if (stateError) {
      setError(stateError);
    }
  }, [location.state]);
  
  // Check if SSO is configured
  useEffect(() => {
    if (ssoConfig && !ssoConfig.configured) {
      setError('SSO is not configured. Please contact your administrator.');
    }
  }, [ssoConfig]);

  
  const handleSSOLogin = async (usePopup = false) => {
    setError('');
    try {
      await loginSSO(usePopup);
      // Navigation will be handled by the SSO callback or MSAL
      if (usePopup) {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error('SSO login error:', err);
      setError(err.message || 'SSO login failed. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            backgroundColor: 'background.paper',
          }}
        >
          <Box
            sx={{
              backgroundColor: 'primary.main',
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Lock sx={{ color: 'white', fontSize: 28 }} />
          </Box>

          <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 500 }}>
            Sign In
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crosslake Credentials System
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* SSO Login - Only Option */}
          <SSOLoginButton
            onLogin={handleSSOLogin}
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || (ssoConfig && !ssoConfig.configured)}
          />
          
          {ssoConfig && !ssoConfig.configured && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Please configure SSO in your environment settings
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginScreen;