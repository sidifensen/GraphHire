import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AdminShell from '@/components/admin/AdminShell';

vi.mock('@/components/admin/AdminSidebar', () => ({
  AdminSidebar: () => <aside data-testid="admin-sidebar" />,
}));

vi.mock('@/components/admin/AdminTopbar', () => ({
  default: () => <header data-testid="admin-topbar" />,
}));

describe('AdminShell', () => {
  it('wraps main content with route transition container', () => {
    render(
      <AdminShell>
        <div data-testid="admin-page-content">内容区域</div>
      </AdminShell>
    );

    expect(screen.getByTestId('admin-route-transition')).toBeInTheDocument();
    expect(screen.getByTestId('admin-page-content')).toBeInTheDocument();
  });
});
