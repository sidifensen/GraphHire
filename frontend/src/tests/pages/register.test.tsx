import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import RegisterPage from '@/app/register/page';
import { authApi } from '@/lib/api/auth';

describe('RegisterPage', () => {
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
});
