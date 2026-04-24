'use client';

import { Bell, HelpCircle, Moon, Search, Settings } from 'lucide-react';
import { adminAuthStore } from '@/lib/stores/auth-store';

interface AdminTopbarProps {
  searchPlaceholder?: string;
}

export default function AdminTopbar({ searchPlaceholder = '搜索...' }: AdminTopbarProps) {
  const user = adminAuthStore.getState().user;

  return (
    <header className="sticky top-0 z-20 mb-6 flex h-20 items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-6 shadow-sm backdrop-blur">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
        />
      </div>

      <div className="ml-6 flex shrink-0 items-center gap-3">
        <button className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
          <Moon className="h-4 w-4" />
        </button>
        <button className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
        </button>
        <button className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
          <Settings className="h-4 w-4" />
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">{user?.username ?? '管理员'}</p>
            <p className="text-[11px] text-slate-400 uppercase">Super Admin</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {(user?.username?.[0] ?? 'A').toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
