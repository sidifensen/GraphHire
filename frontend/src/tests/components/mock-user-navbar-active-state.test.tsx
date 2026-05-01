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
  it('keeps 我的 active on my sub pages', () => {
    pathname = '/personal-info';
    render(<Navbar />);

    const myLink = screen.getByRole('link', { name: '我的' });
    const homeLink = screen.getByRole('link', { name: '首页' });

    expect(myLink.className).toContain('text-white');
    expect(homeLink.className).not.toContain('text-white');
  });

  it('keeps 我的 active on skill graph path mapping', () => {
    pathname = '/skill-graph';
    render(<Navbar />);

    const myLink = screen.getByRole('link', { name: '我的' });
    const homeLink = screen.getByRole('link', { name: '首页' });

    expect(myLink.className).toContain('text-white');
    expect(homeLink.className).not.toContain('text-white');
  });
});
