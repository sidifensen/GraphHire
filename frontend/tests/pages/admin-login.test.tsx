import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminLoginPage from '@/app/admin/login/page';
import { adminApi } from '@/lib/api/admin';

const pushMock = vi.fn();
const setAuthMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  adminAuthStore: {
    getState: () => ({
      setAuth: setAuthMock,
    }),
  },
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    login: vi.fn(),
  },
}));

describe('AdminLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('开发模式下自动填充测试账号与密码', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'development');
    const { default: DevAdminLoginPage } = await import('@/app/admin/login/page');

    render(<DevAdminLoginPage />);

    expect(screen.getByLabelText('账号')).toHaveValue('admin@graphhire.com');
    expect(screen.getByLabelText('密码')).toHaveValue('password123');
  });

  it('展示重构后的登录页核心文案', () => {
    render(<AdminLoginPage />);

    expect(screen.getByText('欢迎回来')).toBeInTheDocument();
    expect(screen.getByText('请登录以继续管理 GraphHire 平台')).toBeInTheDocument();
    expect(screen.getByLabelText('账号')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
    expect(screen.queryByText('快捷登录')).not.toBeInTheDocument();
    expect(screen.queryByText('手机号')).not.toBeInTheDocument();
    expect(screen.queryByText('记住我')).not.toBeInTheDocument();
    expect(screen.queryByText('忘记密码?')).not.toBeInTheDocument();
    expect(screen.queryByText('申请内部账号')).not.toBeInTheDocument();
  });

  it('登录成功后写入管理员鉴权并跳转仪表盘', async () => {
    vi.mocked(adminApi.login).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 7200,
      userType: 'ADMIN',
      userId: 7,
    });

    render(<AdminLoginPage />);

    fireEvent.change(screen.getByLabelText('账号'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(adminApi.login).toHaveBeenCalledWith({ username: 'admin', password: '123456' });
      expect(setAuthMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('登录失败时展示错误文案', async () => {
    vi.mocked(adminApi.login).mockRejectedValue(new Error('用户名或密码错误'));

    render(<AdminLoginPage />);

    fireEvent.change(screen.getByLabelText('账号'), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(await screen.findByText('用户名或密码错误')).toBeInTheDocument();
  });
});
