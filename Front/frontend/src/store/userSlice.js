import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    users: [],
    currentUser: null,
  },
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    updateUser: (state, action) => {
      const updatedUser = action.payload;
      state.users = state.users.map(user => 
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      );
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
  },
});

export const { setUsers, setCurrentUser, updateUser, deleteUser } = userSlice.actions;
export default userSlice.reducer;