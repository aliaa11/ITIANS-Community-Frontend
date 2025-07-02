import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Send, Loader2, X, AlertCircle } from 'lucide-react';
import ItianNavbar from '../components/ItianNavbar';
import EmployerNavbar from '../components/EmployerNavbar'; // اضافة EmployerNavbar
const API_BASE_URL = 'http://localhost:8000/api';

const CreateReportPage = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.user);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Get user role from Redux state or localStorage
    if (user && user.role) {
      setUserRole(user.role);
    } else {
      // Fallback: try to get role from localStorage or make API call
      const token = localStorage.getItem('access-token');
      if (token) {
        // You might want to decode the token or make an API call to get user info
        // For now, we'll assume the role is stored somewhere accessible
        // This is a placeholder - adjust based on your actual implementation
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserRole(parsedUser.role);
        }
      }
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Report content is required');
      setShowError(true);
      return;
    }

    setLoading(true);
    setError('');
    setShowError(false);

    try {
      const token = localStorage.getItem('access-token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setShowError(true);
        setLoading(false);
        return;
      }

      await axios.post(
        `${API_BASE_URL}/reports`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Navigate based on user role
      if (userRole === 'itian') {
        navigate('/itian/my-reports');
      } else if (userRole === 'employer') {
        navigate('/employer/my-reports');
      } else {
        // Default fallback
        navigate('/my-reports');
      }
    } catch (err) {
      setError(`Failed to create report: ${err.response?.data?.message || err.message}`);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // تحديد الناف بار بناء على نوع المستخدم
  const renderNavbar = () => {
    if (userRole === 'employer') {
      return <EmployerNavbar />;
    } else if (userRole === 'itian') {
      return <ItianNavbar />;
    }
    // Default fallback - يمكن تغييرها حسب احتياجك
    return <ItianNavbar />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      {/* عرض الناف بار المناسب */}
      {renderNavbar()}
      
      <div className="max-w-3xl mx-auto">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-[#d0443c] to-[#a0302c] rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="p-4 flex items-center">
            <Send className="w-6 h-6 text-white mr-3" />
            <h1 className="text-2xl font-bold text-white">
              Create New Report
            </h1>
          </div>
        </div>

        {/* Form Card */}
        <form 
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6"
        >
          {showError && error && (
            <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg flex items-center shadow-lg animate-fade-in">
                <AlertCircle className="w-6 h-6 mr-2 text-red-600" />
                <span className="font-semibold">{error}</span>
                <button 
                  onClick={() => setShowError(false)} 
                  className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              Describe your issue or concern
            </label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#d0443c] focus:ring-2 focus:ring-[#d0443c]/50 transition-all duration-200 h-48"
              placeholder="Please provide as much detail as possible..."
            />
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-bold text-white flex items-center gap-2 transition-all duration-200 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#d0443c] hover:bg-[#a0302c] hover:shadow-md'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease;
          }
        `}
      </style>
    </div>
  );
};

export default CreateReportPage;