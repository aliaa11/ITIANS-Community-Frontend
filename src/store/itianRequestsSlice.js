import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchItianRequests = createAsyncThunk(
  'itianRequests/fetchItianRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/itian-registration-requests');
      console.log('Fetched ITIAN requests:', response);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const itianRequestsSlice = createSlice({
  name: 'itianRequests',
  initialState: {
    requests: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItianRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItianRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchItianRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch requests';
      });
  },
});

export default itianRequestsSlice.reducer;
