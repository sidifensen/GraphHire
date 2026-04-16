import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'PERSON' | 'COMPANY' | 'ADMIN';

interface AuthState {
  token: string | null;
  role: UserRole | null;
  userId: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, role: UserRole, userId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      userId: null,
      isAuthenticated: false,
      setAuth: (token, role, userId) =>
        set({ token, role, userId, isAuthenticated: true }),
      clearAuth: () =>
        set({ token: null, role: null, userId: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
