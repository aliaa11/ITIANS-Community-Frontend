import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import LoaderOverlay from './LoaderOverlay';

const AdminRoute = ({ children }) => {
  const { user, loading } = useSelector(state => state.user);
  const location = useLocation();


  if (loading) {
    return <LoaderOverlay text="Verifying permissions..." />;
  }

  if (!user) {
    // After loading, if no user, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    // Show loader briefly, then redirect to unauthorized page, preserving previous location
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;