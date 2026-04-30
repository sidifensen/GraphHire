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
      userType: 'PERSON',
    }),
    personRegister: vi.fn().mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      userId: 1,
      userType: 'PERSON',
    }),
    companyRegister: vi.fn().mockResolvedValue({
      accessToken: 'mock-enterprise-token',
      refreshToken: 'mock-enterprise-refresh-token',
      userId: 2,
      userType: 'COMPANY',
    }),
    sendVerifyCode: vi.fn().mockResolvedValue(undefined),
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
  type MockAuthUser = {
    id: number;
    username: string;
    email?: string;
    type: 'PERSON' | 'COMPANY' | 'ADMIN';
    avatarUrl?: string | null;
    displayName?: string;
  };
  type MockAuthState = {
    accessToken: string | null;
    refreshToken: string | null;
    user: MockAuthUser | null;
    isAuthenticated: boolean;
    setAuth: (tokens: { accessToken: string; refreshToken?: string }, user: MockAuthUser) => void;
    updateUser: (partial: Partial<MockAuthUser>) => void;
    logout: () => void;
  };

  const createMockStore = () => {
    let state: MockAuthState = {
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: vi.fn((tokens, user) => {
        state = {
          ...state,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken ?? null,
          user,
          isAuthenticated: true,
        };
      }),
      updateUser: vi.fn((partial) => {
        state = {
          ...state,
          user: state.user ? { ...state.user, ...partial } : state.user,
        };
      }),
      logout: vi.fn(() => {
        state = {
          ...state,
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        };
      }),
    };

    const listeners = new Set<(nextState: MockAuthState) => void>();
    const boundStore = ((selector?: (nextState: MockAuthState) => unknown) =>
      selector ? selector(state) : state) as unknown as {
      getState: () => MockAuthState;
      setState: (partial: Partial<MockAuthState>) => void;
      subscribe: (listener: (nextState: MockAuthState) => void) => () => void;
    } & ((selector?: (nextState: MockAuthState) => unknown) => unknown);

    boundStore.getState = () => state;
    boundStore.setState = (partial) => {
      state = { ...state, ...partial };
      listeners.forEach((listener) => listener(state));
    };
    boundStore.subscribe = (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    };

    return boundStore;
  };

  const globalKey = '__GRAPHHIRE_AUTH_STORE_MOCKS__' as const;
  type MockStores = {
    userStore: ReturnType<typeof createMockStore>;
    enterpriseStore: ReturnType<typeof createMockStore>;
    adminStore: ReturnType<typeof createMockStore>;
  };
  const globalObj = globalThis as unknown as Record<string, MockStores | undefined>;
  if (!globalObj[globalKey]) {
    globalObj[globalKey] = {
      userStore: createMockStore(),
      enterpriseStore: createMockStore(),
      adminStore: createMockStore(),
    };
  }
  const { userStore, enterpriseStore, adminStore } = globalObj[globalKey]!;

  return {
    ...actual,
    authStore: userStore,
    userAuthStore: userStore,
    enterpriseAuthStore: enterpriseStore,
    adminAuthStore: adminStore,
    getAuthStoreByDomain: (domain: 'user' | 'enterprise' | 'admin') => {
      if (domain === 'enterprise') return enterpriseStore;
      if (domain === 'admin') return adminStore;
      return userStore;
    },
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
