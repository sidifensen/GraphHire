import axios from 'axios';
import {
  getAuthDomainByPath,
  getAuthStoreByDomain,
  type AuthDomain,
} from '@/lib/stores/auth-store';
import { getApiBaseUrl } from '@/lib/api/base-url';

const apiClient = axios.create({
  baseURL: getApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

function getAccessToken() {
  const domain = getCurrentDomain();
  return getAuthStoreByDomain(domain).getState().accessToken;
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

function handleUnauthorized(domain: AuthDomain = getCurrentDomain()) {
  getAuthStoreByDomain(domain).getState().logout();
  if (typeof window !== 'undefined') {
    window.location.assign(getRedirectPathByDomain(domain));
  }
}

// Response interceptor to unwrap Result<T>
apiClient.interceptors.response.use(
  (response) => {
    // If response has {code, message, data}, unwrap it
    if (response.data && typeof response.data === 'object' && 'code' in response.data && 'data' in response.data) {
      const resultCode = Number(response.data.code);
      if (resultCode !== 200) {
        if (resultCode === 401) {
          handleUnauthorized();
        }
        const message = response.data.message || 'Request failed';
        const apiError = new Error(message) as Error & {
          response?: {
            status?: number;
            data?: {
              code?: number;
              message?: string;
            };
          };
        };
        apiError.name = 'ApiError';
        apiError.response = {
          status: resultCode === 401 ? 401 : undefined,
          data: {
            code: resultCode,
            message,
          },
        };
        return Promise.reject(apiError);
      }
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    const isTimeout =
      error?.code === 'ECONNABORTED' ||
      (typeof error?.message === 'string' && error.message.toLowerCase().includes('timeout'));
    if (isTimeout) {
      return Promise.reject(new Error('请求超时，请稍后重试'));
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
