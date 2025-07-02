import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MapPin, Clock, DollarSign, Calendar, FileText, 
  Award, Briefcase, ArrowLeft, Users, 
  CheckCircle, AlertCircle, Building, Sparkles
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchJobById } from '../jobPostSlice';

const JobDetails = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, jobDetails } = useSelector(state => state.jobPost);
  
  // Debug logging
  console.log('Redux State:', { loading, error, jobDetails });
  
  const job = jobDetails;

  useEffect(() => {
    if (id) {
      console.log('Fetching job with ID:', id);
      dispatch(fetchJobById(id))
        .unwrap()
        .then(data => {
          console.log('Job fetched successfully:', data);
        })
        .catch(error => {
          console.error('Failed to fetch job:', error);
        });
    }
  }, [dispatch, id]);
    
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'from-green-500 to-green-600';
      case 'closed': return 'from-gray-600 to-gray-700';
      case 'draft': return 'from-yellow-400 to-yellow-500';
      default: return 'from-red-400 to-red-500';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Enhanced loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
             <div className="relative">
               <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
               <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin animation-delay-150"></div>
               <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 w-8 h-8 animate-pulse" />
             </div>
             <p className="ml-6 text-gray-800 text-xl font-medium animate-pulse">Loading job details...</p>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-lg p-8 text-center max-w-md shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Job</h2>
          <p className="text-red-600 mb-4">{error?.message || 'An error occurred while fetching job details'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Enhanced not found state
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-md shadow-sm">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-700 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/employer/jobs')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  // Extract salary information with fallbacks
  const salaryMin = job.salary_range?.min || job.salary_range_min || 'N/A';
  const salaryMax = job.salary_range?.max || job.salary_range_max || 'N/A';
  const currency = job.salary_range?.currency || job.currency || 'EGP';
  const company = job.employer?.name || job.company || 'Company Name';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Jobs</span>
          </button>

          <div className="bg-white rounded-lg border border-red-200 shadow-sm">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600 font-medium">{company}</span>
                  </div>
                  
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {job.job_title || 'Job Title'}
                  </h1>
                  
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    {job.description || 'No description available'}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 font-medium">{job.job_location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 font-medium">{job.job_type || 'Type not specified'}</span>
                    </div>
                    <div className={`flex items-center gap-2 bg-gradient-to-r ${getStatusColor(job.status)} rounded-full px-4 py-2 shadow-lg`}>
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span className="text-white font-medium capitalize">{job.status || 'Status unknown'}</span>
                    </div>
                  </div>
                </div>

                {/* Salary Card */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 min-w-[240px] text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <DollarSign className="w-6 h-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-900">Salary Range</h3>
                  </div>
                  <p className="text-2xl font-bold text-red-900 mb-1">
                    {salaryMin === 'N/A' && salaryMax === 'N/A' ? 
                      'Not specified' : 
                      `${Number(salaryMin).toLocaleString()} - ${Number(salaryMax).toLocaleString()}`
                    }
                  </p>
                  <p className="text-red-700 text-sm font-medium">{currency}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Requirements */}
          <div className="bg-white border border-red-200 rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Requirements</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {job.requirements || 'No specific requirements listed'}
              </p>
            </div>
          </div>

          {/* Qualifications */}
          <div className="bg-white border border-red-200 rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Qualifications</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {job.qualifications || 'No specific qualifications listed'}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white border border-red-200 rounded-lg shadow-sm mb-8">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Timeline</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Posted Date</p>
                  <p className="text-gray-900 font-semibold">
                    {formatDate(job.posted_date)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Application Deadline</p>
                  <p className="text-gray-900 font-semibold">
                    {formatDate(job.application_deadline)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Stats */}
        <div className="bg-white border border-red-200 rounded-lg shadow-sm mb-8">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Job Statistics</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{job.views_count || 0}</p>
                <p className="text-sm text-gray-600">Views</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={() => navigate(`/employer/job/${id}/applications`)}
            className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <Users className="w-5 h-5" />
            <span>View Applications</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;