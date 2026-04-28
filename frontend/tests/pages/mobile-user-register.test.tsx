import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '@/app/mobile-user/register/page';

const mockNavigate = vi.fn();
const mockSendVerifyCode = vi.fn();
const mockPersonRegister = vi.fn();
const mockCompanyRegister = vi.fn();
const mockUserSetAuth = vi.fn();
const mockEnterpriseSetAuth = vi.fn();

vi.mock('@/app/mobile-user/_lib/router', () => ({
  Link: ({ children, to, ...rest }: any) => <a href={to} {...rest}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

vi.mock('@/lib/api/auth', () => ({
  authApi: {
    sendVerifyCode: (...args: unknown[]) => mockSendVerifyCode(...args),
    personRegister: (...args: unknown[]) => mockPersonRegister(...args),
    companyRegister: (...args: unknown[]) => mockCompanyRegister(...args),
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

describe('MobileUserRegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('calls send verify code api with register type', async () => {
    const user = userEvent.setup();
    mockSendVerifyCode.mockResolvedValueOnce(undefined);

    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText('请输入邮箱地址'), 'mobile@example.com');
    await user.click(screen.getByRole('button', { name: '获取验证码' }));

    await waitFor(() => {
      expect(mockSendVerifyCode).toHaveBeenCalledWith('mobile@example.com', 'register');
    });
  });

  it('submits recruiter registration to companyRegister and navigates to enterprise dashboard', async () => {
    const user = userEvent.setup();
    mockCompanyRegister.mockResolvedValueOnce({
      accessToken: 'access-enterprise',
      refreshToken: 'refresh-enterprise',
      userType: 'COMPANY',
      userId: 301,
    });

    render(<RegisterPage />);

    await user.click(screen.getByRole('button', { name: '招聘者' }));
    await user.type(screen.getByPlaceholderText('请输入邮箱地址'), 'corp@example.com');
    await user.type(screen.getByPlaceholderText('6 位验证码'), '123456');
    await user.type(screen.getByPlaceholderText('设置 8-20 位密码，包含字母和数字'), 'Test12345');
    await user.type(screen.getByPlaceholderText('请再次输入密码'), 'Test12345');
    await user.type(screen.getByPlaceholderText('请输入营业执照上的公司全称'), '测试企业');
    await user.type(screen.getByPlaceholderText('请输入 18 位信用代码'), '91330100MA27X1X2X3');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: '创建账号' }));

    await waitFor(() => {
      expect(mockCompanyRegister).toHaveBeenCalledWith({
        username: 'corp@example.com',
        password: 'Test12345',
        verifyCode: '123456',
        companyName: '测试企业',
        unifiedSocialCreditCode: '91330100MA27X1X2X3',
      });
      expect(mockEnterpriseSetAuth).toHaveBeenCalledWith(
        { accessToken: 'access-enterprise', refreshToken: 'refresh-enterprise' },
        { id: 301, username: 'corp@example.com', type: 'COMPANY' },
      );
      expect(mockNavigate).toHaveBeenCalledWith('/enterprise/dashboard');
    });
  });

  it('shows pending-review notice and redirects to login pending page for recruiter review message', async () => {
    const user = userEvent.setup();
    const timeoutSpy = vi.spyOn(window, 'setTimeout');
    mockCompanyRegister.mockRejectedValueOnce({
      response: { data: { message: '该公司正在审核中，暂不可进入企业端' } },
    });

    render(<RegisterPage />);

    await user.click(screen.getByRole('button', { name: '招聘者' }));
    await user.type(screen.getByPlaceholderText('请输入邮箱地址'), 'corp@example.com');
    await user.type(screen.getByPlaceholderText('6 位验证码'), '123456');
    await user.type(screen.getByPlaceholderText('设置 8-20 位密码，包含字母和数字'), 'Test12345');
    await user.type(screen.getByPlaceholderText('请再次输入密码'), 'Test12345');
    await user.type(screen.getByPlaceholderText('请输入营业执照上的公司全称'), '测试企业');
    await user.type(screen.getByPlaceholderText('请输入 18 位信用代码'), '91330100MA27X1X2X3');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: '创建账号' }));

    await waitFor(() => {
      expect(screen.getByText('注册成功，企业已提交管理员审核。审核通过后即可进入企业端。')).toBeInTheDocument();
    });
    expect(timeoutSpy).toHaveBeenCalled();
    const redirectCall = timeoutSpy.mock.calls.find((args) => args[1] === 1200);
    const redirectCallback = redirectCall?.[0];
    if (typeof redirectCallback === 'function') {
      redirectCallback();
    }
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login?review=pending');
    });
    timeoutSpy.mockRestore();
  });
});
