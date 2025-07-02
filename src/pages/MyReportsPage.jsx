import React, { useState, useEffect } from 'react'; 
import { useSelector } from 'react-redux';
import ItianNavbar from '../components/ItianNavbar'; 
import EmployerNavbar from '../components/EmployerNavbar';
import { 
  Search, 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  X, 
  Sparkles,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Users,
  Link,
  FileText,
  Briefcase,
  Calendar,
  Star
} from 'lucide-react';

const MyReportsPage = () => {
  const user = useSelector(state => state.user);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [filters, setFilters] = useState({
    status: 'all',
    date_range: 'all',
    search: '',
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [userRole, setUserRole] = useState('');

  const API_BASE_URL = 'http://localhost:8000/api';

  const getAuthToken = () => localStorage.getItem('access-token');

  useEffect(() => {
    if (user && user.role) {
      setUserRole(user.role);
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserRole(parsedUser.role);
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
    }
  }, [user]);

  const apiCall = async (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error('Error response:', errorBody);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody.error || 'Unknown error'}`);
      }
      if (response.status === 204) return {};
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/my-reports`;
      const data = await apiCall(url, { method: 'GET' });
      
      let reportsData = [];
      if (Array.isArray(data.reports)) {
        reportsData = data.reports;
      } else if (Array.isArray(data)) {
        reportsData = data;
      } else {
        console.error('Unexpected API response structure:', data);
      }
      setReports(reportsData);
      
    } catch (error) {
      console.error('Error fetching my reports:', error);
      setError(error.message || 'Error fetching your reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.status, filters.date_range, filters.search]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      handleFilterChange('search', e.target.value);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = filters.status === 'all' || report.report_status === filters.status;
    const matchesDateRange = () => {
      if (filters.date_range === 'all') return true;
      const createdAt = new Date(report.created_at);
      const now = new Date();
      switch (filters.date_range) {
        case 'today': return createdAt.toDateString() === now.toDateString();
        case 'last_7_days': return (now - createdAt) / (1000 * 60 * 60 * 24) <= 7;
        case 'last_30_days': return (now - createdAt) / (1000 * 60 * 60 * 24) <= 30;
        default: return true;
      }
    };
    const matchesSearch = filters.search === '' ||
      (report.content?.toLowerCase().includes(filters.search.toLowerCase()) ||
       report.reporter?.name?.toLowerCase().includes(filters.search.toLowerCase()));
    return matchesStatus && matchesDateRange() && matchesSearch;
  });

  const getPaginatedData = (data, page = 1) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength) => Math.ceil(dataLength / itemsPerPage);

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const getVisiblePages = () => {
      const pages = [];
      const maxVisible = 5;
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
      return pages;
    };
    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>
        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-lg ${
              page === currentPage
                ? 'bg-[#d0443c] text-white'
                : typeof page === 'number'
                ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                : 'text-gray-400 cursor-default'
            }`}
            disabled={typeof page !== 'number'}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  };

  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;
    
    try {
      setActionLoading(true);
      await apiCall(`${API_BASE_URL}/reports/${reportToDelete.report_id}`, { method: 'DELETE' });
      setReports(prevReports => prevReports.filter(report => report.report_id !== reportToDelete.report_id));
      
      if (showDetailsModal && selectedReport?.report_id === reportToDelete.report_id) {
        setShowDetailsModal(false);
        setSelectedReport(null);
      }
      
      setShowDeleteModal(false);
      setReportToDelete(null);
      await fetchMyReports();
    } catch (error) {
      console.error('Error deleting report:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setReportToDelete(null);
  };

  const viewReportDetails = async (reportId) => {
    try {
      const data = await apiCall(`${API_BASE_URL}/reports/${reportId}`);
      setSelectedReport(data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching report details:', error);
    }
  };

  const getStatusBadge = (status) => ({
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Resolved': 'bg-green-100 text-green-800 border-green-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
  }[status] || 'bg-gray-100 text-gray-800 border-gray-200');

  const getStatusIcon = (status) => ({
    'Pending': <Clock className="w-4 h-4" />,
    'Resolved': <CheckCircle className="w-4 h-4" />,
    'Rejected': <XCircle className="w-4 h-4" />,
  }[status] || <AlertCircle className="w-4 h-4" />);

  const getRoleBadge = (role) => ({
    'employer': 'bg-blue-100 text-blue-800 border-blue-200',
    'itian': 'bg-green-100 text-green-800 border-green-200',
  }[role] || 'bg-gray-100 text-gray-800 border-gray-200');

  const getRoleDisplayName = (role) => ({
    'itian': 'Itian',
    'employer': 'Employer',
  }[role] || 'Unknown');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderNavbar = () => {
    if (userRole === 'employer') {
      return <EmployerNavbar />;
    } else if (userRole === 'itian') {
      return <ItianNavbar />;
    }
    return <ItianNavbar />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin animation-delay-150"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 w-8 h-8 animate-pulse" />
        </div>
        <p className="ml-6 text-gray-800 text-xl font-medium animate-pulse">Loading your reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={fetchMyReports}
            className="px-6 py-3 bg-[#d0443c] text-white rounded-lg hover:bg-[#a0302c] transition duration-300 shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      {renderNavbar()}
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reports</h1>
          <p className="text-gray-600">View and manage the reports you've submitted</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex gap-2 flex-wrap md:flex-nowrap md:gap-2 md:mr-4">
              <button
                className={`px-4 py-2 rounded-lg font-medium border ${filters.status === 'all' ? 'bg-[#d0443c] text-white' : 'bg-white text-[#d0443c] border-[#d0443c]'} transition`}
                onClick={() => handleFilterChange('status', 'all')}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium border ${filters.status === 'Pending' ? 'bg-[#d0443c] text-white' : 'bg-white text-[#d0443c] border-[#d0443c]'} transition`}
                onClick={() => handleFilterChange('status', 'Pending')}
              >
                Pending
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium border ${filters.status === 'Resolved' ? 'bg-[#d0443c] text-white' : 'bg-white text-[#d0443c] border-[#d0443c]'} transition`}
                onClick={() => handleFilterChange('status', 'Resolved')}
              >
                Resolved
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium border ${filters.status === 'Rejected' ? 'bg-[#d0443c] text-white' : 'bg-white text-[#d0443c] border-[#d0443c]'} transition`}
                onClick={() => handleFilterChange('status', 'Rejected')}
              >
                Rejected
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <input
                type="text"
                placeholder="Search report content..."
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d0443c] w-full sm:w-64"
                onKeyPress={handleSearch}
                defaultValue={filters.search}
              />
              <select
                value={filters.date_range}
                onChange={(e) => handleFilterChange('date_range', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d0443c] focus:border-transparent w-full sm:w-40"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
              </select>
            </div>
          </div>
          <p className="text-gray-600 mt-2 text-sm">
            Found {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
          </p>
        </div>

        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600">No reports match your search or filter criteria</p>
          </div>
        ) : (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filters.status === 'Pending' ? 'Pending Reports' :
                 filters.status === 'Resolved' ? 'Resolved Reports' :
                 filters.status === 'Rejected' ? 'Rejected Reports' :
                 filters.search ? 'Search Results' : 'All My Reports'}
              </h2>
              <div className="text-sm text-gray-600">
                Page {currentPage} of {getTotalPages(filteredReports.length)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getPaginatedData(filteredReports, currentPage).map((report, index) => (
                <div
                  key={report.report_id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
                >
                  <div className="p-4 pb-2 flex justify-between items-start">
                    <div className="w-8 h-8 bg-[#d0443c] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.report_status)}
                    </div>
                  </div>
                  <div className="px-4 pb-4 text-center flex-grow">
                    <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gray-200 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
                      {report.reporter?.name || 'Deleted User'}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(report.report_status)}`}>
                        {report.report_status}
                      </span>
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      {getRoleDisplayName(report.reporter?.role)}
                    </p>
                    <p className="text-gray-500 text-xs mb-4 line-clamp-2">
                      {report.content}
                    </p>
                    <div className="flex gap-2 mt-auto">
                      <button
                        className="flex-1 flex items-center justify-center bg-[#d0443c] text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-[#a0302c] transition-colors"
                        onClick={() => viewReportDetails(report.report_id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center bg-red-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-red-700 transition-colors"
                        onClick={() => handleDeleteClick(report)}
                        disabled={actionLoading}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination added here */}
            <Pagination
              currentPage={currentPage}
              totalPages={getTotalPages(filteredReports.length)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && reportToDelete && (
          <div className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                <button onClick={cancelDelete} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this report? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Details Modal */}
        {showDetailsModal && selectedReport && (
          <div className="fixed inset-0  bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Report Details</h3>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Reporter Information</h4>
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {selectedReport.reporter?.name || 'Deleted User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(selectedReport.reporter?.role)}`}>
                          {getRoleDisplayName(selectedReport.reporter?.role)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-3 w-5 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Report Content</h4>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.content}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Created At</h4>
                    <p className="text-gray-900">{formatDate(selectedReport.created_at)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                    <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(selectedReport.report_status)}`}>
                      {getStatusIcon(selectedReport.report_status)}
                      <span className="mr-1">{selectedReport.report_status}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReportsPage;