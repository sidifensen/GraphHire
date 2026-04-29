import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '@/app/register/page';

const mockPush = vi.fn();
const mockSendVerifyCode = vi.fn();
const mockPersonRegister = vi.fn();
const mockCompanyRegister = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/register',
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
    sendVerifyCode: (...args: unknown[]) => mockSendVerifyCode(...args),
    personRegister: (...args: unknown[]) => mockPersonRegister(...args),
    companyRegister: (...args: unknown[]) => mockCompanyRegister(...args),
  },
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', () => {
    render(<RegisterPage />);
    expect(screen.getByText('创建账号')).toBeDefined();
  });

  it('renders role switcher', () => {
    render(<RegisterPage />);
    expect(screen.getByText('求职者')).toBeDefined();
    expect(screen.getByText('招聘者')).toBeDefined();
  });

  it('renders form fields', () => {
    render(<RegisterPage />);
    expect(screen.getByText('邮箱')).toBeDefined();
    expect(screen.getByText('验证码')).toBeDefined();
    expect(screen.getByText('密码')).toBeDefined();
    expect(screen.getByText('确认密码')).toBeDefined();
  });

  it('renders verification code button', () => {
    render(<RegisterPage />);
    expect(screen.getByText('获取验证码')).toBeDefined();
  });

  it('renders submit button', () => {
    render(<RegisterPage />);
    expect(screen.getByText('立即注册')).toBeDefined();
  });

  it('renders login link', () => {
    render(<RegisterPage />);
    expect(screen.getByText('立即登录')).toBeDefined();
  });

  it('shows backend recruiter register error message', async () => {
    const user = userEvent.setup();
    mockCompanyRegister.mockRejectedValueOnce({
      response: { data: { message: '验证码错误或已过期' } },
    });

    render(<RegisterPage />);
    await user.click(screen.getByRole('button', { name: '招聘者' }));
    await user.type(screen.getByPlaceholderText('请输入邮箱地址'), 'corp@example.com');
    await user.type(screen.getByPlaceholderText('6 位验证码'), '123456');
    await user.type(screen.getByPlaceholderText('设置 8-20 位密码，包含字母和数字'), 'Test12345');
    await user.type(screen.getByPlaceholderText('请再次输入密码'), 'Test12345');
    await user.type(screen.getByPlaceholderText('请输入营业执照上的公司全称'), '测试科技有限公司');
    await user.type(screen.getByPlaceholderText('请输入 18 位信用代码'), '91330100MA27X1X2X3');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: '立即注册' }));

    await waitFor(() => {
      expect(screen.getByText('验证码错误或已过期')).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  }, 15000);

  it('shows chinese timeout error when send verify code times out', async () => {
    const user = userEvent.setup();
    mockSendVerifyCode.mockRejectedValueOnce({
      code: 'ECONNABORTED',
      message: 'timeout of 30000ms exceeded',
    });

    render(<RegisterPage />);
    await user.type(screen.getByPlaceholderText('请输入邮箱地址'), 'corp@example.com');
    await user.click(screen.getByRole('button', { name: '获取验证码' }));

    await waitFor(() => {
      expect(screen.getByText('请求超时，请稍后重试')).toBeInTheDocument();
    });
  }, 15000);
});
