import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';
import api from '../api/axios';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Alert,
  CircularProgress
} from '@mui/material';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate input
      if (!username || !password) {
        setError('Please enter both username and password');
        return;
      }

      // Send login request to the backend
      const response = await api.post('/generate-token', { username, password });
      
      // Debug logs
      console.log('Login response:', {
        token: response.data.token,
        user: response.data.user,
        authority: response.data.user?.authorities?.[0]?.authority
      });

      // Check if we have a token
      if (!response.data.token) {
        throw new Error('No token received from server');
      }

      // Clean the authority string (remove newline character)
      const authority = response.data.user?.authorities?.[0]?.authority?.trim();

      // Check if the user is an Admin
      if (authority === 'Admin') {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Dispatch credentials to Redux store
        dispatch(setCredentials({
          token: response.data.token,
          user: {
            ...response.data.user,
            authorities: [{
              ...response.data.user.authorities[0],
              authority: authority
            }]
          }
        }));

        // Configure axios default header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Redirect to Admin Dashboard
        navigate('/admin/dashboard');
      } else {
        setError('You do not have administrator privileges');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Admin Sign In
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
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
            disabled={loading}
            error={!!error}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            error={!!error}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminLogin;