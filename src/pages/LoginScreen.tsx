import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import SSOLoginButton from '../components/SSOLoginButton';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginSSO, isSSOEnabled, ssoConfig } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLocalAuth, setShowLocalAuth] = useState(true);

  // Get the redirect path from location state or default to home
  const from = (location.state as any)?.from?.pathname || '/';
  
  // Check for SSO error in location state
  useEffect(() => {
    const stateError = (location.state as any)?.error;
    if (stateError) {
      setError(stateError);
    }
  }, [location.state]);
  
  // Update local auth visibility based on SSO config
  useEffect(() => {
    if (ssoConfig) {
      setShowLocalAuth(ssoConfig.allow_local_auth || !ssoConfig.configured);
    }
  }, [ssoConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
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
          
          {/* SSO Login Option */}
          {isSSOEnabled && (
            <>
              <SSOLoginButton
                onLogin={handleSSOLogin}
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
              />
              
              {showLocalAuth && (
                <>
                  <Divider sx={{ my: 2, width: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>
                </>
              )}
            </>
          )}

          {/* Local Authentication Form */}
          {showLocalAuth && (
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || !username || !password}
              sx={{
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Default credentials hint for development */}
            {import.meta.env.DEV && (
              <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 2, display: 'block' }}>
                Dev credentials: admin / Crosslake348!
              </Typography>
            )}
          </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginScreen;