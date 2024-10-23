import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentUser } from '../store/userSlice';
import api from '../api/axios';
import { Container, Typography, Box, Avatar, Button, Snackbar, CircularProgress } from '@mui/material';

const UserProfile = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.user.currentUser);
  const token = useSelector(state => state.auth.token);
  const [file, setFile] = useState(null);
  const [snackbar, setOpenSnackbar] = useState({ open: false, message: '' });
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
      setOpenSnackbar({ open: true, message: 'Please select a valid image file.' });
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Upload the image
      const uploadResponse = await api.post('/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (uploadResponse.data && uploadResponse.data.imageUrl) {
        setImage(uploadResponse.data.imageUrl);
        
        // Update user profile in Redux store
        const userResponse = await api.get('/current-user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        dispatch(setCurrentUser({
          ...userResponse.data,
          profilePicture: uploadResponse.data.imageUrl
        }));

        setOpenSnackbar({ open: true, message: 'Profile picture uploaded successfully' });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setOpenSnackbar({ open: true, message: 'Failed to upload profile picture' });
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
      dispatch(setCurrentUser(response.data));
      
      if (response.data.profilePicture) {
        setImage(response.data.profilePicture);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setOpenSnackbar({ open: true, message: 'Failed to load user profile' });
    } finally {
      setLoadingUserData(false);
    }
  }, [dispatch, token]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loadingUserData) return <CircularProgress />; // Show loading spinner while fetching data

  return (
    <Container>
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar
          src={image || currentUser.profilePicture}
          sx={{ width: 100, height: 100, mb: 2 }}
        />
        <Typography variant="h4" gutterBottom>
          Welcome,  {currentUser.username}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Name: {currentUser.firstName} {currentUser.lastName}<br />
          Email: {currentUser.email}<br />
          Phone: {currentUser.phoneNumber}<br />
        </Typography>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="raised-button-file">
          <Button variant="contained" component="span" sx={{ mt: 2 }}>
            Choose File
          </Button>
        </label>
        <Button 
          onClick={handleUpload} 
          variant="contained" 
          sx={{ mt: 2 }}
          disabled={!file || isLoading}
        >
          {isLoading ? 'Uploading...' : 'Upload Profile Picture'}
        </Button>
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default UserProfile;
