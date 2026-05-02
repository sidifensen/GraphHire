/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';

// Polyfill ResizeObserver for recharts in jsdom
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

// Polyfill IntersectionObserver for scroll animations
class IntersectionObserverMock {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(
    private callback: IntersectionObserverCallback,
    private options?: IntersectionObserverInit
  ) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false;
}

if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = () => {};
}

if (!HTMLElement.prototype.releasePointerCapture) {
  HTMLElement.prototype.releasePointerCapture = () => {};
}

// Mock next/navigation - must use vi.mock at module level
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => {
    return <img {...props} />;
  },
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  },
}));

// Mock zustand store
vi.mock('@/lib/stores/auth-store', () => ({
  authStore: {
    getState: () => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: vi.fn(),
      logout: vi.fn(),
    }),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
  userAuthStore: {
    getState: () => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: vi.fn(),
      logout: vi.fn(),
    }),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
  enterpriseAuthStore: {
    getState: () => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: vi.fn(),
      logout: vi.fn(),
    }),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
  adminAuthStore: {
    getState: () => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: vi.fn(),
      logout: vi.fn(),
    }),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
  getAuthStoreByDomain: () => ({
    getState: () => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: vi.fn(),
      logout: vi.fn(),
    }),
    setState: vi.fn(),
    subscribe: vi.fn(),
  }),
  getAuthDomainByPath: () => 'user',
  getStorageKeyByDomain: () => 'auth-storage-user',
}));
