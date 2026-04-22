/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock Next.js router
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
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock auth API
vi.mock('@/lib/api/auth', () => ({
  authApi: {
    login: vi.fn().mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      userId: 1,
      userType: 'person',
    }),
    getContext: vi.fn().mockResolvedValue({
      userId: 1,
      userType: 'PERSON',
    }),
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock auth store
vi.mock('@/lib/stores/auth-store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/stores/auth-store')>();
  const mockStore = {
    getState: () => ({
      setAuth: vi.fn(),
      logout: vi.fn(),
      accessToken: null,
      isAuthenticated: false,
      user: null,
    }),
    setState: vi.fn(),
    subscribe: vi.fn(() => () => {}),
  };
  return {
    ...actual,
    authStore: mockStore,
    userAuthStore: mockStore,
    enterpriseAuthStore: mockStore,
    adminAuthStore: mockStore,
    getAuthStoreByDomain: () => mockStore,
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
