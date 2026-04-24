'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, HelpCircle, Search, Settings } from 'lucide-react';
import { adminAuthStore } from '@/lib/stores/auth-store';
import { logoutWithServerInvalidation } from '@/lib/logout';

interface AdminHeaderProps {
  title?: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = adminAuthStore((state) => state.user);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutWithServerInvalidation((path) => {
      window.location.href = path;
    }, '/admin/login', 'admin');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <div className="flex flex-1 items-center gap-4">
        {title ? <h2 className="text-lg font-bold text-slate-900">{title}</h2> : null}
        <div className="relative hidden w-80 max-w-full text-slate-500 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
          <Bell className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
          <Settings className="h-5 w-5" />
        </button>
        <div className="ml-2 flex items-center gap-3 border-l border-slate-200 pl-4">
          <span className="hidden text-sm font-medium text-slate-600 sm:block">{user?.type === 'ADMIN' ? '管理员' : user?.username || '管理员'}</span>
          <div className="relative" ref={dropdownRef}>
            <button
              data-testid="admin-header-avatar-btn"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="material-symbols-outlined text-[20px] icon-fill">person</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{user?.username || '管理员'}</p>
                  <p className="text-xs text-slate-500">{user?.type === 'ADMIN' ? '系统管理员' : '用户'}</p>
                </div>
                <button
                  className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  onClick={handleLogout}
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
