import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import LoaderOverlay from './LoaderOverlay';

const PublicRoute = ({ children }) => {
  // Check both user and role slices for stricter auth
  const user = useSelector(state => state.user.user);
  const role = useSelector(state => state.user.role);
  // Also check itian and employer slices for possible login
  const itian = useSelector(state => state.itian?.user);
  const itianProfile = useSelector(state => state.itianProfile?.profile);
  const employerProfile = useSelector(state => state.employerProfile?.profile);
  const loading = useSelector(state => state.user.loading);

  // Consider logged in if any user/role or profile exists OR if a valid token exists
  const token = localStorage.getItem('access-token');
  const isLoggedIn = Boolean(user && role) || Boolean(itian) || Boolean(itianProfile) || Boolean(employerProfile) || Boolean(token);

  if (loading) {
    return <LoaderOverlay text="Checking authentication..." />;
  }

  if (isLoggedIn) {
    // If logged in or token exists, block access to public routes and redirect to home
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PublicRoute;
