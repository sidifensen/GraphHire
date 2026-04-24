import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

const logoutMock = vi.fn();

vi.mock('@/lib/logout', () => ({
  logoutWithServerInvalidation: (...args: unknown[]) => logoutMock(...args),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  adminAuthStore: (selector: (state: { user: { username: string; type: string }; isAuthenticated: boolean }) => unknown) =>
    selector({
      user: { username: 'admin', type: 'ADMIN' },
      isAuthenticated: true,
    }),
}));

import AdminShell from '@/components/admin/AdminShell';

describe('AdminShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders brand, sidebar, and topbar search with user dropdown', async () => {
    const user = userEvent.setup();

    render(
      <AdminShell activeItem="dashboard">
        <div>content</div>
      </AdminShell>
    );

    expect(screen.getByText('GraphHire')).toBeInTheDocument();
    expect(screen.getByText('图谱智聘管理端')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('搜索...')).toBeInTheDocument();

    await user.click(screen.getByTestId('admin-header-avatar-btn'));
    expect(screen.getByText('退出登录')).toBeInTheDocument();
  });

  it('toggles dark mode from header button', async () => {
    const user = userEvent.setup();
    document.documentElement.classList.remove('dark');

    render(
      <AdminShell activeItem="dashboard">
        <div>content</div>
      </AdminShell>
    );

    const toggle = screen.getByTestId('admin-theme-toggle-btn');
    await user.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await user.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('uses dedicated dark-mode surfaces for sidebar, main background, and cards', () => {
    render(
      <AdminShell activeItem="dashboard">
        <article data-testid="mock-card" className="bg-white">
          card
        </article>
      </AdminShell>
    );

    expect(screen.getByTestId('admin-sidebar-root').className).toContain('dark:bg-black');
    expect(screen.getByTestId('admin-main-root').className).toContain('dark:bg-gray-700');
  });
});
