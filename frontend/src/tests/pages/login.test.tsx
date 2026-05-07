import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

const originalLocation = window.location;

describe('LoginPage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, search: '' },
    });
  });

  const renderLoginPage = async () => {
    const { default: LoginPage } = await import('@/app/login/page');
    render(<LoginPage />);
  };

  test('显示邮箱与密码输入框', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    await renderLoginPage();
    expect(screen.getByPlaceholderText('请输入邮箱')).toHaveAttribute('type', 'email');
    expect(screen.getByPlaceholderText('请输入密码')).toHaveAttribute('type', 'password');
  });

  test('默认自动填充求职者测试账号', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    await renderLoginPage();
    expect(screen.getByPlaceholderText('请输入邮箱')).toHaveValue('13800138001@phone.com');
    expect(screen.getByPlaceholderText('请输入密码')).toHaveValue('password123');
  });

  test('切换到招聘者后自动填充招聘者测试账号', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const user = userEvent.setup();
    await renderLoginPage();

    await user.click(screen.getByRole('tab', { name: '招聘者' }));

    expect(screen.getByPlaceholderText('请输入邮箱')).toHaveValue('hr@techchina.com');
    expect(screen.getByPlaceholderText('请输入密码')).toHaveValue('password123');
  });

  test('切回求职者后恢复求职者测试账号', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const user = userEvent.setup();
    await renderLoginPage();

    await user.click(screen.getByRole('tab', { name: '招聘者' }));
    await user.click(screen.getByRole('tab', { name: '求职者' }));

    expect(screen.getByPlaceholderText('请输入邮箱')).toHaveValue('13800138001@phone.com');
    expect(screen.getByPlaceholderText('请输入密码')).toHaveValue('password123');
  });

  test('点击注册后在同页切换为注册表单', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const user = userEvent.setup();
    await renderLoginPage();

    await user.click(screen.getByRole('button', { name: '去注册' }));

    expect(screen.getByRole('button', { name: '创建账号' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('6位验证码')).toHaveAttribute('type', 'text');
  });

  test('当 review=pending 时展示审核提示', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, search: '?review=pending' },
    });

    await renderLoginPage();
    expect(screen.getByText('该公司正在审核中，当前无法进入企业端。请等待管理员审核通过后再登录。')).toBeInTheDocument();
  });
});
