import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';

const mockPush = vi.fn();
const mockLogin = vi.fn();
const mockSetUserAuth = vi.fn();
const mockSetEnterpriseAuth = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/lib/api/auth', () => ({
  authApi: {
    login: (...args: unknown[]) => mockLogin(...args),
  },
}));

vi.mock('@/lib/stores/auth-store', () => ({
  userAuthStore: {
    getState: () => ({
      setAuth: mockSetUserAuth,
    }),
  },
  enterpriseAuthStore: {
    getState: () => ({
      setAuth: mockSetEnterpriseAuth,
    }),
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits email and password, then routes person user to home', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      accessToken: 'token',
      refreshToken: 'refresh',
      expiresIn: 3600,
      userType: 'PERSON',
      userId: 1,
    });

    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText('请输入邮箱');
    const passwordInput = screen.getByPlaceholderText('请输入密码');

    await user.clear(emailInput);
    await user.type(emailInput, 'user@example.com');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'Password123');
    await user.click(screen.getByRole('button', { name: '立即登录' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'user@example.com',
        password: 'Password123',
      });
      expect(mockSetUserAuth).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('submits email and password, then routes company user to enterprise dashboard', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      accessToken: 'token',
      refreshToken: 'refresh',
      expiresIn: 3600,
      userType: 'COMPANY',
      userId: 2,
    });

    render(<LoginPage />);
    await user.click(screen.getByRole('tab', { name: '招聘者' }));
    await waitFor(() => {
      expect(screen.getByDisplayValue('hr@techchina.com')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '立即登录' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'hr@techchina.com',
        password: 'password123',
      });
      expect(mockSetEnterpriseAuth).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/enterprise/dashboard');
    });
  });

  it('shows mismatch message when recruiter role receives person account', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      accessToken: 'token',
      refreshToken: 'refresh',
      expiresIn: 3600,
      userType: 'PERSON',
      userId: 3,
    });

    render(<LoginPage />);
    await user.click(screen.getByRole('tab', { name: '招聘者' }));
    await waitFor(() => {
      expect(screen.getByDisplayValue('hr@techchina.com')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: '立即登录' }));

    await waitFor(() => {
      expect(screen.getByText(/当前账号不是/)).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
