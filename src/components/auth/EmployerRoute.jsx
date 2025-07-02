import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const EmployerRoute = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const isAuthenticated = user && user.id;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Case 2: User is logged in, but has no role or the wrong role.
  // This is a defensive check against an inconsistent API response from the backend
  // where the user object might be missing the 'role' property.
  if (!user.role || user.role !== 'employer') {
    // Log the issue to help with debugging.
    console.error(`Role-based route access denied. Expected role: 'employer', but user has role: '${user.role}'.`);
    return <Navigate to="/not-found" replace />;
  }

  return <Outlet />;
};

export default EmployerRoute;