import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Simple session ID management
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for logging and session management
api.interceptors.request.use(
  (config) => {
    // Add session ID to requests
    config.headers['X-Session-ID'] = getSessionId();
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to server. Please try again later.');
    }
    
    throw new Error(error.message || 'An unexpected error occurred');
  }
);

export const feedbackApi = {
  // Get feedback with optional filters
  getFeedback: async (params = {}) => {
    const response = await api.get('/feedback', { params });
    return response.data;
  },

  // Get single feedback item
  getFeedbackById: async (id) => {
    const response = await api.get(`/feedback/${id}`);
    return response.data;
  },

  // Create new feedback
  createFeedback: async (data) => {
    const response = await api.post('/feedback', data);
    return response.data;
  },

  // Upvote feedback
  upvoteFeedback: async (id) => {
    const response = await api.post(`/feedback/${id}/upvote`);
    return response.data;
  },

  // Get user vote status for a feedback item
  getUserVoteStatus: async (id) => {
    const response = await api.get(`/feedback/${id}/vote-status`);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;