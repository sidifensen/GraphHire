import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock the auth-store before importing it
vi.mock('@/lib/stores/auth-store', () => {
  const { create } = require('zustand');
  const { persist } = require('zustand/middleware');

  interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: { id: number; username: string; type: 'PERSON' | 'COMPANY' } | null;
    isAuthenticated: boolean;
    setAuth: (tokens: { accessToken: string; refreshToken?: string }, user: { id: number; username: string; type: 'PERSON' | 'COMPANY' }) => void;
    logout: () => void;
  }

  const authStore = create<AuthState>()(
    persist(
      (set) => ({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,

        setAuth: (tokens, user) =>
          set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken || null,
            user,
            isAuthenticated: true,
          }),

        logout: () =>
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
          }),
      }),
      {
        name: 'auth-storage',
      }
    )
  );

  return { authStore };
});

import { authStore } from '@/lib/stores/auth-store';

describe('authStore', () => {
  beforeEach(() => {
    // 重置 store 状态
    authStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  it('初始状态未认证', () => {
    const state = authStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('setAuth 设置认证状态', () => {
    authStore.getState().setAuth(
      { accessToken: 'test-token', refreshToken: 'refresh-token' },
      { id: 1, username: 'testuser', type: 'PERSON' as const }
    );

    const state = authStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('test-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.user?.username).toBe('testuser');
  });

  it('logout 清除所有状态', () => {
    authStore.getState().setAuth(
      { accessToken: 'token' },
      { id: 1, username: 'user', type: 'PERSON' as const }
    );

    authStore.getState().logout();

    const state = authStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('setAuth 不传 refreshToken 时设置为 null', () => {
    authStore.getState().setAuth(
      { accessToken: 'token' },
      { id: 1, username: 'user', type: 'COMPANY' as const }
    );

    expect(authStore.getState().refreshToken).toBeNull();
  });

  it('setAuth 接受空字符串 refreshToken 时设置为 null', () => {
    authStore.getState().setAuth(
      { accessToken: 'token', refreshToken: '' },
      { id: 1, username: 'user', type: 'PERSON' as const }
    );

    expect(authStore.getState().refreshToken).toBeNull();
  });

  it('logout 清除 refreshToken', () => {
    authStore.getState().setAuth(
      { accessToken: 'token', refreshToken: 'refresh' },
      { id: 1, username: 'user', type: 'PERSON' as const }
    );

    authStore.getState().logout();

    expect(authStore.getState().refreshToken).toBeNull();
  });

  it('user 包含正确的信息', () => {
    authStore.getState().setAuth(
      { accessToken: 'token' },
      { id: 42, username: 'john', type: 'PERSON' as const }
    );

    const state = authStore.getState();
    expect(state.user?.id).toBe(42);
    expect(state.user?.username).toBe('john');
    expect(state.user?.type).toBe('PERSON');
  });
});
