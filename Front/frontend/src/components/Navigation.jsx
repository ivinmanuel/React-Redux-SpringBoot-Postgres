import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { logout } from '../store/authSlice';
import api from '../api/axios';

const Navigation = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const isAdmin = useSelector(state => state.auth.isAdmin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    
    try {
      // Make the logout API call - no need to manually add headers since interceptor handles it
      await api.post('/auth/logout');
      
      // Clear localStorage
      localStorage.removeItem('token');
      
      // Update Redux state
      dispatch(logout());
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      
      // If we get a 401 error or any other error, we should still logout locally
      localStorage.removeItem('token');
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My App
        </Typography>
        {isAuthenticated ? (
          <>
            {isAdmin ? (
              <Button color="inherit" component={RouterLink} to="/admin/dashboard">
                Dashboard
              </Button>
            ) : (
              <Button color="inherit" component={RouterLink} to="/home">
                Home
              </Button>
            )}
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <Box>
            <Button color="inherit" component={RouterLink} to="/login">Login</Button>
            <Button color="inherit" component={RouterLink} to="/register">Register</Button>
            <Button color="inherit" component={RouterLink} to="/admin/login">Admin Login</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;