import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserLayout from '@/components/UserLayout';

// Use vi.hoisted to define mock before hoisting
const { mockState, createMockStore } = vi.hoisted(() => {
  const mockState = {
    accessToken: null as string | null,
    refreshToken: null as string | null,
    user: null as { id: number; username: string; type: string } | null,
    isAuthenticated: false,
    setAuth: vi.fn(),
    logout: vi.fn(),
  };

  const createMockStore = () => {
    const mockFn = (selector?: (state: typeof mockState) => unknown) => {
      if (typeof selector === 'function') {
        return selector(mockState);
      }
      return mockState;
    };
    mockFn.getState = () => mockState;
    mockFn.setState = vi.fn((partial) => {
      Object.assign(mockState, partial);
    });
    mockFn.subscribe = vi.fn();
    return mockFn;
  };

  return { mockState, createMockStore };
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/profile',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/lib/stores/auth-store', () => ({
  authStore: createMockStore(),
}));

const MockUserLayout = ({ children, contentClassName }: { children: React.ReactNode; contentClassName?: string }) => (
  <BrowserRouter>
    <UserLayout contentClassName={contentClassName}>
      {children}
    </UserLayout>
  </BrowserRouter>
);

describe('UserLayout', () => {
  it('renders header component', () => {
    render(<MockUserLayout children={<div>Test Content</div>} />);
    const header = document.querySelector('header');
    expect(header).toBeTruthy();
    // Logo should be in header
    const logoText = header?.textContent;
    expect(logoText).toContain('图谱智聘');
  });

  it('renders footer component', () => {
    render(<MockUserLayout children={<div>Test Content</div>} />);
    const footer = document.querySelector('footer');
    expect(footer).toBeTruthy();
  });

  it('renders sidebar component', () => {
    render(<MockUserLayout children={<div>Test Content</div>} />);
    expect(document.querySelector('aside')).toBeTruthy();
  });

  it('renders children content', () => {
    render(<MockUserLayout children={<p>Test Content</p>} />);
    expect(screen.getByText('Test Content')).toBeDefined();
  });

  it('applies custom content className', () => {
    render(<MockUserLayout children={<div>Content</div>} contentClassName="custom-class" />);
    const main = document.querySelector('main');
    expect(main?.className).toContain('custom-class');
  });

  it('has proper layout structure', () => {
    render(<MockUserLayout children={<div>Content</div>} />);
    const main = document.querySelector('main');
    expect(main).toBeTruthy();
    expect(main?.tagName.toLowerCase()).toBe('main');
  });

  it('renders with full page layout', () => {
    render(<MockUserLayout children={<h1>Welcome</h1>} />);
    const header = document.querySelector('header');
    expect(header).toBeTruthy();
    expect(screen.getByText('Welcome')).toBeDefined();
  });

  it('contains header with logo', () => {
    render(<MockUserLayout children={<div>Test</div>} />);
    const logo = document.querySelector('header');
    expect(logo).toBeTruthy();
  });
});
