import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";
import "../../css/ProposalDetails.css";

import { Sparkles } from 'lucide-react';


const ProposalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    cover_letter: "",
    cv: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);


  const fetchProposal = async () => {
    try {
      const token = localStorage.getItem('access-token');
      if (!token) throw new Error('Please login to view this proposal');

      const response = await axios.get(`http://localhost:8000/api/job-application/single/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setProposal(response.data.data);
    } catch (error) {
      console.error("Error fetching proposal:", error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposal();
  }, [id]);

  const handleEdit = () => {
    setFormData({
      cover_letter: proposal.cover_letter,
      cv: null
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSubmitError(null);
    setSubmitSuccess(false);
    setFormData({ cover_letter: "", cv: null });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, cv: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
      if (formData.cv) formDataToSend.append('cv', formData.cv);

      const response = await axios.post(`http://localhost:8000/api/job-application/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      setSubmitSuccess(true);
      // Update proposal in UI immediately
      setProposal(prev => ({ ...prev, ...response.data.data }));
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (error) {
      console.error('Error updating application:', error);
      const validationErrors = error?.response?.data?.errors;

      if (validationErrors) {
        setSubmitError(Object.values(validationErrors).flat().join('\n'));
      } else {
        setSubmitError(error?.response?.data?.message || error.message || 'Failed to update application.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    setDeleteModalIsOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('access-token');
      if (!token) {
        setError('Please login to delete your application');
        return;
      }

      await axios.delete(`http://localhost:8000/api/job-application/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      navigate('/my-applications');
    } catch (error) {
      console.error('Error deleting application:', error);
      setError('Failed to delete application. Please try again.');
      setDeleteModalIsOpen(false);
    }
  };

if (loading) return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin animation-delay-150"></div>
      <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 w-8 h-8 animate-pulse" />
    </div>
    <p className="ml-6 text-gray-800 text-xl font-medium animate-pulse">Loading your Proposal Details...</p>
  </div>
);
  if (!proposal) return (
    <div className="proposal-not-found">
      <p>Proposal not found</p>
      <Link to="/my-applications" className="proposal-back-btn">Back to My Applications</Link>
    </div>
  );

  return (
    <div className="proposal-container">
      <div className="proposal-card">
        <div className="proposal-header">
          <h1 className="proposal-title">Your Application for {proposal.job.job_title}</h1>
          <p className="proposal-status">
            Status: <span className={`proposal-status-badge proposal-status-${proposal.status}`}>{proposal.status}</span>
          </p>
        </div>

        <div className="proposal-content">
          <div className="proposal-section">
            <h2 className="proposal-section-title">Job Details</h2>
            <div className="proposal-detail"><span className="proposal-detail-label">Company:</span><span className="proposal-detail-value">{proposal.job.employer?.name || 'Unknown'}</span></div>
            <div className="proposal-detail"><span className="proposal-detail-label">Location:</span><span className="proposal-detail-value">{proposal.job.job_location}</span></div>
            <div className="proposal-detail"><span className="proposal-detail-label">Job Type:</span><span className="proposal-detail-value">{proposal.job.job_type}</span></div>
          </div>

          <div className="proposal-section">
            <h2 className="proposal-section-title">Cover Letter</h2>
            <div className="proposal-cover-letter">{proposal.cover_letter}</div>
          </div>

          <div className="proposal-section">
            <h2 className="proposal-section-title">Submitted CV</h2>
            {proposal.cv ? (
              <a href={`http://localhost:8000/storage/${proposal.cv}`} target="_blank" rel="noopener noreferrer" className="proposal-cv-link">View/Download CV</a>
            ) : <p>No CV submitted</p>}
          </div>
        </div>

        <div className="proposal-actions">
          <Link to="/my-applications" className="proposal-back-btn">Back to My Applications</Link>
          <div className="proposal-action-buttons">
            {!["rejected", "approved"].includes((proposal.status || '').toLowerCase()) && (
              <>
                <button onClick={handleEdit} className="proposal-edit-btn">Edit</button>
                <button onClick={handleDelete} className="proposal-delete-btn">Withdraw</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Edit Modal */}
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="proposal-modal" overlayClassName="proposal-modal-overlay">
        <div className="proposal-modal-header">
          <h2 className="proposal-modal-title">Edit Application</h2>
          <button onClick={closeModal} className="proposal-modal-close">&times;</button>
        </div>

        {submitSuccess ? (
          <div className="proposal-success-message">
            <h3 className="proposal-success-title">Application Updated!</h3>
            <p className="proposal-success-text">Your changes have been saved.</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="proposal-form">
            <div className="proposal-form-group">
              <label htmlFor="cover_letter" className="proposal-form-label">Cover Letter</label>
              <textarea
                id="cover_letter"
                name="cover_letter"
                rows="5"
                value={formData.cover_letter}
                onChange={handleInputChange}
                minLength={100}
                placeholder="Write your cover letter here... (at least 100 characters)"
                className={`proposal-form-textarea w-full rounded-lg border-2 border-gray-300 focus:border-blue-500 bg-white text-black p-3 outline-none transition min-h-[120px] ${formData.cover_letter.length > 0 && formData.cover_letter.length < 100 ? 'border-red-500' : formData.cover_letter.length >= 100 ? 'border-green-500' : ''}`}
              />
              {formData.cover_letter.length > 0 && formData.cover_letter.length < 100 && (
                <p className="text-red-500 text-xs mt-1">Cover letter must be at least 100 characters.</p>
              )}
              {formData.cover_letter.length >= 100 && (
                <p className="text-green-600 text-xs mt-1">Looks good!</p>
              )}
            </div>

            <div className="proposal-form-group">
              <label htmlFor="cv" className="proposal-form-label">Update CV (Optional)</label>
              <input type="file" id="cv" name="cv" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="proposal-form-file" />
              {proposal.cv && (
                <p className="proposal-current-cv">
                  Current CV: <a href={`http://localhost:8000/storage/${proposal.cv}`} target="_blank" rel="noopener noreferrer" className="proposal-cv-link">View CV</a>
                </p>
              )}
            </div>

            {submitError && <p className="proposal-form-error">{submitError}</p>}

            <div className="proposal-form-actions">
              <button type="button" onClick={closeModal} className="proposal-cancel-btn">Cancel</button>
              <button type="submit" disabled={submitting || formData.cover_letter.length < 100} className="proposal-submit-btn">
                {submitting ? 'Updating...' : 'Update Application'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModalIsOpen} onRequestClose={() => setDeleteModalIsOpen(false)} className="proposal-modal" overlayClassName="proposal-modal-overlay">
        <div className="proposal-modal-header">
          <h2 className="proposal-modal-title">Confirm Withdrawal</h2>
          <button onClick={() => setDeleteModalIsOpen(false)} className="proposal-modal-close">&times;</button>
        </div>
        <div className="proposal-delete-content">
          <p className="proposal-delete-message">Are you sure you want to withdraw this application?</p>
          <div className="proposal-delete-actions">
            <button onClick={() => setDeleteModalIsOpen(false)} className="proposal-cancel-btn">Cancel</button>
            <button onClick={confirmDelete} className="proposal-delete-btn">Confirm Withdraw</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProposalDetails;
