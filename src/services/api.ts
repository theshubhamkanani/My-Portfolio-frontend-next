import axios from 'axios';

const api = axios.create({
  // Pulls from your .env.local file
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST Interceptor: Attaches token to outgoing calls 🕵️‍♂️
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('portfolio_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE Interceptor: Redirects to Home if token is invalid/expired 🏠
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      sessionStorage.removeItem('portfolio_token');
      // Sends them back to the landing page
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;