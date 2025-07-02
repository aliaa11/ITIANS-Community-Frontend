import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoute = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const isAuthenticated = user && user.id;

  if (!isAuthenticated) {
    // Redirect them to the login page, preserving the intended destination.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes.
  return <Outlet />;
};

export default PrivateRoute;