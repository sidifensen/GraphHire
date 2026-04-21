'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStore } from '@/lib/stores/auth-store';
import { logoutWithServerInvalidation } from '@/lib/logout';

interface AdminHeaderProps {
  title?: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉框
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
      // 使用 window.location.href 强制页面重新加载，确保状态完全重置
      window.location.href = path;
    }, '/admin/login');
  };

  return (
    <header className="flex items-center justify-between px-6 w-full h-14 sticky top-0 z-30 bg-[#F8F9FF] shadow-sm font-['Inter'] text-sm font-medium border-b border-transparent">
      {/* Left: Brand / Title Area */}
      <div className="flex items-center gap-4">
        {title ? <h2 className="text-lg font-extrabold text-[#003DA6] tracking-tight">{title}</h2> : null}
      </div>
      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        <button className="text-slate-600 hover:bg-slate-200/50 rounded-full p-2 transition-all focus:ring-2 focus:ring-blue-500/20 outline-none flex items-center justify-center">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="flex items-center gap-3 pl-6 border-l relative before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
          <span className="text-slate-600 font-medium tracking-wide">管理员</span>
          <div className="relative" ref={dropdownRef}>
            <button
              className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="material-symbols-outlined text-[20px] icon-fill">person</span>
            </button>
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{authStore.getState().user?.username || '管理员'}</p>
                  <p className="text-xs text-slate-500">系统管理员</p>
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