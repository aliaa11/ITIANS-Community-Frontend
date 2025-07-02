import { Link, useLocation } from 'react-router-dom';

function getUserRoleFromToken() {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role || null;
  } catch (error) {
    return null;
  }
}

const Sidebar = () => {
  const location = useLocation();
  const role = getUserRoleFromToken();

  const hideRoutes = ['/posts'];
  if (hideRoutes.includes(location.pathname)) return null;

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4">
      <h2 className="text-lg font-semibold mb-4">Menu</h2>
      {role === 'itian' && (
        <>
          <Link to="/jobs" className="hover:text-green-400">🔍 Browse Jobs</Link>
          <Link to="/my-applications" className="hover:text-green-400">📁 My Applications</Link>
        </>
      )}
      {role === 'employer' && (
        <>
          <Link to="/employer/jobs" className="hover:text-green-400">📋 My Jobs</Link>
          <Link to="/employer/post-job" className="hover:text-green-400">➕ Post Job</Link>
        </>
      )}
      {role === 'admin' && (
        <>
          <Link to="/admin/dashboard" className="hover:text-green-400">📊 Dashboard</Link>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
