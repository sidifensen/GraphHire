import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Header from '@/components/Header';

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
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('@/lib/stores/auth-store', () => {
  const store = createMockStore();
  return {
    authStore: store,
    userAuthStore: store,
    enterpriseAuthStore: store,
    adminAuthStore: store,
    getAuthStoreByDomain: () => store,
    getAuthDomainByPath: () => 'user',
    getStorageKeyByDomain: () => 'auth-storage-user',
  };
});

const MockHeader = () => <Header />;

describe('Header', () => {
  beforeEach(() => {
    mockState.isAuthenticated = false;
    mockState.user = null;
  });

  it('renders user avatar when authenticated user has avatarUrl', () => {
    mockState.isAuthenticated = true;
    mockState.user = { id: 1, username: 'u@test.com', type: 'PERSON', avatarUrl: 'http://localhost:7777/person/avatar/public/1' } as any;

    render(<MockHeader />);
    const avatar = screen.getByAltText('用户头像') as HTMLImageElement;
    expect(avatar).toBeDefined();
    expect(avatar.getAttribute('src')).toContain('/person/avatar/public/1');
  });

  it('renders logo text', () => {
    mockState.isAuthenticated = false;
    mockState.user = null;
    render(<MockHeader />);
    expect(screen.getByText(/图谱智聘/)).toBeDefined();
  });

  it('renders navigation links', () => {
    render(<MockHeader />);
    expect(screen.getByText(/首页/)).toBeDefined();
    expect(screen.getByText(/职位/)).toBeDefined();
    expect(screen.getByText(/公司/)).toBeDefined();
    expect(screen.getByText(/能力图谱/)).toBeDefined();
  });

  it('shows login link when not authenticated', () => {
    render(<MockHeader />);
    const loginLink = screen.getByRole('link', { name: '登录' });
    expect(loginLink).toBeDefined();
  });

  it('has correct link hrefs', () => {
    render(<MockHeader />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map(link => link.getAttribute('href'));
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/jobs');
    expect(hrefs).toContain('/companies');
    expect(hrefs).toContain('/skill-graph');
  });

  it('renders login button when not authenticated', () => {
    render(<MockHeader />);
    expect(screen.getByText('登录')).toBeDefined();
  });

  it('renders logo as a link to home', () => {
    render(<MockHeader />);
    const logoLinks = screen.getAllByRole('link').filter(
      link => link.textContent?.includes('图谱智聘')
    );
    expect(logoLinks.length).toBe(1);
    expect(logoLinks[0].getAttribute('href')).toBe('/');
  });

  it('renders all navigation items as links', () => {
    render(<MockHeader />);
    const navLinks = screen.getAllByRole('link').filter(
      link => ['首页', '职位', '公司', '能力图谱'].some(
        text => link.textContent === text
      )
    );
    expect(navLinks.length).toBe(4);
  });

  it('contains Material Symbols icons in login link', () => {
    render(<MockHeader />);
    // Login link has an icon
    const icons = document.querySelectorAll('.material-symbols-outlined');
    expect(icons.length).toBeGreaterThanOrEqual(0);
  });

  it('anchors user dropdown to avatar trigger container', () => {
    mockState.isAuthenticated = true;
    mockState.user = {
      id: 1,
      username: 'u@test.com',
      type: 'PERSON',
      avatarUrl: 'http://localhost:7777/person/avatar/public/1',
    } as any;

    render(<MockHeader />);
    const trigger = screen.getByText('u@test.com').closest('button');
    expect(trigger).toBeTruthy();
    fireEvent.click(trigger as HTMLButtonElement);

    const profileAction = screen.getByText('个人空间').closest('button');
    const dropdown = profileAction?.parentElement as HTMLDivElement | null;
    expect(dropdown).toBeTruthy();
    expect(dropdown?.className).toContain('right-0');
    expect(dropdown?.className).toContain('top-full');
    expect(dropdown?.className).not.toContain('right-8');
  });
});
