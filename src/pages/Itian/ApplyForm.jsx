import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../../css/apply.css";

const ApplyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    question1: "",
    question2: "",
    availability: "",
    cv: null,
    cover_letter: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/jobs/${id}`);
        setJob(res.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching job:", error);
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.files[0]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.question1.trim()) {
      newErrors.question1 = "This field is required";
    }
    
    if (!formData.question2.trim()) {
      newErrors.question2 = "This field is required";
    }
    
    if (!formData.availability) {
      newErrors.availability = "Please select your availability";
    }
    
    if (!formData.cv) {
      newErrors.cv = "CV is required";
    }
    
    if (!formData.cover_letter) {
      newErrors.cover_letter = "Cover letter is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('job_id', id);
      formDataToSend.append('cover_letter', formData.cover_letter);
      formDataToSend.append('cv', formData.cv);
      formDataToSend.append('answers', JSON.stringify({
        question1: formData.question1,
        question2: formData.question2,
        availability: formData.availability
      }));
      
      const response = await axios.post('http://localhost:8000/api/job-applications', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      navigate(`/jobs/${id}`, { state: { success: 'Application submitted successfully!' } });
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to submit application'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!job) return <p>Job not found</p>;

  return (
    <div className="apply-form-container">
      <div className="application-header">
        <h1 className="application-date">JUN 18 1947</h1>
        <h2 className="job-title">{job.job_title}</h2>
        <p className="company-name">{job.employer?.name || "Unknown Company"}</p>
      </div>

      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-section">
          <h3 className="section-title">Cover Letter</h3>
          
          <div className="form-group">
            <label className="question-label">
              Q. Why do you want our company to hire you?
            </label>
            <textarea
              name="question1"
              value={formData.question1}
              onChange={handleChange}
              placeholder="Enter your text here"
              rows={4}
              className={errors.question1 ? 'error' : ''}
            />
            {errors.question1 && <span className="error-message">{errors.question1}</span>}
          </div>
          
          <div className="form-group">
            <label className="question-label">
              Q. Do you have any past experience? If any, please share your past work links.
            </label>
            <textarea
              name="question2"
              value={formData.question2}
              onChange={handleChange}
              placeholder="Enter your text here"
              rows={4}
              className={errors.question2 ? 'error' : ''}
            />
            {errors.question2 && <span className="error-message">{errors.question2}</span>}
          </div>
          
          <div className="form-group">
            <label className="question-label">
              Q. Are you available for work/internship for the next 2 months?
            </label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="availability"
                  value="yes"
                  checked={formData.availability === "yes"}
                  onChange={handleChange}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="availability"
                  value="no"
                  checked={formData.availability === "no"}
                  onChange={handleChange}
                />
                No
              </label>
            </div>
            {errors.availability && <span className="error-message">{errors.availability}</span>}
          </div>
        </div>
        
        <div className="form-section">
          <h3 className="section-title">Attachments</h3>
          
          <div className="form-group">
            <label className="file-upload-label">
              Upload CV (PDF/DOC)
              <input
                type="file"
                name="cv"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="file-input"
              />
              <span className="file-name">
                {formData.cv ? formData.cv.name : 'No file chosen'}
              </span>
            </label>
            {errors.cv && <span className="error-message">{errors.cv}</span>}
          </div>
          
          <div className="form-group">
            <label className="file-upload-label">
              Upload Cover Letter (Optional)
              <input
                type="file"
                name="cover_letter"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="file-input"
              />
              <span className="file-name">
                {formData.cover_letter ? formData.cover_letter.name : 'No file chosen'}
              </span>
            </label>
          </div>
        </div>
        
        <div className="form-actions">
          <Link to={`/jobs/${id}`} className="cancel-btn">
            Cancel
          </Link>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Apply'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplyForm;