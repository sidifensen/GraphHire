import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserLayout from '@/components/layout/UserLayout';

let pathname = '/applications';

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/components/layout/Header', () => ({
  default: () => <header>Header</header>,
}));

vi.mock('@/components/layout/Footer', () => ({
  default: () => <footer>Footer</footer>,
}));

vi.mock('@/components/layout/RouteTransition', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/user/UserSidebar', () => ({
  default: () => <aside>个人资料</aside>,
}));

describe('UserLayout applications sidebar visibility', () => {
  it('shows sidebar on /applications', () => {
    pathname = '/applications';
    render(
      <UserLayout>
        <div>投递记录主体</div>
      </UserLayout>,
    );
    expect(screen.getByText('个人资料')).toBeInTheDocument();
    expect(screen.getByText('投递记录主体')).toBeInTheDocument();
  });
});
