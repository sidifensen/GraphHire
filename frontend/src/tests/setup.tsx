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
  },
}));

// Mock auth store
vi.mock('@/lib/stores/auth-store', () => ({
  authStore: {
    getState: () => ({
      setAuth: vi.fn(),
    }),
    setState: vi.fn(),
  },
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});
