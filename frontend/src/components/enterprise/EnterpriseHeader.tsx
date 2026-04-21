'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authStore } from '@/lib/stores/auth-store';

export default function EnterpriseHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getActiveNav = () => {
    if (pathname.includes('/dashboard')) return 'dashboard';
    if (pathname.includes('/jobs')) return 'jobs';
    if (pathname.includes('/recommendations')) return 'recommendations';
    if (pathname.includes('/employees')) return 'employees';
    if (pathname.includes('/notifications')) return 'notifications';
    return 'dashboard';
  };

  const activeNav = getActiveNav();

  const getNavClass = (nav: string) => {
    if (nav === activeNav) {
      return 'text-primary bg-primary-fixed/20 rounded-md';
    }
    return 'text-[#394851] hover:text-primary hover:bg-surface-container-low rounded-md transition-colors';
  };

  const handleLogout = () => {
    authStore.getState().logout();
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center w-full px-6 py-3 h-16 z-10 border-b border-surface-container-highest/30 bg-[#F8F9FF]">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-black text-[#003DA6]">GraphHire 图谱智聘</h1>
          <span className="text-xs text-tertiary px-2 py-0.5 bg-surface-container rounded-full">企业管理中心</span>
        </div>
        <nav className="flex items-center gap-1">
          <a
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium ${getNavClass('dashboard')}`}
            href="/enterprise/dashboard"
          >
            <span>工作台</span>
          </a>
          <a
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium ${getNavClass('jobs')}`}
            href="/enterprise/jobs"
          >
            <span>职位管理</span>
          </a>
          <a
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium ${getNavClass('recommendations')}`}
            href="/enterprise/recommendations"
          >
            <span>候选人推荐</span>
          </a>
          <a
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium ${getNavClass('employees')}`}
            href="/enterprise/employees"
          >
            <span>员工管理</span>
          </a>
          <a
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium ${getNavClass('notifications')}`}
            href="/enterprise/notifications"
          >
            <span>通知中心</span>
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <a href="/enterprise/notifications" className="text-[#003DA6] hover:bg-blue-50 transition-colors p-2 rounded-full flex items-center justify-center relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </a>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 text-[#003DA6] hover:bg-blue-50 transition-colors p-2 rounded-full"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container-high overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-surface-container-high">
                <p className="text-sm font-medium text-on-surface">{authStore.getState().user?.username}</p>
                <p className="text-xs text-tertiary">企业管理中心</p>
              </div>
              <div className="py-2">
                <button className="w-full px-4 py-2 text-left text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">settings</span>
                  设置
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error-container transition-colors flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
