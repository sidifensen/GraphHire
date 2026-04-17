import axios from 'axios';
import { authStore } from '@/lib/stores/auth-store';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7777',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor to unwrap Result<T>
apiClient.interceptors.response.use(
  (response) => {
    // If response has {code, message, data}, unwrap it
    if (response.data && typeof response.data === 'object' && 'code' in response.data && 'data' in response.data) {
      if (response.data.code !== 200) {
        return Promise.reject({ response: { data: { message: response.data.message || 'Request failed' } } });
      }
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;