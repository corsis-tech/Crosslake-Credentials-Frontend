import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
} from '@mui/material';
import { AccountCircle, Logout, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AuthStatus: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography
        variant="body2"
        sx={{
          mr: 2,
          display: { xs: 'none', sm: 'block' },
          color: 'text.secondary',
        }}
      >
        {user.username}
      </Typography>
      
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          {user.username.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>
      
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.primary">
            Signed in as
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.username}
          </Typography>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={handleClose}>
          <Person sx={{ mr: 1, fontSize: 20 }} />
          Profile
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1, fontSize: 20 }} />
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AuthStatus;