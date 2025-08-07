/**
 * SSO Login Button Component
 * Provides a button to initiate Azure AD SSO login
 */

import React, { useState } from 'react';
import { Button, CircularProgress, Box, Typography } from '@mui/material';
import { Business, Login } from '@mui/icons-material';

interface SSOLoginButtonProps {
  onLogin: (usePopup?: boolean) => Promise<void>;
  fullWidth?: boolean;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  usePopup?: boolean;
  className?: string;
}

const SSOLoginButton: React.FC<SSOLoginButtonProps> = ({
  onLogin,
  fullWidth = true,
  variant = 'outlined',
  size = 'large',
  disabled = false,
  usePopup = false,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onLogin(usePopup);
    } catch (err: any) {
      console.error('SSO login error:', err);
      setError(err.message || 'SSO login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className={className}>
      <Button
        variant={variant}
        fullWidth={fullWidth}
        size={size}
        onClick={handleClick}
        disabled={disabled || isLoading}
        startIcon={isLoading ? null : <Business />}
        sx={{
          py: size === 'large' ? 1.5 : 1,
          fontSize: size === 'large' ? '1rem' : '0.875rem',
          fontWeight: 500,
          borderColor: variant === 'outlined' ? 'primary.main' : undefined,
          color: variant === 'outlined' ? 'primary.main' : undefined,
          '&:hover': {
            borderColor: variant === 'outlined' ? 'primary.dark' : undefined,
            backgroundColor: variant === 'outlined' ? 'rgba(0, 102, 204, 0.04)' : undefined,
          },
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Sign in with Microsoft'
        )}
      </Button>
      
      {error && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 1, display: 'block', textAlign: 'center' }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default SSOLoginButton;