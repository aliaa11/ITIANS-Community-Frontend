import { useSelector } from 'react-redux';
import ItianNavbar from '../../components/ItianNavbar';
import EmployerNavbar from '../../components/EmployerNavbar';
import WithoutLoginNavbar from '../../components/withoutloginNav';
import { Outlet } from 'react-router-dom';

function WithoutLoginLayout() {
  const tokenExists = !!localStorage.getItem('access-token');
  
  const reduxAuth = useSelector(state => state.auth) || {};
  const isAuthenticated = tokenExists || reduxAuth?.isAuthenticated;
  const userRole = reduxAuth?.user?.role || null;

  return (
    <div className="app-container">
      {!isAuthenticated ? (
        <WithoutLoginNavbar />
      ) : userRole === 'ITian' ? (
        <ItianNavbar />
      ) : (
        <EmployerNavbar />
      )}
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default WithoutLoginLayout;