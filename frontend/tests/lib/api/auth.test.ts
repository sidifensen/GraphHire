/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPost, mockGet } = vi.hoisted(() => {
  return {
    mockPost: vi.fn(),
    mockGet: vi.fn(),
  };
});

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn((cb) => cb({ headers: {} })) },
        response: { use: vi.fn() },
      },
      get: mockGet,
      post: mockPost,
      put: vi.fn(),
      delete: vi.fn(),
      defaults: { timeout: 30000, headers: { 'Content-Type': 'application/json' } },
    })),
  },
}));

import { authApi } from '@/lib/api/auth';

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call /auth/login with correct data', async () => {
      mockPost.mockResolvedValue({ data: { accessToken: 'token123' } });

      await authApi.login({ username: 'testuser', password: 'password123' });

      expect(mockPost).toHaveBeenCalledWith('/auth/login', { username: 'testuser', password: 'password123' });
    });

    it('should return login response with accessToken', async () => {
      mockPost.mockResolvedValue({ data: { accessToken: 'token123', user: { id: 1 } } });

      const result = await authApi.login({ username: 'test', password: 'test' });

      expect(result.accessToken).toBe('token123');
    });
  });

  describe('personRegister', () => {
    it('should call /auth/register/person with data', async () => {
      mockPost.mockResolvedValue({ data: {} });
      const data = { username: 'newuser', password: 'pass123', email: 'test@example.com' };

      await authApi.personRegister(data);

      expect(mockPost).toHaveBeenCalledWith('/auth/register/person', data);
    });
  });

  describe('companyRegister', () => {
    it('should call /auth/register/company with data', async () => {
      mockPost.mockResolvedValue({ data: {} });
      const data = { username: 'company', password: 'pass', email: 'corp@example.com' };

      await authApi.companyRegister(data);

      expect(mockPost).toHaveBeenCalledWith('/auth/register/company', data);
    });
  });

  describe('logout', () => {
    it('should call POST /auth/logout', async () => {
      mockPost.mockResolvedValue({});

      await authApi.logout();

      expect(mockPost).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('getCurrentUser', () => {
    it('should call GET /auth/current', async () => {
      mockGet.mockResolvedValue({ data: 42 });

      const result = await authApi.getCurrentUser();

      expect(mockGet).toHaveBeenCalledWith('/auth/current');
      expect(result).toBe(42);
    });
  });

  describe('validateToken', () => {
    it('should call GET /auth/validate', async () => {
      mockGet.mockResolvedValue({ data: true });

      const result = await authApi.validateToken();

      expect(mockGet).toHaveBeenCalledWith('/auth/validate');
      expect(result).toBe(true);
    });
  });

  describe('adminLogin', () => {
    it('should call /auth/admin/login', async () => {
      mockPost.mockResolvedValue({ data: { accessToken: 'admin-token' } });
      const data = { username: 'admin', password: 'adminpass' };

      await authApi.adminLogin(data);

      expect(mockPost).toHaveBeenCalledWith('/auth/admin/login', data);
    });
  });

  describe('sendVerifyCode', () => {
    it('should call POST /auth/send-verify-code with params', async () => {
      mockPost.mockResolvedValue({});
      const email = 'test@example.com';

      await authApi.sendVerifyCode(email, 'register');

      expect(mockPost).toHaveBeenCalledWith('/auth/send-verify-code', null, {
        params: { email, type: 'register' },
        timeout: 60000,
      });
    });
  });

  describe('forgotPassword', () => {
    it('should call /auth/forgot-password', async () => {
      mockPost.mockResolvedValue({});
      const data = { email: 'test@example.com', verifyCode: '123456' };

      await authApi.forgotPassword(data);

      expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', data);
    });
  });

  describe('resetPassword', () => {
    it('should call /auth/reset-password', async () => {
      mockPost.mockResolvedValue({});
      const data = { email: 'test@example.com', newPassword: 'newpass' };

      await authApi.resetPassword(data);

      expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', data);
    });
  });

  describe('changePassword', () => {
    it('should call /auth/change-password', async () => {
      mockPost.mockResolvedValue({});
      const data = { oldPassword: 'old', newPassword: 'new' };

      await authApi.changePassword(data);

      expect(mockPost).toHaveBeenCalledWith('/auth/change-password', data);
    });
  });

  describe('sendResetCode', () => {
    it('should call /auth/send-reset-code', async () => {
      mockPost.mockResolvedValue({});
      const data = { email: 'test@example.com' };

      await authApi.sendResetCode(data);

      expect(mockPost).toHaveBeenCalledWith('/auth/send-reset-code', data);
    });
  });
});
