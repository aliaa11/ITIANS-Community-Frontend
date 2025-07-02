// src/store/itianSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch itian profile
export const fetchItianProfile = createAsyncThunk(
  'itian/fetchProfile',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('access-token');
      const response = await axios.get('http://localhost:8000/api/itian-profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to load profile');
    }
  }
);

const itianSlice = createSlice({
  name: 'itian',
  initialState: {
    user: null,
    isLoading: true,
    error: null
  },
  reducers: {
    logoutItian: (state) => {
      state.user = null;
      localStorage.removeItem('access-token');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItianProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchItianProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchItianProfile.rejected, (state, action) => {
        state.user = null;
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { logoutItian } = itianSlice.actions;
export default itianSlice.reducer;
