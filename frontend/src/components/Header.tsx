'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { authStore } from '@/lib/stores/auth-store';

const navLinks = [
  { label: '首页', href: '/' },
  { label: '职位', href: '/jobs' },
  { label: '公司', href: '/companies' },
  { label: '能力图谱', href: '/skill-graph' },
];

interface HeaderProps {
  forceShowNotifications?: boolean;
}

const defaultAvatar = '/default-avatar.svg';

export default function Header({ forceShowNotifications }: HeaderProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const showNotificationBadge = forceShowNotifications || isAuthenticated;
  const [showDropdown, setShowDropdown] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authStore.getState().logout();
    router.push('/');
  };

  return (
    <header className="bg-surface dark:bg-slate-950 backdrop-blur-xl top-0 z-50 sticky shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.05)] shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between px-8 py-4 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-black tracking-tighter text-primary dark:text-blue-500 font-headline antialiased tracking-tight">
            图谱智聘
          </Link>
          <nav className="hidden md:flex gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-headline antialiased tracking-tight text-sm font-medium transition-colors pb-1 border-b-2 ${
                    isActive
                      ? 'text-primary border-primary font-bold'
                      : 'text-tertiary border-transparent hover:text-primary hover:border-primary/30'
                  }`}
                >
                  {link.label}
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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-9 h-9 rounded-full bg-surface-container-high overflow-hidden border-2 border-surface cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center"
                >
                  {avatarError ? (
                    <span className="material-symbols-outlined text-tertiary">person</span>
                  ) : (
                    <Image
                      alt="用户头像"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIYa43L-pryRXbX_0CaMonCmGzAj_Dzj86nXpYHvCsDUbFn2dQwjVHfcA1GdViiDM0V1owjYEN1XNAGcQPWvvnopWW8B15Hk11yTWzHXhHNI9tPRzFjQfL1nK_qdGznxU0IEuNGSB6Dzkvy0iHn6T0ndOQS_YR29P48e_7xTcWYuAAA-gtna5DEpOs45XiHZphPUgHGq4fK8dk9PQU7_6KA5OPFmQEoQINO2OEvoo4-nFYRg5AmXUb1HWPDhiwBpSJ9Smazb5Un1y6"
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  )}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-variant overflow-hidden z-50">
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
