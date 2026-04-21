import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  it('renders brand and login title', () => {
    render(<AdminLoginPage />);
    expect(screen.getByText('GraphHire 图谱智聘')).toBeDefined();
    expect(screen.getAllByText('管理后台').length).toBeGreaterThan(0);
  });

  it('renders stronger page background gradient hooks', () => {
    render(<AdminLoginPage />);
    const background = screen.getByTestId('admin-login-background');
    const style = background.getAttribute('style') ?? '';

    expect(style).toContain('circle at 0% 0%');
    expect(style).toContain('rgb(0, 61, 166)');
    expect(style).toContain('circle at 100% 100%');
  });

  it('renders card ambient glow decoration', () => {
    render(<AdminLoginPage />);
    expect(screen.getByTestId('admin-login-card-glow')).toBeDefined();
  });
});
