import { useState, useEffect } from "react";
import JobCard from "../components/JobCard";
import Filters from "../components/Filters";
import axios from "axios";
import "../css/JobsPage.css";
import "../css/Pagination.css";
import { Sparkles, Search } from 'lucide-react'; 
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchJobs,
  setSearchQuery,
  setSubmittedSearch,
  setFilters,
  setPagination,
  clearAll,
} from '../applicationSlice';

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const JobsPage = () => {
  const dispatch = useDispatch();
  const {
    jobs,
    loading,
    error,
    searchQuery,
    submittedSearch,
    filters,
    pagination,
  } = useSelector((state) => state.application);

  useEffect(() => {
    dispatch(fetchJobs({
      page: pagination.currentPage,
      perPage: pagination.perPage,
      search: submittedSearch,
      filters,
      sort: '-posted_date'
    }));
  }, [pagination.currentPage, pagination.perPage, filters, submittedSearch, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === '') return;
    dispatch(setSubmittedSearch(searchQuery));
    dispatch(setPagination({ currentPage: 1 }));
  };

  const handleFilter = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(setPagination({ currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.lastPage) {
      dispatch(setPagination({ currentPage: page }));
    }
  };

  const handleClearAll = () => {
    dispatch(clearAll());
    dispatch(setSearchQuery(''));
    dispatch(setSubmittedSearch(''));
    dispatch(fetchJobs({
      page: 1,
      perPage: pagination.perPage,
      search: '',
      filters: {
        job_type: '',
        status: '',
        job_location: '',
        min_salary: '',
        max_salary: '',
      },
      sort: '-posted_date'
    }));
  };

  if (loading && pagination.currentPage === 1) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin animation-delay-150"></div>
        <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 w-8 h-8 animate-pulse" />
      </div>
      <p className="ml-6 text-gray-800 text-xl font-medium animate-pulse">Loading Jobs...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-icon">!</div>
      <p>Error: {error}</p>
    </div>
  );

  return (
    <div className="jobs-page">
      <div className="page-header">
        <h1 className="page-title">Find Your Dream Job</h1>
        <form onSubmit={handleSearch} className="search-bar">
          <div className="search-input-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by job title..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="search-input"
            />
            <button 
              type="submit" 
              className="search-button"
              disabled={!searchQuery.trim()}
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="jobs-content">
        <Filters onFilter={handleFilter} currentFilters={filters} />

        <div className="jobs-list-container">
          

          <div className="jobs-list">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <div className="no-jobs">
                <div className="no-jobs-icon">😕</div>
                <p>No jobs match your search criteria</p>
                <button
                  onClick={handleClearAll}
                  className="clear-all-btn"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {pagination.total > 0 && pagination.lastPage > 1 && (
            <div className="pagination-container">
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="pagination-btn prev"
                >
                  Previous
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
                    let pageNum;
                    if (pagination.lastPage <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.lastPage - 2) {
                      pageNum = pagination.lastPage - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`pagination-btn ${pagination.currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.lastPage}
                  className="pagination-btn next"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
