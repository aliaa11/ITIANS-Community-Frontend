import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchItianProfile = createAsyncThunk(
  'itianProfile/fetchItianProfile',
  async (userId, thunkAPI) => {
    try {
      const token = localStorage.getItem('access-token');
      const response = await axios.get(`/api/itian-profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch ITIAN profile');
    }
  }
);

const itianProfileSlice = createSlice({
  name: 'itianProfile',
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearItianProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItianProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItianProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchItianProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearItianProfile } = itianProfileSlice.actions;
export default itianProfileSlice.reducer;
