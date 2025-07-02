import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_URL, // Use the URL from your .env file
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// This is an interceptor. It's a powerful axios feature that runs
// on every request. This code automatically adds the auth token to the headers.
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default apiClient;