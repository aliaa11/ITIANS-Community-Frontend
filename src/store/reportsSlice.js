// // store/reportsSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// // Base API URL - adjust according to your setup
// const API_BASE_URL = 'http://127.0.0.1:8000/api';

// // Configure axios defaults
// axios.defaults.baseURL = API_BASE_URL;

// // Helper function to get auth headers
// const getAuthHeaders = () => {
//   const token = localStorage.getItem('token');
//   return {
//     'Authorization': `Bearer ${token}`,
//     'Accept': 'application/json',
//     'Content-Type': 'application/json'
//   };
// };

// // Async thunk for fetching reports with filters and pagination
// export const fetchReports = createAsyncThunk(
//   'reports/fetchReports',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const {
//         page = 1,
//         per_page = 12,
//         status = 'all',
//         date_range = 'all',
//         search = '',
//         reporter_type = 'all'
//       } = params;

//       const queryParams = {
//         page,
//         per_page,
//         status,
//         date_range,
//         search,
//         reporter_type
//       };

//       const response = await axios.get('/reports', {
//         params: queryParams,
//         headers: getAuthHeaders()
//       });

//       return response.data;
//     } catch (error) {
//       console.error('Error fetching reports:', error);
//       return rejectWithValue(
//         error.response?.data?.message || error.message || 'Failed to fetch reports'
//       );
//     }
//   }
// );

// // Async thunk for updating report status
// export const updateReportStatus = createAsyncThunk(
//   'reports/updateReportStatus',
//   async ({ reportId, status }, { rejectWithValue }) => {
//     try {
//       const response = await axios.patch(
//         `/reports/${reportId}/status`,
//         { report_status: status },
//         { headers: getAuthHeaders() }
//       );

//       return { reportId, updatedReport: response.data };
//     } catch (error) {
//       console.error('Error updating report status:', error);
//       return rejectWithValue(
//         error.response?.data?.message || error.message || 'Failed to update report status'
//       );
//     }
//   }
// );

// // Async thunk for deleting a report
// export const deleteReport = createAsyncThunk(
//   'reports/deleteReport',
//   async (reportId, { rejectWithValue }) => {
//     try {
//       await axios.delete(`/reports/${reportId}`, {
//         headers: getAuthHeaders()
//       });

//       return reportId;
//     } catch (error) {
//       console.error('Error deleting report:', error);
//       return rejectWithValue(
//         error.response?.data?.message || error.message || 'Failed to delete report'
//       );
//     }
//   }
// );

// // Async thunk for creating a new report
// export const createReport = createAsyncThunk(
//   'reports/createReport',
//   async (reportData, { rejectWithValue }) => {
//     try {
//       const response = await axios.post('/reports', reportData, {
//         headers: getAuthHeaders()
//       });

//       return response.data;
//     } catch (error) {
//       console.error('Error creating report:', error);
//       return rejectWithValue(
//         error.response?.data?.message || error.message || 'Failed to create report'
//       );
//     }
//   }
// );

// // Initial state
// const initialState = {
//   reports: [],
//   pagination: {
//     current_page: 1,
//     per_page: 12,
//     total: 0,
//     last_page: 1
//   },
//   loading: false,
//   actionLoading: false, // For update/delete operations
//   error: null,
//   filters: {
//     status: 'all',
//     date_range: 'all',
//     search: '',
//     reporter_type: 'all'
//   }
// };

// // Create the slice
// const reportsSlice = createSlice({
//   name: 'reports',
//   initialState,
//   reducers: {
//     // Action to update filters
//     setFilters: (state, action) => {
//       state.filters = { ...state.filters, ...action.payload };
//     },
//     // Action to reset filters
//     resetFilters: (state) => {
//       state.filters = {
//         status: 'all',
//         date_range: 'all',
//         search: '',
//         reporter_type: 'all'
//       };
//     },
//     // Action to clear error
//     clearError: (state) => {
//       state.error = null;
//     }
//   },
//   extraReducers: (builder) => {
//     // Fetch reports
//     builder
//       .addCase(fetchReports.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchReports.fulfilled, (state, action) => {
//         state.loading = false;
//         state.reports = action.payload.reports || [];
//         state.pagination = action.payload.pagination || initialState.pagination;
//       })
//       .addCase(fetchReports.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.reports = [];
//       })

//     // Update report status
//     builder
//       .addCase(updateReportStatus.pending, (state) => {
//         state.actionLoading = true;
//         state.error = null;
//       })
//       .addCase(updateReportStatus.fulfilled, (state, action) => {
//         state.actionLoading = false;
//         const { reportId, updatedReport } = action.payload;
        
//         // Update the specific report in the reports array
//         const reportIndex = state.reports.findIndex(
//           report => report.report_id === reportId
//         );
        
//         if (reportIndex !== -1) {
//           state.reports[reportIndex] = updatedReport;
//         }
//       })
//       .addCase(updateReportStatus.rejected, (state, action) => {
//         state.actionLoading = false;
//         state.error = action.payload;
//       })

//     // Delete report
//     builder
//       .addCase(deleteReport.pending, (state) => {
//         state.actionLoading = true;
//         state.error = null;
//       })
//       .addCase(deleteReport.fulfilled, (state, action) => {
//         state.actionLoading = false;
//         const reportId = action.payload;
        
//         // Remove the deleted report from the reports array
//         state.reports = state.reports.filter(
//           report => report.report_id !== reportId
//         );
        
//         // Update total count in pagination
//         if (state.pagination.total > 0) {
//           state.pagination.total -= 1;
//         }
//       })
//       .addCase(deleteReport.rejected, (state, action) => {
//         state.actionLoading = false;
//         state.error = action.payload;
//       })

//     // Create report
//     builder
//       .addCase(createReport.pending, (state) => {
//         state.actionLoading = true;
//         state.error = null;
//       })
//       .addCase(createReport.fulfilled, (state, action) => {
//         state.actionLoading = false;
//         // Optionally add the new report to the beginning of the list
//         state.reports.unshift(action.payload);
//         state.pagination.total += 1;
//       })
//       .addCase(createReport.rejected, (state, action) => {
//         state.actionLoading = false;
//         state.error = action.payload;
//       });
//   }
// });

// // Export actions
// export const { setFilters, resetFilters, clearError } = reportsSlice.actions;

// // Export selectors
// export const selectReports = (state) => state.reports.reports;
// export const selectReportsLoading = (state) => state.reports.loading;
// export const selectActionLoading = (state) => state.reports.actionLoading;
// export const selectReportsError = (state) => state.reports.error;
// export const selectReportsPagination = (state) => state.reports.pagination;
// export const selectReportsFilters = (state) => state.reports.filters;

// // Export reducer
// export default reportsSlice.reducer;