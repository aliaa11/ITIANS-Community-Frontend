import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const { user } = useSelector((state) => state.user);

  // A more robust check for authentication.
  // This prevents redirects if the user object is an empty `{}` after logout.
  const isAuthenticated = user && user.id;

  if (isAuthenticated) {
    // Redirect authenticated users away from public pages like login/register.
    if (user.role === 'admin') {
      return <Navigate to="/admin/approvals" replace />;
    }
    if (user.role === 'itian') {
      // The profile page will handle redirecting to create-profile if needed.
      return <Navigate to="/itian-profile" replace />;
    }
    if (user.role === 'employer') {
      return <Navigate to="/employer-profile" replace />;
    }
    // Fallback for any other authenticated role.
    return <Navigate to="/" replace />;
  }

  // If not authenticated, allow access to the public page (Login, Register, etc.).
  return <Outlet />;
};

export default PublicRoute;