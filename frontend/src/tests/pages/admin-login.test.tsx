import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

const { pushMock, setAuthMock, loginMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  setAuthMock: vi.fn(),
  loginMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('@/lib/api/admin', () => ({
  adminApi: {
    login: loginMock,
  },
}));

vi.mock('@/lib/stores/auth-store', () => ({
  adminAuthStore: {
    getState: () => ({
      setAuth: setAuthMock,
    }),
  },
}));

import AdminLoginPage from '@/app/admin/login/page';

describe('AdminLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders replaced login surface', () => {
    render(<AdminLoginPage />);
    expect(screen.getByText('GraphHire')).toBeInTheDocument();
    expect(screen.getByText('欢迎回来')).toBeInTheDocument();
    expect(screen.getByText('账号登录')).toBeInTheDocument();
  });

  it('submits admin credentials and navigates to dashboard', async () => {
    loginMock.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      userId: 1,
      userType: 'ADMIN',
    });

    const user = userEvent.setup();
    render(<AdminLoginPage />);

    await user.type(screen.getByPlaceholderText('请输入您的账号'), 'admin');
    await user.type(screen.getByPlaceholderText('请输入密码'), '123456');
    await user.click(screen.getByRole('button', { name: '登 录' }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledTimes(1);
      expect(setAuthMock).toHaveBeenCalledTimes(1);
      expect(pushMock).toHaveBeenCalledWith('/admin/dashboard');
    });
  });
});
