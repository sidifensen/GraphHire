'use client';

import { Bell, HelpCircle, Moon, Settings, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useState, useRef, useEffect } from 'react';
import { adminAuthStore } from '@/lib/stores/auth-store';
import { logoutWithServerInvalidation } from '@/lib/logout';

const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="%23e2e8f0"/><circle cx="40" cy="30" r="14" fill="%2394a3b8"/><rect x="18" y="50" width="44" height="18" rx="9" fill="%2394a3b8"/></svg>';

export default function AdminHeader() {
  const { theme, toggleTheme } = useTheme();
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

  const avatarSrc = user?.avatarUrl || DEFAULT_AVATAR;

  return (
    <header className="sticky top-0 w-full z-40 bg-white/80 dark:bg-black/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex justify-between items-center px-8 h-20 shrink-0 transition-colors duration-300">
      <div className="flex items-center flex-1"></div>

      <div className="flex items-center gap-5">
        <button
          onClick={toggleTheme}
          className="text-slate-500 hover:text-blue-600 transition-all p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button className="text-slate-500 hover:text-blue-600 transition-all p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
        </button>
        <button className="text-slate-500 hover:text-blue-600 transition-all p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <HelpCircle size={20} />
        </button>
        <button className="text-slate-500 hover:text-blue-600 transition-all p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <Settings size={20} />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none group-hover:text-blue-600 transition-colors">
              {user?.type === 'ADMIN' ? '管理员' : user?.username || '管理员'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tighter">Super Admin</p>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-blue-500 transition-all p-0.5 overflow-hidden"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img
                src={avatarSrc}
                alt="头像"
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.src !== DEFAULT_AVATAR) {
                    img.src = DEFAULT_AVATAR;
                  }
                }}
              />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.username || '管理员'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.type === 'ADMIN' ? '系统管理员' : '用户'}</p>
                </div>
                <button
                  className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
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
