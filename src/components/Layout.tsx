import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthStatus from './AuthStatus';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              cursor: 'pointer',
              fontWeight: 500,
            }}
            onClick={() => navigate('/')}
          >
            Crosslake Credentials
          </Typography>
          
          <AuthStatus />
        </Toolbar>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;