import { create } from 'zustand';
import type { DashboardStats } from '@/lib/api/admin';

interface AdminState {
  stats: DashboardStats | null;
  setStats: (stats: DashboardStats) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: null,
  setStats: (stats) => set({ stats }),
}));
