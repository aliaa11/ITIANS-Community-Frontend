import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access-token');
  return {
    Authorization: `Bearer ${token}`
  };
};

/// Posts
export const fetchPosts = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/posts`, {
    headers: getAuthHeaders(),
    params
  });
  return response.data; 
};


export const fetchMyPosts = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/myposts`, {
    headers: getAuthHeaders(),
    params
  });
  return response.data;
};


export const updatePost = async (postId, data) => {
  const token = localStorage.getItem('access-token');
  const formData = new FormData();

  formData.append('title', data.title);
  formData.append('content', data.content);

  if (data.image) {
    formData.append('image', data.image);
  }

  const response = await axios.post(
    `http://localhost:8000/api/posts/${postId}?_method=PUT`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data;
};


export const deletePost = async (postId) => {
  const response = await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const createPost = async (postData) => {
  const formData = new FormData();
  formData.append('title', postData.title);
  formData.append('content', postData.content);
  if (postData.image) {
    formData.append('image', postData.image);
  }

  const response = await axios.post('http://localhost:8000/api/posts', formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access-token')}`,
      // لا تحدد Content-Type، axios سيحددها تلقائياً لـ multipart/form-data
    },
  });

  return response.data.data; 
};


// Reactions
export const reactToPost = async (postId, reactionType) => {
  const response = await axios.post(
    `${API_BASE_URL}/posts/${postId}/react`,
    { reaction_type: reactionType }, 
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const fetchReactionDetails = async (postId) => {
  const res = await axios.get(`${API_BASE_URL}/posts/${postId}/reactions/details`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const removeReaction = async (postId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/posts/${postId}/reaction`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getPostReactions = async (postId) => {
  const response = await axios.get(
    `${API_BASE_URL}/posts/${postId}/reactions`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Comments API
export const fetchComments = async (postId, params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/posts/${postId}/comments`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

export const addComment = async (postId, content, parentCommentId = null) => {
  const payload = { content };
  if (parentCommentId) payload.parent_comment_id = parentCommentId;

  const response = await axios.post(
    `${API_BASE_URL}/posts/${postId}/comments`,
    payload,
    { headers: getAuthHeaders() }
  );
  return response.data.comment;
};

export const updateComment = async (commentId, content) => {
  const response = await axios.put(
    `${API_BASE_URL}/comments/${commentId}`,
    { content },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/comments/${commentId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Replies API (if using separate endpoints)
export const updateReply = async (replyId, content) => {
  const response = await axios.put(
    `${API_BASE_URL}/replies/${replyId}`,
    { content },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteReply = async (replyId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/replies/${replyId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};