import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";
import "../../css/MyApplications.css";
import { Sparkles } from 'lucide-react';
Modal.setAppElement('#root');

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    cover_letter: "",
    cv: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('access-token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:8000/api/my-applications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log("API Response:", response); // ⬅️ أضف دي
        setApplications(response.data.applications);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setError("Failed to load applications");
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate, submitSuccess]);

   const getStatusColor = (status) => {
    const lowerCaseStatus = status.toLowerCase();
    
    if (lowerCaseStatus.includes('accepted') || lowerCaseStatus.includes('approved')) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (lowerCaseStatus.includes('rejected') || lowerCaseStatus.includes('declined')) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (lowerCaseStatus.includes('pending')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (lowerCaseStatus.includes('review')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (lowerCaseStatus.includes('shortlisted')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    } else {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEdit = (application) => {
    setSelectedApplication(application);
    setFormData({
      cover_letter: application.cover_letter,
      cv: null
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedApplication(null);
    setSubmitError(null);
    setSubmitSuccess(false);
    setFormData({
      cover_letter: "",
      cv: null
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      cv: e.target.files[0]
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const token = localStorage.getItem('access-token');
      if (!token) {
        setSubmitError('Please login to update your application');
        setSubmitting(false);
        return;
      }

      if (!formData.cover_letter || formData.cover_letter.length < 100) {
        setSubmitError('Cover letter must be at least 100 characters');
        setSubmitting(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('cover_letter', formData.cover_letter);
      formDataToSend.append('_method', 'PUT');

      if (formData.cv) {
        formDataToSend.append('cv', formData.cv);
      }

      const response = await axios.post(
        `http://localhost:8000/api/job-application/${selectedApplication.id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      setSubmitSuccess(true);
      setTimeout(async () => {
        closeModal();
        const token = localStorage.getItem('access-token');
        try {
          const updated = await axios.get('http://localhost:8000/api/itian/job-application', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setApplications(updated.data.data);
        } catch (fetchError) {
          console.error("Error fetching updated applications:", fetchError);
        }
      }, 1500);

    } catch (error) {
      console.error('Error updating application:', error);

      const validationErrors = error?.response?.data?.errors;

      if (validationErrors) {
        setSubmitError(
          Object.values(validationErrors).flat().join('\n') ||
          'Please fix the form errors'
        );
      } else {
        setSubmitError(
          error?.response?.data?.message ||
          error.message ||
          'Failed to update application. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setApplicationToDelete(id);
    setDeleteModalIsOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('access-token');
      if (!token) {
        setError('Please login to delete your application');
        return;
      }

      await axios.delete(`http://localhost:8000/api/job-application/${applicationToDelete}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setApplications(applications.filter(app => app.id !== applicationToDelete));
      setDeleteModalIsOpen(false);
      setApplicationToDelete(null);
    } catch (error) {
      console.error('Error deleting application:', error);
      setError('Failed to delete application. Please try again.');
      setDeleteModalIsOpen(false);
    }
  };

  // Filtered and paginated applications
const filteredApplications = applications.filter(app => {
  const title = app.job?.job_title?.toLowerCase() || "";
  const employer = app.job?.employer?.name?.toLowerCase() || "";
  return title.includes(searchTerm.toLowerCase()) || employer.includes(searchTerm.toLowerCase());
});


  const totalPages = Math.ceil(filteredApplications.length / perPage);
  const paginatedApplications = filteredApplications
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice((currentPage - 1) * perPage, currentPage * perPage);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin animation-delay-150"></div>
        <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 w-8 h-8 animate-pulse" />
      </div>
      <p className="ml-6 text-gray-800 text-xl font-medium animate-pulse">Loading your applications...</p>
    </div>
  );

  if (error) return (
    <div className="application-error-container">
      <p className="application-error-message">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="application-retry-btn"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="application-container">
      <div className="application-header">
        <h1 className="application-title">My Job Applications</h1>
        <p className="application-subtitle">View and manage your job applications</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-72 focus:outline-none focus:border-[#e35d5b]"
          />
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="application-empty-state">
          <p className="application-empty-message">No applications found.</p>
          <Link 
            to="/jobs" 
            className="application-browse-btn"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <>
        <div className="application-list">
       {paginatedApplications
          .filter(application => application.job) // تأكد إن في job مربوط
          .map(application => (
            <div key={application.id} className="application-item">
              <div className="application-item-header">
                <h2 className="application-job-title">
                  <Link to={`/jobs/${application.job.id}`}>
                    {application.job.job_title}
                  </Link>
                </h2>
                <span className={`application-status px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                  {application.status}
                </span>
              </div>

              
              <div className="application-details">
                <div className="application-detail">
                  <span className="application-detail-label">Company:</span>
                  <span className="application-detail-value">{application.job.employer?.name || 'Unknown'}</span>
                </div>
                <div className="application-detail">
                  <span className="application-detail-label">Applied On:</span>
                  <span className="application-detail-value">
                    {application.created_at && application.created_at !== 'Invalid Date'
                      ? new Date(application.created_at).toLocaleDateString()
                      : ''}
                  </span>
                </div>
                <div className="application-detail flex items-center gap-2">
                  <span className="application-detail-label">Cover Letter:</span>
                  <p className="application-cover-letter-preview">
                    {application.cover_letter.substring(0, 100)}...
                  </p>
                </div>
              </div>
              
              <div className="application-actions flex items-center gap-2 mt-2">
                {['pending', 'review', 'shortlisted'].includes(application.status.toLowerCase()) ? (
                  <>
                    <button 
                      onClick={() => handleEdit(application)}
                      className="application-edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/jobs/${application.job.id}`)}
                      className="application-edit-btn ml-2"
                    >
                      Job Details
                    </button>
                    <button 
                      onClick={() => handleDelete(application.id)}
                      className="application-delete-btn"
                    >
                      Withdraw
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-gray-500 text-sm">
                      Actions unavailable for this application status
                    </div>
                    <button
                      onClick={() => navigate(`/jobs/${application.job.id}`)}
                      className="application-edit-btn ml-2"
                    >
                      Job Details
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="inline-flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-l bg-gray-100 border border-gray-300 text-gray-700 hover:bg-[#e35d5b] hover:text-white disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border border-gray-300 ${currentPage === i + 1 ? 'bg-[#e35d5b] text-white font-bold' : 'bg-gray-100 text-gray-700'} hover:bg-[#e35d5b] hover:text-white`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-r bg-gray-100 border border-gray-300 text-gray-700 hover:bg-[#e35d5b] hover:text-white disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
        </>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="application-modal bg-[#e35d5b] rounded-2xl p-0 max-w-lg w-full mx-auto shadow-2xl border-none"
        overlayClassName="application-modal-overlay bg-black/40 backdrop-blur-sm flex items-center justify-center fixed inset-0 z-50"
      >
        <div className="application-modal-header flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="application-modal-title text-black text-xl font-bold">
            Edit Application for {selectedApplication?.job.job_title}
          </h2>
          <button onClick={closeModal} className="application-modal-close text-black text-2xl font-bold hover:text-gray-700">&times;</button>
        </div>

        {submitSuccess ? (
          <div className="application-success-message text-center px-6 pb-6">
            <h3 className="application-success-title text-black text-lg font-semibold mb-2">Application Updated!</h3>
            <p className="application-success-text text-black/90 mb-4">Your changes have been saved.</p>
            <button 
              onClick={closeModal} 
              className="application-modal-close-btn bg-white text-[#e35d5b] font-bold px-5 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="application-form px-6 pb-6">
            <div className="application-form-group mb-4">
              <label htmlFor="cover_letter" className="application-form-label text-black font-semibold block mb-2">
                Cover Letter
              </label>
              <textarea
                id="cover_letter"
                name="cover_letter"
                rows="5"
                value={formData.cover_letter}
                onChange={handleInputChange}
                minLength={100}
                placeholder="Write your cover letter here... (at least 100 characters)"
                className={`application-form-textarea w-full rounded-lg border-2 border-white/30 focus:border-white bg-white/90 text-black p-3 outline-none transition min-h-[120px] ${formData.cover_letter.length > 0 && formData.cover_letter.length < 100 ? 'border-red-500' : formData.cover_letter.length >= 100 ? 'border-green-500' : ''}`}
              />
              {formData.cover_letter.length > 0 && formData.cover_letter.length < 100 && (
                <p className="text-red-500 text-xs mt-1">Cover letter must be at least 100 characters.</p>
              )}
              {formData.cover_letter.length >= 100 && (
                <p className="text-green-600 text-xs mt-1">Looks good!</p>
              )}
            </div>

            <div className="application-form-group mb-4">
              <label htmlFor="cv" className="application-form-label text-black font-semibold block mb-2">
                Update CV (Optional)
              </label>
              <input
                type="file"
                id="cv"
                name="cv"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="application-form-file w-full rounded-lg border-2 border-white/30 focus:border-white bg-white/90 text-black p-2 outline-none transition"
              />
             
            </div>

            {submitError && <p className="application-form-error text-red-500 mb-2">{submitError}</p>}

            <div className="application-form-actions flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="application-cancel-btn bg-white text-[#e35d5b] font-bold px-5 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || formData.cover_letter.length < 100}
                className="application-submit-btn bg-white text-[#e35d5b] font-bold px-5 py-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Updating...' : 'Update Application'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={() => setDeleteModalIsOpen(false)}
        className="application-modal"
        overlayClassName="application-modal-overlay"
      >
        <div className="application-modal-header">
          <h2 className="application-modal-title">Confirm Withdrawal</h2>
          <button 
            onClick={() => setDeleteModalIsOpen(false)} 
            className="application-modal-close"
          >
            &times;
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-700 mb-6">Are you sure you want to withdraw this application?</p>
          
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setDeleteModalIsOpen(false)}
              className="application-cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="application-delete-btn"
            >
              Confirm Withdraw
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyApplications;