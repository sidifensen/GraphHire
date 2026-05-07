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

const originalLocation = window.location;

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
    vi.unstubAllEnvs();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, search: '' },
    });
  });

  it('默认不预填测试账号密码', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('请输入邮箱')).toHaveValue('');
    expect(screen.getByPlaceholderText('请输入密码')).toHaveValue('');
  });

  it('development 模式下使用环境变量预填测试账号', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_DEV_JOBSEEKER_USERNAME', 'dev-user@example.com');
    vi.stubEnv('NEXT_PUBLIC_DEV_JOBSEEKER_PASSWORD', 'dev-password');
    vi.stubEnv('NEXT_PUBLIC_DEV_RECRUITER_USERNAME', 'dev-hr@example.com');
    vi.stubEnv('NEXT_PUBLIC_DEV_RECRUITER_PASSWORD', 'dev-hr-password');
    const { default: DevLoginPage } = await import('@/app/login/page');

    render(<DevLoginPage />);
    expect(screen.getByPlaceholderText('请输入邮箱')).toHaveValue('dev-user@example.com');
    expect(screen.getByPlaceholderText('请输入密码')).toHaveValue('dev-password');
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
    await user.type(screen.getByPlaceholderText('请输入邮箱'), 'hr@techchina.com');
    await user.type(screen.getByPlaceholderText('请输入密码'), 'password123');

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
    await user.type(screen.getByPlaceholderText('请输入邮箱'), 'hr@techchina.com');
    await user.type(screen.getByPlaceholderText('请输入密码'), 'password123');
    await user.click(screen.getByRole('button', { name: '立即登录' }));

    await waitFor(() => {
      expect(screen.getByText(/当前账号不是/)).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('switches to register form on same page when clicking register tab', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole('button', { name: '去注册' }));

    expect(screen.getByRole('button', { name: '创建账号' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('6位验证码')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows review pending notice when review=pending', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, search: '?review=pending' },
    });

    render(<LoginPage />);
    expect(screen.getByText('该公司正在审核中，当前无法进入企业端。请等待管理员审核通过后再登录。')).toBeInTheDocument();
  });
});
