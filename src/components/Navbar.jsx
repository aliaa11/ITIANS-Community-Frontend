import { Link } from 'react-router-dom';

// helper to decode JWT
function getUserRoleFromToken() {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role || null;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

const Navbar = () => {
  const role = getUserRoleFromToken();

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-green-600">Job Platform</h1>
      <div className="flex gap-4">
        {role === 'itian' && (
          <>
            <Link to="/jobs" className="hover:text-green-600">Jobs</Link>
            <Link to="/my-applications" className="hover:text-green-600">My Applications</Link>
          </>
        )}
        {role === 'employer' && (
          <>
            <Link to="/employer/jobs" className="hover:text-green-600">My Jobs</Link>
            <Link to="/employer/post-job" className="hover:text-green-600">Post Job</Link>
          </>
        )}
        {role === 'admin' && (
          <Link to="/admin/dashboard" className="hover:text-green-600">Dashboard</Link>
        )}
        
      </div>
    </nav>
  );
};

export default Navbar;
