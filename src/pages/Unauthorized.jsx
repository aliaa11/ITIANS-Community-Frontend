import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
        <p className="mb-6">You don't have permission to view this page.</p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate(-1)} // Go back to previous page
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')} // Go to home page
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;