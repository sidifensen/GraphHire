import axios from 'axios';
import {
  getAuthDomainByPath,
  getAuthStoreByDomain,
  getStorageKeyByDomain,
  type AuthDomain,
} from '@/lib/stores/auth-store';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7777',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

function getAccessToken() {
  const domain = getCurrentDomain();
  const stateToken = getAuthStoreByDomain(domain).getState().accessToken;
  if (stateToken) {
    return stateToken;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storageKey = getStorageKeyByDomain(domain);
    const persisted = window.localStorage.getItem(storageKey);
    if (!persisted) {
      return null;
    }
    const parsed = JSON.parse(persisted) as { state?: { accessToken?: string | null } };
    return parsed.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

function getCurrentDomain(): AuthDomain {
  if (typeof window === 'undefined') {
    return 'user';
  }
  return getAuthDomainByPath(window.location.pathname);
}

function getRedirectPathByDomain(domain: AuthDomain): string {
  if (domain === 'admin') {
    return '/admin/login';
  }
  return '/login';
}

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
      const domain = getCurrentDomain();
      getAuthStoreByDomain(domain).getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = getRedirectPathByDomain(domain);
      }
    }
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.satoken = token;
  }
  return config;
});

export default apiClient;
