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

  it('applies prototype page background directly on page root', () => {
    render(<AdminLoginPage />);
    const pageRoot = screen.getByTestId('admin-login-page');
    const style = pageRoot.getAttribute('style') ?? '';

    expect(style).toContain('circle at 0% 0%');
    expect(style).toContain('rgb(219, 233, 255)');
    expect(style).toContain('circle at 100% 100%');
    expect(style).toContain('rgb(229, 238, 255)');
    expect(style).toContain('background-color: rgb(248, 249, 255)');
  });

  it('matches prototype card ambient glow decoration', () => {
    render(<AdminLoginPage />);
    const glow = screen.getByTestId('admin-login-card-glow');
    expect(glow.className).toContain('w-48');
    expect(glow.className).toContain('h-48');
    expect(glow.className).toContain('opacity-5');
  });
});
