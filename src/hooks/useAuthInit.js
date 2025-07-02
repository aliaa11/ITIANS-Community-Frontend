import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import apiClient from '../api/axios';
import { setUser, setLoading } from '../store/userSlice';

const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access-token');

      if (!token) {
        dispatch(setLoading(false));
        return;
      }

      try {
        // The interceptor in apiClient will add the token header automatically
        const response = await apiClient.get('/api/user');
        dispatch(setUser(response.data));
      } catch (error) {
        // The API call to verify the token failed. This could be due to an
        // expired token or a network issue. Per your request, we will NOT
        // remove the token here. It will only be removed on explicit logout.
        // The user will be treated as logged-out because the Redux user state is null.
        console.error('Auth init failed. The token might be invalid or expired.', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch]);
};

export default useAuthInit;