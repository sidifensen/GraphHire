import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';

const { usePathnameMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(() => '/admin/dashboard'),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock('@/components/admin/AdminShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-shell">{children}</div>,
}));

vi.mock('@/components/admin/AdminAuthGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-auth-guard">{children}</div>,
}));

describe('AdminLayoutShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('非登录页同时挂载鉴权守卫与壳层', () => {
    usePathnameMock.mockReturnValue('/admin/dashboard');

    render(
      <AdminLayoutShell>
        <div>dashboard</div>
      </AdminLayoutShell>,
    );

    expect(screen.getByTestId('admin-auth-guard')).toBeInTheDocument();
    expect(screen.getByTestId('admin-shell')).toBeInTheDocument();
    expect(screen.getByText('dashboard')).toBeInTheDocument();
  });

  it('登录页仅挂载鉴权守卫且不渲染壳层', () => {
    usePathnameMock.mockReturnValue('/admin/login');

    render(
      <AdminLayoutShell>
        <div>login</div>
      </AdminLayoutShell>,
    );

    expect(screen.getByTestId('admin-auth-guard')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-shell')).not.toBeInTheDocument();
    expect(screen.getByText('login')).toBeInTheDocument();
  });
});

