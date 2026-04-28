import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserLayout from '@/components/layout/UserLayout';

const usePathnameMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/components/layout/Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('@/components/layout/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('@/components/user/UserSidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('@/components/layout/RouteTransition', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('UserLayout footer visibility by route', () => {
  it('hides footer on job detail route', () => {
    usePathnameMock.mockReturnValue('/jobs/123');
    render(<UserLayout><div>content</div></UserLayout>);
    expect(screen.queryByTestId('footer')).toBeNull();
  });

  it('shows footer on non-detail route', () => {
    usePathnameMock.mockReturnValue('/jobs');
    render(<UserLayout><div>content</div></UserLayout>);
    expect(screen.getByTestId('footer')).toBeDefined();
  });
});
