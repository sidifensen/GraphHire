import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';

describe('LoginPage', () => {
  test('渲染简约现代布局壳层并保留登录表单输入框', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('login-layout-shell')).toBeInTheDocument();
    expect(screen.getByTestId('login-brand-panel')).toBeInTheDocument();
    expect(screen.getByTestId('login-form-panel')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入邮箱')).toHaveAttribute('type', 'email');
    expect(screen.getByPlaceholderText('请输入密码')).toHaveAttribute('type', 'password');
  });

  test('显示邮箱与密码输入框', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('请输入邮箱')).toHaveAttribute('type', 'email');
    expect(screen.getByPlaceholderText('请输入密码')).toHaveAttribute('type', 'password');
  });

  test('默认自动填充求职者测试账号', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('请输入邮箱')).toHaveValue('13800138001@phone.com');
    expect(screen.getByPlaceholderText('请输入密码')).toHaveValue('password123');
  });

  test('切换到招聘者后自动填充招聘者测试账号', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole('tab', { name: '招聘者' }));

    expect(screen.getByPlaceholderText('请输入邮箱')).toHaveValue('hr@techchina.com');
    expect(screen.getByPlaceholderText('请输入密码')).toHaveValue('password123');
  });

  test('切回求职者后恢复求职者测试账号', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole('tab', { name: '招聘者' }));
    await user.click(screen.getByRole('tab', { name: '求职者' }));

    expect(screen.getByPlaceholderText('请输入邮箱')).toHaveValue('13800138001@phone.com');
    expect(screen.getByPlaceholderText('请输入密码')).toHaveValue('password123');
  });
});
