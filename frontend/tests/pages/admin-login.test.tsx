import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminLoginPage from '@/app/admin/login/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: {
    getState: () => ({
      setAuth: vi.fn(),
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
  });

  it('渲染管理员登录页面容器', () => {
    render(<AdminLoginPage />);
    expect(screen.getByTestId('admin-login-page')).toBeInTheDocument();
  });

  it('渲染 GraphHire 图谱智聘品牌标识', () => {
    render(<AdminLoginPage />);
    expect(screen.getByText('GraphHire 图谱智聘')).toBeInTheDocument();
  });

  it('渲染管理后台标签', () => {
    render(<AdminLoginPage />);
    const adminTags = screen.getAllByText('管理后台');
    expect(adminTags.length).toBeGreaterThan(0);
  });

  it('渲染登录表单卡片', () => {
    render(<AdminLoginPage />);
    expect(screen.getByText('登录以访问系统控制台')).toBeInTheDocument();
  });

  it('渲染用户名输入框', () => {
    render(<AdminLoginPage />);
    const accountInput = screen.getByLabelText('管理员账号 / 手机号');
    expect(accountInput).toBeInTheDocument();
    expect(accountInput).toHaveAttribute('id', 'account');
    expect(accountInput).toHaveAttribute('type', 'text');
  });

  it('渲染密码输入框', () => {
    render(<AdminLoginPage />);
    const passwordInput = screen.getByLabelText('密码');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('id', 'password');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('渲染登录按钮', () => {
    render(<AdminLoginPage />);
    const submitButton = screen.getByRole('button', { name: '登录' });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('渲染记住账号复选框', () => {
    render(<AdminLoginPage />);
    const rememberCheckbox = screen.getByLabelText('记住账号');
    expect(rememberCheckbox).toBeInTheDocument();
    expect(rememberCheckbox).toHaveAttribute('type', 'checkbox');
  });

  it('渲染忘记密码链接', () => {
    render(<AdminLoginPage />);
    expect(screen.getByText('忘记密码?')).toBeInTheDocument();
  });

  it('密码输入框初始为密码类型', () => {
    render(<AdminLoginPage />);
    const passwordInput = screen.getByLabelText('密码');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('输入框可正常输入用户名和密码', () => {
    render(<AdminLoginPage />);
    const accountInput = screen.getByLabelText('管理员账号 / 手机号') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('密码') as HTMLInputElement;

    fireEvent.change(accountInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(accountInput.value).toBe('admin');
    expect(passwordInput.value).toBe('password123');
  });

  it('提交按钮在加载状态显示加载中文本', async () => {
    const { adminApi } = await import('@/lib/api/admin');
    vi.mocked(adminApi.login).mockImplementation(() => new Promise(() => {}));

    render(<AdminLoginPage />);

    const accountInput = screen.getByLabelText('管理员账号 / 手机号') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('密码') as HTMLInputElement;
    const form = screen.getByRole('button', { name: '登录' }).closest('form') as HTMLFormElement;

    fireEvent.change(accountInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    expect(screen.getByRole('button', { name: '登录中...' })).toBeInTheDocument();
  });

  it('登录失败时显示错误提示', async () => {
    const { adminApi } = await import('@/lib/api/admin');
    vi.mocked(adminApi.login).mockRejectedValue(new Error('用户名或密码错误'));

    render(<AdminLoginPage />);

    const accountInput = screen.getByLabelText('管理员账号 / 手机号') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('密码') as HTMLInputElement;
    const form = screen.getByRole('button', { name: '登录' }).closest('form') as HTMLFormElement;

    fireEvent.change(accountInput, { target: { value: 'wrong' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('用户名或密码错误')).toBeInTheDocument();
    });
  });

  it('应用原型页面背景样式', () => {
    render(<AdminLoginPage />);
    const pageRoot = screen.getByTestId('admin-login-page');
    const style = pageRoot.getAttribute('style') ?? '';

    expect(style).toContain('circle at 0% 0%');
    expect(style).toContain('rgb(219, 233, 255)');
  });

  it('匹配原型卡片环境光装饰', () => {
    render(<AdminLoginPage />);
    const glow = screen.getByTestId('admin-login-card-glow');
    expect(glow.className).toContain('w-48');
    expect(glow.className).toContain('h-48');
    expect(glow.className).toContain('opacity-5');
  });
});
