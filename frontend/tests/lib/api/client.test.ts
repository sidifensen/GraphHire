/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockGet,
  mockPost,
  mockPut,
  mockDelete,
  mockRequestUse,
  mockResponseUse,
  mockUserLogout,
  mockEnterpriseLogout,
  mockAdminLogout,
  setResponseHandlers,
  getResponseHandlers,
} = vi.hoisted(() => {
  let successHandler: ((response: any) => any) | undefined;
  let errorHandler: ((error: any) => any) | undefined;

  return {
    mockGet: vi.fn(),
    mockPost: vi.fn(),
    mockPut: vi.fn(),
    mockDelete: vi.fn(),
    mockRequestUse: vi.fn(),
    mockResponseUse: vi.fn((onSuccess: (response: any) => any, onError: (error: any) => any) => {
      successHandler = onSuccess;
      errorHandler = onError;
    }),
    mockUserLogout: vi.fn(),
    mockEnterpriseLogout: vi.fn(),
    mockAdminLogout: vi.fn(),
    setResponseHandlers: (onSuccess?: (response: any) => any, onError?: (error: any) => any) => {
      successHandler = onSuccess;
      errorHandler = onError;
    },
    getResponseHandlers: () => ({ successHandler, errorHandler }),
  };
});

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: mockRequestUse },
        response: { use: mockResponseUse },
      },
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
      defaults: { timeout: 30000, headers: { 'Content-Type': 'application/json' } },
    })),
  },
}));

vi.mock('@/lib/stores/auth-store', () => {
  const storeByDomain = {
    user: { getState: () => ({ accessToken: null, logout: mockUserLogout }) },
    enterprise: { getState: () => ({ accessToken: null, logout: mockEnterpriseLogout }) },
    admin: { getState: () => ({ accessToken: null, logout: mockAdminLogout }) },
  } as const;

  return {
    getAuthStoreByDomain: (domain: 'user' | 'enterprise' | 'admin') => storeByDomain[domain],
    getAuthDomainByPath: (pathname: string | null | undefined) => {
      if (pathname?.startsWith('/admin')) return 'admin';
      if (pathname?.startsWith('/enterprise')) return 'enterprise';
      return 'user';
    },
    getStorageKeyByDomain: (domain: 'user' | 'enterprise' | 'admin') => `auth-storage-${domain}`,
  };
});

import apiClient from '@/lib/api/client';

function getResponseSuccessInterceptor() {
  const { successHandler } = getResponseHandlers();
  if (!successHandler) {
    throw new Error('response success interceptor not initialized');
  }
  return successHandler;
}

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setResponseHandlers(getResponseHandlers().successHandler, getResponseHandlers().errorHandler);
    window.history.pushState({}, '', '/');
  });

  it('should be defined', () => {
    expect(apiClient).toBeDefined();
  });

  it('should have HTTP methods', () => {
    expect(typeof apiClient.get).toBe('function');
    expect(typeof apiClient.post).toBe('function');
    expect(typeof apiClient.put).toBe('function');
    expect(typeof apiClient.delete).toBe('function');
  });

  it('should have interceptors configured', () => {
    expect(apiClient.interceptors).toBeDefined();
    expect(apiClient.interceptors.request).toBeDefined();
    expect(apiClient.interceptors.response).toBeDefined();
  });

  it('should be an axios instance', () => {
    expect(apiClient).toHaveProperty('defaults');
    expect(apiClient).toHaveProperty('interceptors');
    expect(apiClient).toHaveProperty('get');
    expect(apiClient).toHaveProperty('post');
  });

  it('should force logout and redirect to user login when wrapped response code is 401', async () => {
    const onSuccess = getResponseSuccessInterceptor();

    window.history.pushState({}, '', '/profile');
    await expect(
      onSuccess({
        data: { code: 401, message: '未登录或登录已过期', data: null },
      })
    ).rejects.toBeDefined();

    expect(mockUserLogout).toHaveBeenCalledTimes(1);
  });

  it('should force logout and redirect to admin login when wrapped response code is 401 in admin route', async () => {
    const onSuccess = getResponseSuccessInterceptor();

    window.history.pushState({}, '', '/admin/dashboard');
    await expect(
      onSuccess({
        data: { code: 401, message: '未登录或登录已过期', data: null },
      })
    ).rejects.toBeDefined();

    expect(mockAdminLogout).toHaveBeenCalledTimes(1);
  });
});
