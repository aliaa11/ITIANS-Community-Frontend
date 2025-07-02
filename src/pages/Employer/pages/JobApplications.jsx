import { Sparkles, ChevronLeft, Star, Award, MapPin, Download, Eye, X, AlertCircle, Calendar, Mail, Phone, User, Bookmark, Info, MessageCircle, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import 'react-toastify/dist/ReactToastify.css';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';


const JobApplications = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [openCoverLetter, setOpenCoverLetter] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const MySwal = withReactContent(Swal);
const navigate = useNavigate();


const handleViewCV = (cvPath) => {
  const fullUrl = `http://localhost:8000/storage/${cvPath}`;
  
  MySwal.fire({
    title: 'CV Preview',
    html: `
      <div style="position: relative;">
        <button 
          id="closeCvBtn"
          style="
            position: absolute; 
            top: -10px; 
            right: -10px; 
            background: #ff4757; 
            color: white; 
            border: none; 
            border-radius: 50%; 
            width: 30px; 
            height: 30px; 
            cursor: pointer; 
            font-size: 18px; 
            font-weight: bold;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: background 0.3s ease;
          "
        >
          ×
        </button>
        <iframe
          src="${fullUrl}"
          title="CV Preview"
          width="100%"
          height="600px"
          style="border: 1px solid #ddd; border-radius: 8px;"
        ></iframe>
      </div>
    `,
    width: '90%',
    showConfirmButton: false,
    showCloseButton: false,
    allowOutsideClick: true,
    allowEscapeKey: true,
    customClass: {
      popup: 'cv-preview-popup'
    },
    didOpen: () => {
      // إضافة styles مخصصة للـ popup
      const popup = MySwal.getPopup();
      popup.style.padding = '20px';
      popup.style.borderRadius = '12px';
      popup.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
      
      // إضافة event listener لزر الإغلاق
      const closeBtn = document.getElementById('closeCvBtn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          MySwal.close();
        });
        
        // إضافة hover effects
        closeBtn.addEventListener('mouseover', () => {
          closeBtn.style.background = '#ff3742';
        });
        
        closeBtn.addEventListener('mouseout', () => {
          closeBtn.style.background = '#ff4757';
        });
      }
    }
  });
};
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // 8 cards per page (3x4 grid)

  const ApplicationCard = ({ app, index, onViewMore, onViewProfile = false }) => {
    const getStatusInfo = (status) => {
      switch (status) {
        case 'approved':
          return {
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            shadowColor: 'hover:shadow-green-100',
            badgeColor: 'bg-green-100 text-green-700',
            icon: <CheckCircle className="w-5 h-5 text-green-600" />,
            headerBg: 'bg-green-600',
            actionBg: 'bg-green-600 hover:bg-green-700'
          };
        case 'rejected':
          return {
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            shadowColor: 'hover:shadow-red-100',
            badgeColor: 'bg-red-100 text-red-700',
            icon: <XCircle className="w-5 h-5 text-red-600" />,
            headerBg: 'bg-red-600',
            actionBg: 'bg-red-600 hover:bg-red-700'
          };
        default:
          return {
            bgColor: 'bg-white',
            borderColor: 'border-gray-200',
            shadowColor: 'hover:shadow-md',
            badgeColor: 'bg-yellow-100 text-yellow-700',
            icon: <Clock className="w-5 h-5 text-yellow-600" />,
            headerBg: 'bg-red-600',
            actionBg: 'bg-red-600 hover:bg-red-700'
          };
      }
    };

    const statusInfo = getStatusInfo(app.status);

    return (
      <div className={`${statusInfo.bgColor} rounded-xl shadow-sm ${statusInfo.shadowColor} transition-all duration-200 border ${statusInfo.borderColor} overflow-hidden h-full flex flex-col`}>
        {/* Card Header */}
        <div className="flex justify-between items-start p-4 pb-2">
          <div className={`w-8 h-8 ${statusInfo.headerBg} rounded-full flex items-center justify-center`}>
            <span className="text-white text-sm font-bold">{index + 1}</span>
          </div>
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <Bookmark className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="px-4 pb-4 text-center flex-grow">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden bg-gray-200 flex items-center justify-center">
            {app.itian && app.itian.profile_picture ? (
              <img
                src={`http://localhost:8000/storage/${app.itian.profile_picture}`}
                alt={`${app.itian.first_name} ${app.itian.last_name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-red-600" />
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
            {app.itian ? `${app.itian.first_name} ${app.itian.last_name}` : (app.applicant_name || app.user?.name || `Applicant #${app.iti_id || app.id}`)}
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusInfo.badgeColor}`}>
              {app.status === 'approved' ? 'Approved' :
                app.status === 'rejected' ? 'Rejected' :
                'Pending'}
            </span>
          </h3>

          <p className="text-gray-600 text-sm mb-1">
            {app.itian?.iti_track || app.university || 'Centurion University'}
          </p>

          <div className="flex items-center justify-center text-gray-500 text-xs mb-4">
            <MapPin className="w-3 h-3 mr-1" />
            {app.location || 'Location'}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            {app.status !== 'approved' && app.status !== 'rejected' && (
            <button
              className={`flex-1 flex items-center justify-center ${statusInfo.actionBg} text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
              onClick={onViewMore}
            >
              <Info className="w-4 h-4 mr-1" />
              Details
            </button>
          )}

            <button
              className="flex-1 flex items-center justify-center bg-gray-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
              onClick={onViewProfile}
            >
              <User className="w-4 h-4 mr-1" />
              Profile
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Pagination Component
  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
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
                ? 'bg-red-600 text-white'
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

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access-token");

        // Fetch job title
        const jobRes = await axios.get(`http://localhost:8000/api/jobs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          }
        });
        if (jobRes.status === 200) {
          const jobData = jobRes.data;
          setJobTitle(jobData.data?.job_title || "");
        }

        // Fetch applications
        const response = await axios.get(`http://localhost:8000/api/job/${id}/applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          }
        });
        let data = response.data;
        let apps = [];
        if (Array.isArray(data)) {
          apps = data;
        } else if (Array.isArray(data.data)) {
          apps = data.data;
        } else if (data && typeof data === 'object') {
          apps = [data];
        }
        setApplications(apps);
        console.log("Fetched applications:", apps);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [id]);

  const STATUS_MAP = {
    accepted: 'approved',
    rejected: 'rejected',
    pending: 'pending',
  };

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const normalizeStatus = (status) => {
    if (!status) return 'pending';
    status = status.toLowerCase();
    if (status === 'approved') return 'approved';
    if (status === 'rejected') return 'rejected';
    return 'pending';
  };

  const filteredApplications = applications.filter(app => {
    const status = normalizeStatus(app.status);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesSearch =
      (app.itian?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.itian?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.iti_id?.toString().includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const getPaginatedData = (data, page = 1) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength) => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const handleStatusChange = async (appId, status) => {
    try {
      const backendStatus = STATUS_MAP[status] || status;
      const token = localStorage.getItem("access-token");

      // Send status update (Laravel handles sending the email if approved)
      await axios.patch(
        `http://localhost:8000/api/job-application/${appId}/status`,
        { status: backendStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      // Update state
      setApplications(apps =>
        apps.map(app =>
          app.id === appId ? { ...app, status: backendStatus } : app
        )
      );
      setOpenCoverLetter(null);

      // Show confetti if accepted
      if (status === 'accepted') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
      }

    } catch (err) {
      setError(err.message || "Something went wrong");
    }

  };
  

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
        <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 w-8 h-8 animate-pulse" />
      </div>
      <p className="ml-6 text-red-700 text-xl font-medium animate-pulse">Loading applications...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-8 text-center max-w-md shadow-xl border">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 text-lg font-medium">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-red-600 hover:text-red-800 font-medium transition-colors duration-200 mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Jobs
          </button>
          <h1 className="text-4xl font-bold text-gray-900">
            Applications for: <span className="text-red-600">{jobTitle || `Job #${id}`}</span>
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg font-medium border ${statusFilter === 'all' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border-red-600'} transition`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium border ${statusFilter === 'pending' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border-red-600'} transition`}
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium border ${statusFilter === 'approved' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border-red-600'} transition`}
                onClick={() => setStatusFilter('approved')}
              >
                Approved
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium border ${statusFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border-red-600'} transition`}
                onClick={() => setStatusFilter('rejected')}
              >
                Rejected
              </button>
            </div>
            <input
              type="text"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 w-full md:w-64"
              placeholder="Search by name, university, location, ITI ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-gray-600 mt-2">
            {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'} found
          </p>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-600">No applications match your filter or search</p>
          </div>
        ) : (
          <>
            {/* Applications Grid - Single View for All Cases */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {statusFilter === 'approved' ? 'Approved Applications' :
                   statusFilter === 'rejected' ? 'Rejected Applications' :
                   statusFilter === 'pending' ? 'Pending Applications' :
                   searchTerm ? 'Search Results' : 'All Applications'}
                </h2>
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {getTotalPages(filteredApplications.length)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getPaginatedData(filteredApplications, currentPage).map((app, index) => (
                  <ApplicationCard
                    key={app.id || index}
                    app={app}
                    index={(currentPage - 1) * itemsPerPage + index}
                    onViewMore={() => setOpenCoverLetter(applications.findIndex(a => a.id === app.id))}
                   onViewProfile={() => {
                    const userId = app.itian?.user_id || app.user_id || app.user?.id || app.iti_id || app.id;
                    if (userId) navigate(`/itian-profile/${userId}`);
                  }}
                  />
                ))}
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={getTotalPages(filteredApplications.length)}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* Cover Letter Modal */}
            {openCoverLetter !== null && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                  {/* Modal Header */}
                  <div className="bg-red-500 p-6 text-white relative">
                    <button
                      className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                      onClick={() => setOpenCoverLetter(null)}
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          {applications[openCoverLetter]?.applicant_name || 'Applicant'}
                        </h2>
                        <p className="text-red-100 text-sm">
                          {applications[openCoverLetter]?.university || 'Centurion University'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto max-h-96 bg-white">
                    {/* Cover Letter */}
                     <div className="mb-6">
                      <h3 className="text-lg font-semibold text-black mb-3">Cover Letter</h3>
                      <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                          {applications[openCoverLetter]?.cover_letter || 'No cover letter provided.'}
                        </p>
                      </div>
                    </div>
                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-black" />
                        Applied: {applications[openCoverLetter]?.created_at ? new Date(applications[openCoverLetter].created_at).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                  </div>
                  {/* Modal Footer */}
                  <div className="p-6 bg-red-50 border-t border-red-100 flex gap-3 justify-between">
                <button 
                    onClick={() => handleViewCV(applications[openCoverLetter]?.cv)}
                    style={{
                      background: 'linear-gradient(135deg,rgb(240, 53, 53) 0%,rgb(102, 4, 4) 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(234, 102, 102, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(224, 41, 41, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(234, 102, 102, 0.3)';
                    }}
                  >
                    📄 View CV
                  </button>

                    <div className="flex gap-2">
                      <button
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        onClick={() => handleStatusChange(applications[openCoverLetter].id, 'accepted')}
                      >
                        Accept
                      </button>
                      <button
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                        onClick={() => handleStatusChange(applications[openCoverLetter].id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Confetti */}
            {showConfetti && (
              <Confetti width={dimensions.width} height={dimensions.height} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default JobApplications;