import axios from 'axios';

const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bj-kl2b.onrender.com/api/v1';
const cleanUrl = rawUrl.replace(/\/+$/, '');
const finalUrl = cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;

const api = axios.create({
  baseURL: finalUrl,
});

// Interceptor to inject token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
