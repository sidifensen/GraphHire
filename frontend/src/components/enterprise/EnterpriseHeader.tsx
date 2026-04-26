'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { enterpriseAuthStore } from '@/lib/stores/auth-store';
import { logoutWithServerInvalidation } from '@/lib/logout';

export default function EnterpriseHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [showDropdown, setShowDropdown] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = enterpriseAuthStore.getState().user;
  const accountEmail = user?.email || user?.username || '企业账号';
  const avatarSrc = user?.avatarUrl ?? null;

  const getActiveNav = () => {
    if (pathname.includes('/dashboard')) return 'dashboard';
    if (pathname.includes('/jobs')) return 'jobs';
    if (pathname.includes('/recommendations')) return 'recommendations';
    if (pathname.includes('/employees')) return 'employees';
    return 'dashboard';
  };

  const activeNav = getActiveNav();

  const getNavClass = (nav: string) => {
    if (nav === activeNav) {
      return 'text-primary bg-primary-fixed/20 rounded-md';
    }
    return 'text-[#394851] hover:text-primary hover:bg-surface-container-low rounded-md transition-colors';
  };

  const handleLogout = async () => {
    await logoutWithServerInvalidation(router.push, '/login', 'enterprise');
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

  useEffect(() => {
    setAvatarError(false);
  }, [avatarSrc]);

  return (
    <header className="flex justify-between items-center w-full px-6 py-3 h-16 z-10 border-b border-surface-container-highest/30 bg-[#F8F9FF]">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-black text-[#003DA6]">GraphHire 图谱智聘</h1>
          <span className="text-xs text-tertiary px-2 py-0.5 bg-surface-container rounded-full">企业管理中心</span>
        </div>
        <nav className="flex items-center gap-1">
          {[
            { key: 'dashboard', label: '工作台', href: '/enterprise/dashboard' },
            { key: 'jobs', label: '职位管理', href: '/enterprise/jobs' },
            { key: 'recommendations', label: '候选人推荐', href: '/enterprise/recommendations' },
            { key: 'employees', label: '员工管理', href: '/enterprise/employees' },
          ].map((item) => {
            const isActive = activeNav === item.key;
            return (
              <Link
                key={item.key}
                className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium ${getNavClass(item.key)}`}
                href={item.href}
              >
                {isActive && (
                  <motion.span
                    data-testid="enterprise-nav-indicator"
                    layoutId="enterprise-nav-indicator"
                    className="absolute inset-0 bg-primary-fixed/20 rounded-md"
                    transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 480, damping: 38 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <span className="mr-2 text-sm text-[#394851]">{accountEmail}</span>
          <button
            aria-label="账户菜单"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-center w-10 h-10 text-[#003DA6] hover:bg-blue-50 transition-colors rounded-full overflow-hidden"
          >
            {!avatarSrc || avatarError ? (
              <span className="material-symbols-outlined">account_circle</span>
            ) : (
              <img
                src={avatarSrc}
                alt="企业用户头像"
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            )}
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container-high overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-surface-container-high">
                <p className="text-sm font-medium text-on-surface">{user?.username}</p>
                <p className="text-xs text-tertiary">企业管理中心</p>
              </div>
              <div className="py-2">
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
