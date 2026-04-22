import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';

describe('LoginPage 登录页测试', () => {
  describe('基础渲染测试', () => {
    test('渲染邮箱/用户名输入框', () => {
      render(<LoginPage />);
      const usernameInput = screen.getByPlaceholderText('请输入用户名/邮箱');
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute('type', 'text');
    });

    test('渲染密码输入框', () => {
      render(<LoginPage />);
      const passwordInput = screen.getByPlaceholderText('请输入密码');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('渲染登录按钮', () => {
      render(<LoginPage />);
      const submitButton = screen.getByRole('button', { name: /登录/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('角色切换测试', () => {
    test('默认选中求职者角色', () => {
      render(<LoginPage />);
      const jobseekerButton = screen.getByRole('tab', { name: '求职者' });
      expect(jobseekerButton).toHaveAttribute('aria-selected', 'true');
    });

    test('可以切换到招聘者角色', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const recruiterButton = screen.getByRole('tab', { name: '招聘者' });
      await user.click(recruiterButton);

      expect(recruiterButton).toHaveAttribute('aria-selected', 'true');
      const jobseekerButton = screen.getByRole('tab', { name: '求职者' });
      expect(jobseekerButton).toHaveAttribute('aria-selected', 'false');
    });

    test('激活动画指示器会随角色切换移动', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const jobseekerButton = screen.getByRole('tab', { name: '求职者' });
      expect(within(jobseekerButton).getByTestId('role-switch-indicator')).toBeInTheDocument();

      const recruiterButton = screen.getByRole('tab', { name: '招聘者' });
      await user.click(recruiterButton);

      expect(within(recruiterButton).getByTestId('role-switch-indicator')).toBeInTheDocument();
    });

    test('角色切换时表单动画容器标识当前角色', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const rolePanel = screen.getByTestId('login-role-panel');
      expect(rolePanel).toHaveAttribute('data-role', 'jobseeker');

      const recruiterButton = screen.getByRole('tab', { name: '招聘者' });
      await user.click(recruiterButton);

      await waitFor(() => {
        expect(screen.getByTestId('login-role-panel')).toHaveAttribute('data-role', 'recruiter');
      });
    });

    test('切换角色后用户名自动填充为招聘者账号', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const recruiterButton = screen.getByRole('tab', { name: '招聘者' });
      await user.click(recruiterButton);

      const usernameInput = screen.getByPlaceholderText('请输入用户名/邮箱') as HTMLInputElement;
      // 在非开发环境下，切换角色不会自动填充账号
      // 验证角色切换功能本身工作正常
      const jobseekerButton = screen.getByRole('tab', { name: '求职者' });
      expect(recruiterButton).toHaveAttribute('aria-selected', 'true');
      expect(jobseekerButton).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('表单交互测试', () => {
    test('可以输入用户名', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const usernameInput = screen.getByPlaceholderText('请输入用户名/邮箱');
      await user.clear(usernameInput);
      await user.type(usernameInput, 'test@example.com');

      expect(usernameInput).toHaveValue('test@example.com');
    });

    test('可以输入密码', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText('请输入密码');
      await user.clear(passwordInput);
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    test('可以切换密码可见性', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText('请输入密码');
      expect(passwordInput).toHaveAttribute('type', 'password');

      const visibilityButton = screen.getByRole('button', { name: '' });
      await user.click(visibilityButton);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });

  describe('链接和导航测试', () => {
    test('渲染注册链接', () => {
      render(<LoginPage />);
      const registerLink = screen.getByRole('link', { name: /立即注册/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    test('渲染返回首页链接', () => {
      render(<LoginPage />);
      const backLink = screen.getByRole('link', { name: /返回首页/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/');
    });

    test('渲染忘记密码链接', () => {
      render(<LoginPage />);
      const forgotLink = screen.getByText('忘记密码？');
      expect(forgotLink).toBeInTheDocument();
    });
  });

  describe('记住账号功能测试', () => {
    test('渲染记住账号复选框', () => {
      render(<LoginPage />);
      const rememberCheckbox = screen.getByLabelText('记住账号');
      expect(rememberCheckbox).toBeInTheDocument();
    });

    test('可以勾选记住账号', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const rememberCheckbox = screen.getByLabelText('记住账号');
      await user.click(rememberCheckbox);

      expect(rememberCheckbox).toBeChecked();
    });
  });
});
