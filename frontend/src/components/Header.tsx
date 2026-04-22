'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { userAuthStore } from '@/lib/stores/auth-store';
import { logoutWithServerInvalidation } from '@/lib/logout';

const navLinks = [
  { label: '首页', href: '/' },
  { label: '职位', href: '/jobs' },
  { label: '公司', href: '/companies' },
  { label: '能力图谱', href: '/skill-graph' },
];

interface HeaderProps {
  forceShowNotifications?: boolean;
}

export default function Header({ forceShowNotifications }: HeaderProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const isAuthenticated = userAuthStore((state) => state.isAuthenticated);
  const user = userAuthStore((state) => state.user);
  const showNotificationBadge = forceShowNotifications || isAuthenticated;
  const [showDropdown, setShowDropdown] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const avatarSrc = user?.avatarUrl ?? null;

  useEffect(() => {
    setAvatarError(false);
  }, [avatarSrc]);

  useEffect(() => {
    function handleClickOutside() {
      setShowDropdown(false);
    }
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  const handleLogout = async () => {
    await logoutWithServerInvalidation(router.push, '/', 'user');
  };

  return (
    <header className="bg-surface dark:bg-slate-950 backdrop-blur-xl top-0 z-50 sticky shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.05)] shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between px-8 py-2 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-lg font-black text-[#003DA6] font-headline antialiased tracking-tight">
            GraphHire 图谱智聘
          </Link>
          <nav className="hidden md:flex gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative font-headline antialiased tracking-tight text-sm font-medium transition-colors pb-1 ${
                    isActive
                      ? 'text-primary font-bold'
                      : 'text-tertiary hover:text-primary'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      data-testid="header-nav-indicator"
                      layoutId="header-nav-indicator"
                      className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-primary rounded"
                      transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 42 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <button onClick={() => router.push('/notifications')} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 p-2 rounded-full active:scale-95 opacity-80 transition-transform relative">
                <span className="material-symbols-outlined">notifications</span>
                {showNotificationBadge && <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>}
              </button>
              <button className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 p-2 rounded-full active:scale-95 opacity-80 transition-transform">
                <span className="material-symbols-outlined">chat_bubble</span>
              </button>
              <div className="relative flex items-center gap-4">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <span className="text-sm font-medium text-on-surface truncate max-w-[120px]">{user?.username}</span>
                <div className="w-7 h-7 rounded-full bg-surface-container-low overflow-hidden border border-surface-variant flex-shrink-0">
                  {avatarError || !avatarSrc ? (
                    <span className="material-symbols-outlined text-tertiary w-full h-full flex items-center justify-center">person</span>
                  ) : (
                    <img
                      alt="用户头像"
                      src={avatarSrc}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  )}
                </div>
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-variant overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-surface-variant">
                    <p className="text-sm font-medium text-on-surface truncate">{user?.username}</p>
                    <p className="text-xs text-tertiary mt-0.5">{user?.type === 'PERSON' ? '个人用户' : '企业用户'}</p>
                  </div>
                  <button
                    onClick={() => { router.push('/profile'); setShowDropdown(false); }}
                    className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">account_circle</span>
                    个人空间
                  </button>
                  <div className="border-t border-surface-variant"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    退出登录
                  </button>
                </div>
              )}
              </div>
            </>
          ) : showNotificationBadge ? (
            <>
              <button className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 p-2 rounded-full active:scale-95 opacity-80 transition-transform relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                登录
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
