import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegisterPage from '@/app/register/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/register',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

describe('RegisterPage', () => {
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
});
