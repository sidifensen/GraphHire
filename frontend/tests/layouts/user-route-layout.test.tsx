import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserRouteLayout from '@/app/(user)/layout';

vi.mock('@/components/Header', () => ({
  default: () => <div data-testid="header-shell">GraphHire 图谱智聘</div>,
}));

vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer-shell">© 2026 GraphHire 图谱智聘</div>,
}));

vi.mock('@/components/Sidebar', () => ({
  default: () => <aside data-testid="sidebar-shell">智聘空间</aside>,
}));

describe('(user) route layout', () => {
  it('wraps jobs route pages with header and footer but without the personal sidebar', () => {
    render(
      <UserRouteLayout>
        <div>职位页主体</div>
      </UserRouteLayout>,
    );

    expect(screen.getByTestId('header-shell')).toBeInTheDocument();
    expect(screen.getByTestId('footer-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('sidebar-shell')).not.toBeInTheDocument();
    expect(screen.getByText('职位页主体')).toBeInTheDocument();
  });
});
