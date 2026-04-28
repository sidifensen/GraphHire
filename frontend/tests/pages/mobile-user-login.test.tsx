import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/mobile-user/login/page';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockUserSetAuth = vi.fn();
const mockEnterpriseSetAuth = vi.fn();

vi.mock('@/app/mobile-user/_lib/router', () => ({
  Link: ({ children, to, ...rest }: any) => <a href={to} {...rest}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

vi.mock('@/lib/api/auth', () => ({
  authApi: {
    login: (...args: unknown[]) => mockLogin(...args),
  },
}));

vi.mock('@/lib/stores/auth-store', () => ({
  userAuthStore: {
    getState: () => ({
      setAuth: mockUserSetAuth,
    }),
  },
  enterpriseAuthStore: {
    getState: () => ({
      setAuth: mockEnterpriseSetAuth,
    }),
  },
}));

describe('MobileUserLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses role-based dev accounts by default and when switching role', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText('用户名/邮箱');
    const passwordInput = screen.getByLabelText('密码');

    expect(usernameInput).toHaveValue('13800138001@phone.com');
    expect(passwordInput).toHaveValue('password123');

    await user.click(screen.getByRole('button', { name: '招聘者' }));

    expect(usernameInput).toHaveValue('hr@techchina.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls login api and writes user auth store for jobseeker login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      accessToken: 'access-u',
      refreshToken: 'refresh-u',
      userType: 'PERSON',
      userId: 101,
    });

    render(<LoginPage />);
    await user.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: '13800138001@phone.com',
        password: 'password123',
      });
      expect(mockUserSetAuth).toHaveBeenCalledWith(
        { accessToken: 'access-u', refreshToken: 'refresh-u' },
        { id: 101, username: '13800138001@phone.com', type: 'PERSON' },
      );
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('calls login api and writes enterprise auth store for recruiter login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      accessToken: 'access-e',
      refreshToken: 'refresh-e',
      userType: 'COMPANY',
      userId: 202,
    });

    render(<LoginPage />);
    await user.click(screen.getByRole('button', { name: '招聘者' }));
    await user.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'hr@techchina.com',
        password: 'password123',
      });
      expect(mockEnterpriseSetAuth).toHaveBeenCalledWith(
        { accessToken: 'access-e', refreshToken: 'refresh-e' },
        { id: 202, username: 'hr@techchina.com', type: 'COMPANY' },
      );
      expect(mockNavigate).toHaveBeenCalledWith('/enterprise/dashboard');
    });
  });
});
