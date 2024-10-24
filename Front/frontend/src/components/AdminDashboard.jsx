import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUsers, updateUser, deleteUser } from '../store/userSlice';
import api from '../api/axios';
import { 
  Container, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, Box
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { Search } from 'lucide-react';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const users = useSelector(state => state.user.users);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState({ username: '', firstName: '', lastName: '', email: '', phoneNumber: '', password: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
 // Filter users based on search query
const filteredUsers = users.filter(user => 
  user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())
);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await api.get('/getAll', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        dispatch(setUsers(response.data));
      } else {
        setError('No data received from server');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        setError('Authentication error. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditedUser({
      id: user.id, // Make sure to include the ID
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: ''
    });
    setIsCreating(false);
    setOpenDialog(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setEditedUser({ username: '', firstName: '', lastName: '', email: '', phoneNumber: '', password: '' });
    setIsCreating(true);
    setOpenDialog(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      await api.put('/deleteUser', userId, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      dispatch(deleteUser(userId));
      setError('');
    } catch (error) {
      console.error('Delete error:', error);
      setError(
        error.response?.data?.message || 
        'Failed to delete user. Please try again.'
      );
    }
  };

  const handleSave = async () => {
    try {
      if (!editedUser.username || !editedUser.email) {
        setError('Username and email are required');
        return;
      }
  
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        navigate('/login');
        return;
      }
  
      let response; // Declare response variable
  
      if (isCreating) {
        if (!editedUser.password) {
          setError('Password is required for new users');
          return;
        }
  
        // Make API call to create a new user
        response = await api.post('/create', editedUser, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
  
        // Add the new user to the Redux store
        dispatch(setUsers([...users, response.data]));
  
      } else {
        // Prepare the data to update the existing user
        const updateData = {
          id: selectedUser.id,
          username: editedUser.username,
          firstName: editedUser.firstName,
          lastName: editedUser.lastName,
          email: editedUser.email,
          phoneNumber: editedUser.phoneNumber,
          ...(editedUser.password ? { password: editedUser.password } : {}) // Only include the password if it's updated
        };
  
        console.log('Updated data:', updateData);
  
        // Send update request to the server
        response = await api.put('/updateUser', updateData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
  
        // Ensure the response is handled properly
        if (response.data) {
          // Update the specific user in the Redux store
          dispatch(updateUser({
            id: selectedUser.id,
            ...response.data // Use response from the server to update Redux store
          }));
        }
      }
      console.log('response data:', response.data);
      setOpenDialog(false);
      setError('');
    } catch (error) {
      console.error('Save error:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to save user');
      }
    }
  };
  

  const handleRefresh = () => {
    fetchUsers();
  };

  const generateUniqueKey = (user) => {
    return `user-${user.id}-${user.username}`; // Using both id and username for uniqueness
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              onClick={handleCreate} 
              variant="contained" 
              color="primary"
            >
              Create New User
            </Button>
            
            <Button 
              onClick={handleRefresh}
              variant="outlined"
            >
              Refresh List
            </Button>
          </Box>

          <TextField
            placeholder="Search by firstname..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ width: '300px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer 
            component={Paper} 
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              '& .MuiTable-root': {
                borderCollapse: 'separate',
                borderSpacing: 0,
              },
              '& .MuiTableHead-root': {
                position: 'sticky',
                top: 0,
                zIndex: 1,
                backgroundColor: 'background.paper',
              },
              '& .MuiTableHead-root .MuiTableCell-root': {
                borderBottom: '2px solid rgba(224, 224, 224, 1)',
              }
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Number</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={generateUniqueKey(user)}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : "Name not available"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phoneNumber || "Phone not available"}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            onClick={() => handleEdit(user)}
                            variant="outlined"
                            size="small"
                          >
              Edit
            </Button>
            <Button 
              onClick={() => handleDelete(user.id)}
              variant="outlined"
              color="error"
              size="small"
            >
              Delete
            </Button>
          </Box>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={6} align="center">
        No users found
      </TableCell>
    </TableRow>
  )}
</TableBody>

            </Table>
          </TableContainer>
        )}

        <Dialog 
          open={openDialog} 
          onClose={() => {
            setOpenDialog(false);
            setError('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {isCreating ? 'Create New User' : 'Edit User'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Username"
              fullWidth
              value={editedUser.username}
              onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Firstname"
              fullWidth
              value={editedUser.firstName}
              onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Lastname"
              fullWidth
              value={editedUser.lastName}
              onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={editedUser.email}
              onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Phone"
              fullWidth
              value={editedUser.phoneNumber}
              onChange={(e) => setEditedUser({ ...editedUser, phoneNumber: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              value={editedUser.password}
              onChange={(e) => setEditedUser({ ...editedUser, password: e.target.value })}
              required={isCreating}
              helperText={isCreating ? 'Password is required for new users' : 'Leave blank to keep current password'}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenDialog(false);
              setError('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained">
              {isCreating ? 'Create' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminDashboard;