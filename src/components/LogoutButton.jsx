// components/LogoutButton.jsx
import { useDispatch } from 'react-redux';
import { clearUser } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear storage
    localStorage.removeItem('access-token');
    
    // Clear Redux state
    dispatch(clearUser());
    
    // Redirect to login
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
};