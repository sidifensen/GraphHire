import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logoutWithServerInvalidation } from '@/lib/logout';
import { authApi } from '@/lib/api/auth';
import { getAuthStoreByDomain } from '@/lib/stores/auth-store';

vi.mock('@/lib/api/auth', () => ({
  authApi: {
    logout: vi.fn(),
  },
}));

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: { getState: vi.fn() },
  userAuthStore: { getState: vi.fn() },
  enterpriseAuthStore: { getState: vi.fn() },
  adminAuthStore: { getState: vi.fn() },
  getAuthStoreByDomain: vi.fn(),
  getAuthDomainByPath: vi.fn(() => 'user'),
  getStorageKeyByDomain: vi.fn(() => 'auth-storage-user'),
}));

describe('logoutWithServerInvalidation', () => {
  const mockLogoutStore = vi.fn();
  const mockRedirect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthStoreByDomain).mockReturnValue({
      getState: () => ({ logout: mockLogoutStore }),
    } as ReturnType<typeof getAuthStoreByDomain>);
  });

  it('先调用服务端退出，再清理本地状态并跳转', async () => {
    vi.mocked(authApi.logout).mockResolvedValue(undefined);

    await logoutWithServerInvalidation(mockRedirect);

    expect(authApi.logout).toHaveBeenCalledTimes(1);
    expect(mockLogoutStore).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('即使服务端退出失败，也会清理本地状态并跳转', async () => {
    vi.mocked(authApi.logout).mockRejectedValue(new Error('network error'));

    await expect(logoutWithServerInvalidation(mockRedirect)).resolves.toBeUndefined();

    expect(authApi.logout).toHaveBeenCalledTimes(1);
    expect(mockLogoutStore).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });
});
