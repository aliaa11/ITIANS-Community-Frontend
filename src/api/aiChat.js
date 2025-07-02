import axios from 'axios';

const API_BASE_URL = 'https://c6a0-41-33-92-146.ngrok-free.app/api/rag';
const getAuthHeaders = () => {
  const token = localStorage.getItem('access-token');
  return {
    Authorization: `Bearer ${token}`
  };
};
export const embedPosts = () => axios.get(`${API_BASE_URL}/embed/posts`);
export const embedJobs = () => axios.get(`${API_BASE_URL}/embed/jobs`);

export const searchRag = (query) => {
  return axios.get(`${API_BASE_URL}/search`, {
   
    headers: getAuthHeaders(),
    params: { q: query },
  });
};

export const askRag = (query) => {
  return axios.get(`${API_BASE_URL}/ask`, {
    params: { q: query },
  });
};
