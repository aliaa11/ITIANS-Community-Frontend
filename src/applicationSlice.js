import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://c6a0-41-33-92-146.ngrok-free.app/api',
  headers: { 'Content-Type': 'application/json' },
});

export const fetchJobs = createAsyncThunk(
  'application/fetchJobs',
  async ({ page = 1, perPage = 6, search = '', filters = {} }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access-token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const params = {
        page,
        per_page: perPage,
      };
      
      // Add search query as title parameter
      if (search && search.trim()) {
        params.title = search.trim();
      }
      
      // Add filters if they exist and are not empty
      if (filters.job_type && filters.job_type.trim()) {
        params.job_type = filters.job_type.trim();
      }
      if (filters.status && filters.status.trim()) {
        params.status = filters.status.trim();
      }
      if (filters.job_location && filters.job_location.trim()) {
        params.job_location = filters.job_location.trim();
      }
      if (filters.min_salary && !isNaN(parseFloat(filters.min_salary))) {
        params.min_salary = parseFloat(filters.min_salary);
      }
      if (filters.max_salary && !isNaN(parseFloat(filters.max_salary))) {
        params.max_salary = parseFloat(filters.max_salary);
      }
      if (filters.employer_id) {
        params.employer_id = filters.employer_id;
      }
      
      const response = await api.get('/jobs', {
        headers,
        params,
      });

      return response.data;
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  jobs: [],
  loading: false,
  error: null,
  searchQuery: '',
  submittedSearch: '',
  filters: {
    job_type: '',
    status: '',
    job_location: '',
    min_salary: '',
    max_salary: '',
  },
  pagination: {
    currentPage: 1,
    lastPage: 1,
    perPage: 6,
    total: 0,
    from: 0,
    to: 0,
  },
};

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    setSubmittedSearch(state, action) {
      state.submittedSearch = action.payload;
      state.pagination.currentPage = 1;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    setPagination(state, action) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearAll(state) {
      state.searchQuery = '';
      state.submittedSearch = '';
      state.filters = { ...initialState.filters };
      state.pagination = { ...initialState.pagination };
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
     .addCase(fetchJobs.fulfilled, (state, action) => {
  state.loading = false;
  state.jobs = action.payload.data || [];
  const meta = action.payload.meta || {};
  state.pagination = {
    currentPage: meta.current_page || 1,
    lastPage: meta.last_page || 1,
    perPage: meta.per_page || 6,
    total: meta.total || 0,
    from: meta.from || 0,
    to: meta.to || 0,
  };
  state.error = null;
})

      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch jobs';
        state.jobs = [];
      });
  },
});

export const {
  setSearchQuery,
  setSubmittedSearch,
  setFilters,
  setPagination,
  clearAll,
  clearError,
  setError,
} = applicationSlice.actions;

export default applicationSlice.reducer;