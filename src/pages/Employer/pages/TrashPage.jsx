import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployerJobs, deleteJob, restoreJob } from "../jobPostSlice";
import Swal from "sweetalert2";
import { Trash2, RotateCcw, Calendar, MapPin, DollarSign, Clock, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

const TrashPage = () => {
  const dispatch = useDispatch();
  const { jobs, loading, error } = useSelector((state) => state.jobPost);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("deleted_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(6); // Number of jobs to show per page

  useEffect(() => {
    dispatch(fetchEmployerJobs());
  }, [dispatch]);

  // Filter jobs in trash
  const trashedJobs = Array.isArray(jobs)
    ? jobs.filter((job) => job.deleted_at)
    : [];

  // Filter and sort jobs based on search and sort criteria
  const filteredAndSortedJobs = trashedJobs
    .filter(job => 
      job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job_location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "deleted_at") {
        return new Date(b.deleted_at) - new Date(a.deleted_at);
      } else if (sortBy === "job_title") {
        return a.job_title?.localeCompare(b.job_title);
      }
      return 0;
    });

  // Get current jobs for pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredAndSortedJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredAndSortedJobs.length / jobsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handler for permanent delete
  const handlePermanentDelete = (jobId, jobTitle) => {
    Swal.fire({
      title: 'Permanent Deletion',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p style="margin-bottom: 15px;">You are about to permanently delete:</p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-bottom: 15px;">
            <strong style="color: #991b1b;">${jobTitle}</strong>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This action cannot be undone. The job will be removed from your account forever.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<i class="fas fa-trash"></i> Delete Forever',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-custom-popup',
        confirmButton: 'swal-confirm-delete',
        cancelButton: 'swal-cancel-button'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteJob(jobId));
        Swal.fire({
          title: 'Deleted!',
          text: 'The job has been permanently removed.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  // Handler for restore job
  const handleRestore = (jobId, jobTitle) => {
    Swal.fire({
      title: 'Restore Job',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p style="margin-bottom: 15px;">Restore this job to your active listings:</p>
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px; margin-bottom: 15px;">
            <strong style="color: #0369a1;">${jobTitle}</strong>
          </div>
          <p style="color: #6b7280; font-size: 14px;">The job will be moved back to your job list and become visible to candidates.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<i class="fas fa-undo"></i> Restore Job',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(restoreJob(jobId));
        Swal.fire({
          title: 'Restored!',
          text: 'The job has been restored to your job list.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  // Empty trash handler
  const handleEmptyTrash = () => {
    if (trashedJobs.length === 0) return;
    
    Swal.fire({
      title: 'Empty Trash',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p style="margin-bottom: 15px;">This will permanently delete all ${trashedJobs.length} job(s) in trash:</p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-bottom: 15px; max-height: 150px; overflow-y: auto;">
            ${trashedJobs.map(job => `<div style="margin-bottom: 5px; color: #991b1b;">• ${job.job_title}</div>`).join('')}
          </div>
          <p style="color: #6b7280; font-size: 14px;"><strong>Warning:</strong> This action cannot be undone!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Empty Trash',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        trashedJobs.forEach(job => dispatch(deleteJob(job.id)));
        Swal.fire({
          title: 'Trash Emptied!',
          text: 'All jobs have been permanently deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trash</h1>
                <p className="text-sm text-gray-600">
                  {trashedJobs.length} job{trashedJobs.length !== 1 ? 's' : ''} in trash
                </p>
              </div>
            </div>
            
            {trashedJobs.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Empty Trash
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading trashed jobs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Jobs</h3>
            <p className="text-gray-600 mb-4">{error.message || "Something went wrong."}</p>
            <button
              onClick={() => dispatch(fetchEmployerJobs())}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        ) : trashedJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Trash2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trash is Empty</h3>
            <p className="text-gray-600">No deleted jobs found. Jobs will appear here when deleted.</p>
          </div>
        ) : (
          <>
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search trashed jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="deleted_at">Date Deleted</option>
                    <option value="job_title">Job Title</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
                        {job.job_title}
                      </h3>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{job.job_location || "Location not specified"}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Deleted {new Date(job.deleted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="px-6 pb-4">
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="text-gray-900">{job.job_type || "Not specified"}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Salary:
                        </span>
                        <span className="text-gray-900 font-medium">
                          {(job.salary_range_min && job.salary_range_max)
                            ? `${job.salary_range_min} - ${job.salary_range_max} ${job.currency || ""}`
                            : (job.salary_range_min
                                ? `${job.salary_range_min}+ ${job.currency || ""}`
                                : (job.salary_range_max
                                    ? `Up to ${job.salary_range_max} ${job.currency || ""}`
                                    : "Not specified"))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 pb-6">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleRestore(job.id, job.job_title)}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(job.id, job.job_title)}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Forever
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filteredAndSortedJobs.length > jobsPerPage && (
              <div className="flex items-center justify-between mt-8 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstJob + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastJob, filteredAndSortedJobs.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredAndSortedJobs.length}</span> jobs
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === number
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}

            {filteredAndSortedJobs.length === 0 && searchTerm && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your search terms.</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrashPage;