import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserLayout from '@/components/layout/UserLayout';

let pathname = '/chat';

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

describe('UserLayout chat sidebar visibility', () => {
  it('shows sidebar on /chat', () => {
    pathname = '/chat';
    render(
      <UserLayout>
        <div>沟通消息主体</div>
      </UserLayout>,
    );
    expect(screen.getByText('个人资料')).toBeInTheDocument();
    expect(screen.getByText('沟通消息主体')).toBeInTheDocument();
  });
});
