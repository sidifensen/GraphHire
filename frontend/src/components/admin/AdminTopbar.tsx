'use client';

import { Bell, HelpCircle, Settings, Moon, Sun, Menu, ChevronLeft } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useState, useRef, useEffect } from 'react';
import { adminAuthStore } from '@/lib/stores/auth-store';
import { logoutWithServerInvalidation } from '@/lib/logout';

const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="%23e2e8f0"/><circle cx="40" cy="30" r="14" fill="%2394a3b8"/><rect x="18" y="50" width="44" height="18" rx="9" fill="%2394a3b8"/></svg>';

interface AdminTopbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function AdminTopbar({ isCollapsed, setIsCollapsed }: AdminTopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = adminAuthStore((state) => state.user);
  const avatarSrc = user?.avatarUrl || DEFAULT_AVATAR;

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
    <header className="sticky top-0 z-40 flex h-20 w-full shrink-0 items-center justify-between border-b border-outline-variant bg-white/80 px-8 backdrop-blur-md transition-colors duration-300 dark:bg-black/60">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mr-4 rounded-lg p-2 text-outline transition-colors hover:bg-surface dark:hover:bg-slate-800"
      >
        {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className="flex flex-1 items-center" />

      <div className="flex items-center gap-5">
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-outline transition-all hover:bg-surface hover:text-primary dark:hover:bg-slate-800"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button className="relative rounded-full p-2 text-outline transition-all hover:bg-surface hover:text-primary dark:hover:bg-slate-800">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-800" />
        </button>
        <button className="rounded-full p-2 text-outline transition-all hover:bg-surface hover:text-primary dark:hover:bg-slate-800">
          <HelpCircle size={20} />
        </button>
        <button className="rounded-full p-2 text-outline transition-all hover:bg-surface hover:text-primary dark:hover:bg-slate-800">
          <Settings size={20} />
        </button>

        <div className="mx-2 h-6 w-px bg-outline-variant" />

        <div className="group flex cursor-pointer items-center gap-3 pl-2">
          <div className="hidden text-right sm:block">
            <p className="leading-none text-on-surface transition-colors group-hover:text-primary">{user?.type === 'ADMIN' ? '管理员' : user?.username || '管理员'}</p>
            <p className="mt-1 text-[10px] uppercase tracking-tighter text-outline">Super Admin</p>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              className="h-10 w-10 rounded-full border border-outline-variant p-0.5 transition-all group-hover:border-primary"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img
                src={avatarSrc}
                alt="Avatar"
                className="h-full w-full rounded-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.src !== DEFAULT_AVATAR) {
                    img.src = DEFAULT_AVATAR;
                  }
                }}
              />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-outline-variant bg-white shadow-lg dark:bg-slate-800 py-2 z-50">
                <div className="border-b border-outline-variant px-4 py-2">
                  <p className="text-sm font-medium text-on-surface dark:text-white">{user?.username || '管理员'}</p>
                  <p className="text-xs text-outline">{user?.type === 'ADMIN' ? '系统管理员' : '用户'}</p>
                </div>
                <button
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface transition-colors"
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
