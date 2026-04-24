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
});
