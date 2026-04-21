import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/dashboard/page';

vi.mock('@/components/admin/AdminSidebar', () => ({
  default: () => <div data-testid="admin-sidebar">sidebar</div>,
}));

vi.mock('@/components/admin/AdminHeader', () => ({
  default: () => <div data-testid="admin-header">header</div>,
}));

describe('AdminDashboardPage', () => {
  it('renders dashboard title and shared admin shell', () => {
    const { container } = render(<AdminDashboardPage />);

    expect(screen.getByTestId('admin-sidebar')).toBeDefined();
    expect(screen.getByTestId('admin-header')).toBeDefined();
    expect(screen.getByText('数据总览')).toBeDefined();

    const shell = container.firstElementChild;
    expect(shell?.className).toContain('h-screen');
    expect(shell?.className).toContain('overflow-hidden');
  });

  it('uses the shared centered content container and scrollable main area', () => {
    const { container } = render(<AdminDashboardPage />);
    const main = container.querySelector('main');
    const constrainedShell = container.querySelector('main > div.max-w-7xl.mx-auto.w-full.space-y-8');

    expect(main?.className).toContain('overflow-y-auto');
    expect(constrainedShell).toBeTruthy();
  });
});
