import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  isAdmin: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      // Clean the authority string by removing newline
      const authority = user.authorities[0].authority.trim();
      
      // Update state
      state.token = token;
      state.user = {
        ...user,
        authorities: [{
          ...user.authorities[0],
          authority: authority
        }]
      };
      state.isAuthenticated = true;
      state.isAdmin = authority === 'Admin';
      state.error = null;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
    },
    logout: (state) => {
      // Clear state
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.error = null;
      
      // Remove token from localStorage
      localStorage.removeItem('token');
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
});

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.isAdmin;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectToken = (state) => state.auth.token;

export const { 
  setCredentials, 
  logout, 
  setAuthError, 
  setAuthLoading, 
  clearAuthError 
} = authSlice.actions;

// Thunk for initializing auth state
export const initializeAuth = () => (dispatch) => {
  const token = localStorage.getItem('token');
  if (token) {
    // could potentially make an API call here to validate the token
    // and get fresh user data if needed
    dispatch(setAuthLoading(true));
    try {
      // Add token validation logic here if needed
      dispatch(setAuthLoading(false));
    } catch (error) {
      dispatch(logout());
      dispatch(setAuthError('Session expired. Please login again.'));
    }
  }
};

export default authSlice.reducer;