import React from 'react';
import { useSelector } from 'react-redux';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const UserHome = () => {
  const currentUser = useSelector(state => state.user.currentUser);

  return (
    <div>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {currentUser ? currentUser.firstName : 'User'}!
        </Typography>
        <Typography variant="body1" gutterBottom>
          This is your home page where you can manage your account and settings.
        </Typography>
        <Box mt={2}>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/profile" 
            sx={{ textDecoration: 'none' }}
          >
            Go to Profile
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default UserHome;
