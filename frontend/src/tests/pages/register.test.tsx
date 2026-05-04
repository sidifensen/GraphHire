import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import RegisterPage from '@/app/register/page';
import { authApi } from '@/lib/api/auth';

const originalLocation = window.location;

describe('RegisterPage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, search: '' },
    });
  });

  test('默认不自动填充注册信息', () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText('请输入邮箱')).toHaveValue('');
    expect(screen.getByPlaceholderText('6位验证码')).toHaveValue('');
    expect(screen.getByPlaceholderText('至少8位字符')).toHaveValue('');
  });

  test('切换到招聘者时显示企业字段', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.click(screen.getByRole('tab', { name: '我是招聘者' }));

    expect(screen.getByPlaceholderText('请输入企业全称')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('18位验证码或数字')).toBeInTheDocument();
  });

  test('发送验证码时调用邮箱验证码接口', async () => {
    const user = userEvent.setup();
    const sendVerifyCodeMock = vi.spyOn(authApi, 'sendVerifyCode').mockResolvedValue(undefined);
    sendVerifyCodeMock.mockResolvedValue(undefined);

    render(<RegisterPage />);
    await user.type(screen.getByPlaceholderText('请输入邮箱'), 'new-user@example.com');
    await user.click(screen.getByRole('button', { name: '获取验证码' }));

    expect(sendVerifyCodeMock).toHaveBeenCalledWith('new-user@example.com', 'register');
  });

  test('注册页禁用账号密码自动填充且提交按钮为纯色', () => {
    render(<RegisterPage />);

    const emailInput = screen.getByPlaceholderText('请输入邮箱');
    const passwordInput = screen.getByPlaceholderText('至少8位字符');
    const confirmPasswordInput = screen.getByPlaceholderText('再次输入密码');
    const submitButton = screen.getByRole('button', { name: '创建账号' });

    expect(emailInput).toHaveAttribute('autocomplete', 'off');
    expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
    expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password');
    expect(submitButton.className).not.toContain('bg-gradient-to-r');
  });

  test('点击登录后在同页切换为登录表单', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.click(screen.getByRole('button', { name: '去登录' }));

    expect(screen.getByRole('button', { name: '立即登录' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入密码')).toHaveAttribute('type', 'password');
  });

  test('当 role=enterprise 时默认展示招聘者注册表单', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, search: '?role=enterprise' },
    });

    render(<RegisterPage />);

    expect(screen.getByRole('tab', { name: '我是招聘者' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByPlaceholderText('请输入企业全称')).toBeInTheDocument();
  });
});
