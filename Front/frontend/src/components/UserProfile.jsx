import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentUser } from '../store/userSlice';
import api from '../api/axios';
import { 
  Container, 
  Typography, 
  Box, 
  Avatar, 
  Button, 
  Snackbar, 
  CircularProgress,
  Paper,
  Alert
} from '@mui/material';

const UserProfile = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.user.currentUser);
  const token = useSelector(state => state.auth.token);
  const [file, setFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(true);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setSnackbar({ 
        open: true, 
        message: 'Please select a valid image file.', 
        severity: 'error' 
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    
    try {
      // Store in Redux state instead of uploading to server
      dispatch(setCurrentUser({
        ...currentUser,
        profilePicture: image // Store base64 image directly in Redux state
      }));

      setSnackbar({ 
        open: true, 
        message: 'Profile picture uploaded successfully', 
        severity: 'success' 
      });
      
      setFile(null); // Reset file input
    } catch (error) {
      console.error('Error handling file:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to update profile picture', 
        severity: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = useCallback(async () => {
    setLoadingUserData(true);
    try {
      const response = await api.get('/current-user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Preserve the profile picture from Redux state if it exists
      dispatch(setCurrentUser({
        ...response.data,
        profilePicture: currentUser?.profilePicture || response.data.profilePicture
      }));
      
      if (currentUser?.profilePicture) {
        setImage(currentUser.profilePicture);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to load user profile', 
        severity: 'error' 
      });
    } finally {
      setLoadingUserData(false);
    }
  }, [dispatch, token, currentUser?.profilePicture]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loadingUserData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar
            src={image || currentUser.profilePicture}
            sx={{ width: 200, height: 200, mb: 2 }}
          />
          <Typography variant="h4" gutterBottom>
            Welcome, {currentUser.username}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Name: {currentUser.firstName} {currentUser.lastName}<br />
            Email: {currentUser.email}<br />
            Phone: {currentUser.phoneNumber}<br />
          </Typography>
          
          <Box sx={{ mt: 2, width: '100%' }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <Box display="flex" flexDirection="column" gap={2} alignItems="center">
              <label htmlFor="raised-button-file">
                <Button variant="outlined" component="span" fullWidth>
                  Choose File
                </Button>
              </label>
              <Button 
                onClick={handleUpload} 
                variant="contained" 
                fullWidth
                disabled={!file || isLoading}
              >
                {isLoading ? 'Uploading...' : 'Upload Profile Picture'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile;