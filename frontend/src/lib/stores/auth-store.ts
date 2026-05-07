import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { UserType } from '@/lib/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: number; username: string; displayName?: string; email?: string; type: UserType; avatarUrl?: string | null } | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setHydrated: (value: boolean) => void;
  setAuth: (tokens: { accessToken: string; refreshToken?: string }, user: { id: number; username: string; displayName?: string; email?: string; type: UserType; avatarUrl?: string | null }) => void;
  updateUser: (partial: Partial<{ id: number; username: string; displayName?: string; email?: string; type: UserType; avatarUrl?: string | null }>) => void;
  logout: () => void;
}

export type AuthDomain = 'user' | 'enterprise' | 'admin';

const STORAGE_KEYS: Record<AuthDomain, string> = {
  user: 'auth-storage-user',
  enterprise: 'auth-storage-enterprise',
  admin: 'auth-storage-admin',
};

function createAuthStore(storageKey: string) {
  const isServer = typeof window === 'undefined';
  return create<AuthState>()(
    persist(
      (set) => ({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isHydrated: isServer,
        setHydrated: (value) => set({ isHydrated: value }),

        setAuth: (tokens, user) =>
          set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken || null,
            user,
            isAuthenticated: true,
            isHydrated: true,
          }),

        updateUser: (partial) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...partial } : state.user,
          })),

        logout: () =>
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isHydrated: true,
          }),
      }),
      {
        name: storageKey,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHydrated(true);
        },
      },
    ),
  );
}

export const userAuthStore = createAuthStore(STORAGE_KEYS.user);
export const enterpriseAuthStore = createAuthStore(STORAGE_KEYS.enterprise);
export const adminAuthStore = createAuthStore(STORAGE_KEYS.admin);

// 兼容旧代码：默认 authStore 代表用户端
export const authStore = userAuthStore;

export function getStorageKeyByDomain(domain: AuthDomain): string {
  return STORAGE_KEYS[domain];
}

export function getAuthDomainByPath(pathname: string | null | undefined): AuthDomain {
  if (pathname?.startsWith('/admin')) {
    return 'admin';
  }
  if (pathname?.startsWith('/enterprise')) {
    return 'enterprise';
  }
  return 'user';
}

export function getAuthStoreByDomain(domain: AuthDomain) {
  if (domain === 'admin') {
    return adminAuthStore;
  }
  if (domain === 'enterprise') {
    return enterpriseAuthStore;
  }
  return userAuthStore;
}
