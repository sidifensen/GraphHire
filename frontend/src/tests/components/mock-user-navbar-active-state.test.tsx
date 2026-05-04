import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

let pathname = '/personal-info';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ id: '1' }),
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/api/person', () => ({
  personApi: {
    getProfile: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@/app/(user)/_mock/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
  }),
}));

import Navbar from '@/app/(user)/_mock/components/Navbar';

describe('MockUser Navbar active state', () => {
  it('桌面导航容器不应被 max-width 限制，保证左右贴边布局', () => {
    pathname = '/';
    render(<Navbar />);

    const nav = screen.getByRole('navigation');
    const innerContainer = nav.firstElementChild as HTMLElement | null;

    expect(innerContainer).not.toBeNull();
    expect(innerContainer?.className).not.toContain('max-w-7xl');
    expect(innerContainer?.className).not.toContain('mx-auto');
    expect(innerContainer?.className).toContain('w-full');
  });

  it('keeps 我的 active on my sub pages', () => {
    pathname = '/personal-info';
    render(<Navbar />);

    const myLink = screen.getByRole('link', { name: '我的' });
    const homeLink = screen.getByRole('link', { name: '首页' });

    expect(myLink.className).toContain('text-white');
    expect(homeLink.className).not.toContain('text-white');
  });

  it('uses /profile as 我的 target', () => {
    pathname = '/profile';
    render(<Navbar />);

    const myLink = screen.getByRole('link', { name: '我的' });
    expect(myLink).toHaveAttribute('href', '/profile');
  });

  it('keeps 我的 active on skill graph path mapping', () => {
    pathname = '/skill-graph';
    render(<Navbar />);

    const myLink = screen.getByRole('link', { name: '我的' });
    const homeLink = screen.getByRole('link', { name: '首页' });

    expect(myLink.className).toContain('text-white');
    expect(homeLink.className).not.toContain('text-white');
  });

  it('does not highlight any desktop nav item on notifications page', () => {
    pathname = '/notifications';
    render(<Navbar />);

    expect(screen.queryByTestId('desktop-nav-indicator')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '首页' }).className).not.toContain('text-white');
    expect(screen.getByRole('link', { name: '职位' }).className).not.toContain('text-white');
    expect(screen.getByRole('link', { name: '公司' }).className).not.toContain('text-white');
    expect(screen.getByRole('link', { name: '我的' }).className).not.toContain('text-white');
  });
});
