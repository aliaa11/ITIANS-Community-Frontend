import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const AdminRoute = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const isAuthenticated = user && user.id;

  // Case 1: User is not logged in at all.
  if (!isAuthenticated) {
    // Redirect them to the login page, preserving the intended destination.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Case 2: User is logged in, but has no role or the wrong role.
  // This is a defensive check against an inconsistent API response from the backend
  // where the user object might be missing the 'role' property.
  if (!user.role || user.role !== 'admin') {
    // Log the issue to help with debugging.
    console.error(`Role-based route access denied. Expected role: 'admin', but user has role: '${user.role}'.`);
    return <Navigate to="/not-found" replace />;
  }

  // Case 3: User is an authorized admin.
  return <Outlet />;
};

export default AdminRoute;