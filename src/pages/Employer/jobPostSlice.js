// features/jobPost/jobPostSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Update API base URL - make sure this matches your Laravel backend URL
const API_BASE_URL = 'http://localhost:8000/api'; // Adjust port if different

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const text = await response.text();
  
  let data;
  if (contentType && contentType.includes('application/json')) {
      data = JSON.parse(text);
  } else {
    data = text;
  }

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || 'Request failed',
      errors: data.errors || {},
      data: data
    };
  }

  return data;
};

export const postJob = createAsyncThunk(
  'jobPost/postJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const formattedData = {
        job_title: jobData.job_title,
        description: jobData.description,
        requirements: jobData.requirements || '',
        qualifications: jobData.qualifications || '',
        job_location: jobData.job_location || 'Remote',
        job_type: jobData.job_type || 'Full-time',
        status: jobData.status || 'Open',
        salary_range_min: jobData.salary_range_min || null,
        salary_range_max: jobData.salary_range_max || null,
        currency: jobData.currency || 'EGP',
        application_deadline: jobData.application_deadline || null
      };

      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });

      const data = await handleApiResponse(response);
      return data;
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Network error occurred',
        status: error.status,
        errors: error.errors || {}
      });
    }
  }
);

export const fetchJobs = createAsyncThunk(
  'jobPost/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await handleApiResponse(response);
      return Array.isArray(data) ? data : (data.data || data.jobs || []);
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch jobs',
        status: error.status
      });
    }
  }
);

export const fetchEmployerJobs = createAsyncThunk(
  'jobPost/fetchEmployerJobs',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/employer/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await handleApiResponse(response);
      return Array.isArray(data) ? data : (data.data || data.jobs || []);
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch employer jobs',
        status: error.status
      });
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobPost/deleteJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      await handleApiResponse(response);
      return jobId;
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Failed to delete job',
        status: error.status
      });
    }
  }
);

export const editJob = createAsyncThunk(
  'jobPost/editJob',
  async ({ jobId, jobData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('Sending update for job:', jobId, 'with data:', jobData); // Debug log

      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      const data = await handleApiResponse(response);
      console.log('Update response:', data); // Debug log
      return { id: jobId, ...data };
    } catch (error) {
      console.error('Error in editJob:', error); // Debug log
      return rejectWithValue({
        message: error.message || 'Failed to edit job',
        status: error.status,
        errors: error.errors || {}
      });
    }
  }
);

export const restoreJob = createAsyncThunk(
  'jobPost/restoreJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await handleApiResponse(response);
      return data;
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Failed to restore job',
        status: error.status
      });
    }
  }
);
export const fetchJobById = createAsyncThunk(
  'jobPost/fetchJobById',
  async (jobId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access-token');
      console.log('Fetching job with ID:', jobId); // Debug log
      
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status); // Debug log
      const data = await handleApiResponse(response);
      console.log('Received data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error in fetchJobById:', error); // Debug log
      return rejectWithValue({
        message: error.message || 'Failed to fetch job',
        status: error.status
      });
    }
  }
);

export const fetchEmployerData = createAsyncThunk(
  'jobPost/fetchEmployerData',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const [jobsResponse, profileResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/employer/jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/employer-profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
      ]);

      const jobsData = await handleApiResponse(jobsResponse);
      const profileData = await handleApiResponse(profileResponse);

      return {
        jobs: Array.isArray(jobsData) ? jobsData : (jobsData.data || jobsData.jobs || []),
        company: profileData
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch employer data',
        status: error.status
      });
    }
  }
);

const jobPostSlice = createSlice({
  name: 'jobPost',
  initialState: {
    loading: false,
    error: null,
    success: false,
    jobs: [],
    jobDetails: null,
    employerData: null
  },
  reducers: {
    resetJobState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearJobDetails: (state) => {
      state.jobDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Post Job
      .addCase(postJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(postJob.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(postJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Jobs
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

      // Fetch Employer Jobs
      .addCase(fetchEmployerJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployerJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchEmployerJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Job
      .addCase(deleteJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = state.jobs.filter(job => job.id !== action.payload);
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Edit Job
      .addCase(editJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = state.jobs.map(job => 
          job.id === action.payload.id ? action.payload : job
        );
        if (state.jobDetails?.id === action.payload.id) {
          state.jobDetails = action.payload;
        }
      })
      .addCase(editJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Restore Job
      .addCase(restoreJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = state.jobs.map(job =>
          job.id === action.payload.id ? action.payload : job
        );
      })
      .addCase(restoreJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Job By ID
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.jobDetails = action.payload.data; // تغيير من currentJob إلى jobDetails
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Employer Data
      .addCase(fetchEmployerData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployerData.fulfilled, (state, action) => {
          const { jobs, company } = action.payload;

          state.jobs = jobs.map(job => ({
            ...job,
            company_name: company?.company_name || 'Unknown Company'
          }));
          state.loading = false;
          state.error = null;
    })
      .addCase(fetchEmployerData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetJobState, clearJobDetails } = jobPostSlice.actions;
export default jobPostSlice.reducer;