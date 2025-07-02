import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/axios';
import userLogout from '../hooks/useLogout';
// Helper function to load initial state from localStorage
const loadInitialState = () => {
  const storedUser = sessionStorage.getItem('userState'); // Using sessionStorage for better security
  return storedUser 
    ? JSON.parse(storedUser) 
    : {
        user: null,
        role: null,
        loading: true,
        itianProfile: null,
        employerProfile: null,
        isLoading: true,

      };
};

const userSlice = createSlice({
  name: 'user',
  initialState: loadInitialState(),
  reducers: {
    setUser: (state, action) => {
      const payload = action.payload;
      state.user = payload;
      state.role = payload?.role || null;
      state.loading = false;
      state.itianProfile = payload.itian_profile || null;
      state.employerProfile = payload.employer_profile || null;
      
      // Persist to sessionStorage (auto-clears when tab closes)
      sessionStorage.setItem('userState', JSON.stringify(state));
    },
    clearUser: (state) => {
      state.user = null;
      state.role = null;
      state.loading = false;
      state.itianProfile = null;
      state.employerProfile = null;
      sessionStorage.removeItem('userState');
    },
    setRole: (state, action) => {
      state.role = action.payload;
      sessionStorage.setItem('userState', JSON.stringify(state));
    },
    setUserLoading: (state, action) => {
      state.loading = action.payload;
      // Don't persist loading state
    },
        setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('access-token');
      localStorage.removeItem('user-id');
    },
  },
});

export const { setUser, clearUser, setRole, setUserLoading, setLoading, logout } = userSlice.actions;
export default userSlice.reducer;


