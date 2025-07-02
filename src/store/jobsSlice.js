import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch all jobs
export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('access-token');
    const response = await axios.get('http://127.0.0.1:8000/api/jobs', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// Async thunk to delete a job
export const deleteJob = createAsyncThunk('jobs/deleteJob', async (jobId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('access-token');
    await axios.delete(`http://127.0.0.1:8000/api/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return jobId;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = state.jobs.filter((job) => job.id !== action.payload);
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default jobsSlice.reducer;
