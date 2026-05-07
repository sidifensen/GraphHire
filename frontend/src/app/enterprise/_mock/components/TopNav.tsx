'use client';

import React, { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { enterpriseAuthStore } from '@/lib/stores/auth-store';
import { companyApi } from '@/lib/api/company';
import { logoutWithServerInvalidation } from '@/lib/logout';
import { NAV_ITEMS } from '../constants';
import { cn } from '../lib/utils';

interface TopNavProps {
  title: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  userAvatar?: boolean;
  onBack?: () => void;
}

export function TopNav({ title, showBack, rightAction, userAvatar, onBack }: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '/enterprise/dashboard';
  const activePathname = (pathname === '/' || pathname === '/enterprise' || pathname === '/enterprise/') ? '/enterprise/dashboard' : pathname;
  const [authState, setAuthState] = React.useState(() => enterpriseAuthStore.getState());
  const [showAccountMenu, setShowAccountMenu] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState<'mobile' | 'desktop'>('desktop');
  const [isDark, setIsDark] = React.useState<boolean | null>(null);
  const [avatarError, setAvatarError] = React.useState(false);
  const desktopMenuRef = React.useRef<HTMLDivElement>(null);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const menuPanelRef = React.useRef<HTMLDivElement>(null);

  const user = authState.user;
  const avatarSrc = user?.avatarUrl ?? null;
  const displayName = user?.displayName || user?.username || '企业账号';

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      return;
    }
    if (savedTheme === 'light') {
      setIsDark(false);
      return;
    }
    setIsDark(
      document.documentElement.classList.contains('dark')
      || window.matchMedia('(prefers-color-scheme: dark)').matches,
    );
  }, []);

  React.useEffect(() => {
    if (isDark == null) {
      return;
    }
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  React.useEffect(() => {
    setAvatarError(false);
  }, [avatarSrc]);

  React.useEffect(() => enterpriseAuthStore.subscribe((next) => setAuthState(next)), []);

  React.useEffect(() => {
    let active = true;
    if (!authState.isAuthenticated || !user?.id) return () => { active = false; };
    companyApi.getInfo().then((company) => {
      if (!active) return;
      const patch: { displayName?: string; avatarUrl?: string | null } = {};
      if (company.name?.trim()) patch.displayName = company.name.trim();
      if (company.avatarUrl) patch.avatarUrl = company.avatarUrl;
      if (Object.keys(patch).length > 0) enterpriseAuthStore.getState().updateUser(patch);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [authState.isAuthenticated, user?.id]);

  React.useEffect(() => {
    if (!showAccountMenu) return;
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inDesktop = !!desktopMenuRef.current?.contains(target);
      const inMobile = !!mobileMenuRef.current?.contains(target);
      const inPanel = !!menuPanelRef.current?.contains(target);
      if (!inDesktop && !inMobile && !inPanel) setShowAccountMenu(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showAccountMenu]);

  const handleBack = () => {
    if (onBack) return onBack();
    router.back();
  };

  const handleLogout = async () => {
    setShowAccountMenu(false);
    await logoutWithServerInvalidation((path) => router.push(path), '/login', 'enterprise');
  };

  return (
    <header className="relative bg-surface border-b border-surface-variant shadow-sm flex items-center justify-between h-16 w-full z-40 sticky top-0 md:px-8 px-4 flex-shrink-0 transition-colors">
      <div className="flex items-center gap-3 w-10 md:hidden">
        {showBack ? (
          <button onClick={handleBack} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-surface-container">
            <span className="material-symbols-outlined text-[24px] text-on-surface">arrow_back_ios_new</span>
          </button>
        ) : (
          userAvatar && (
            <div className="relative" ref={mobileMenuRef}>
              <button
                type="button"
                aria-label="企业账户菜单"
                onClick={() => {
                  setMenuAnchor('mobile');
                  setShowAccountMenu((prev) => !prev);
                }}
                className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant shrink-0 flex items-center justify-center"
              >
                {!avatarSrc || avatarError ? (
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                ) : (
                  <img src={avatarSrc} alt="企业用户头像" className="w-full h-full object-cover" onError={() => setAvatarError(true)} />
                )}
              </button>
            </div>
          )
        )}
      </div>

      <div className="flex-1 flex items-center justify-center md:justify-start gap-8">
        <h1 className="md:hidden text-lg font-bold text-on-surface tracking-tight font-headline-sm text-headline-sm truncate">
          {title === 'GraphHire' ? 'GraphHire 图谱智聘' : title}
        </h1>

        <Link href="/" className="hidden md:flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-on-primary text-[20px]">hub</span>
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">GraphHire 图谱智聘</span>
        </Link>

        <nav
          data-testid="enterprise-desktop-nav-track"
          className="hidden md:flex items-center gap-1 rounded-xl border border-outline-variant/50 bg-surface-container/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] dark:border-slate-700/80 dark:bg-surface-container-high/60 dark:shadow-none"
        >
          {NAV_ITEMS.map((item) => {
            const fullPath = `/enterprise${item.path}`;
            const isActive = activePathname === fullPath || (fullPath !== '/enterprise/' && activePathname.startsWith(fullPath));
            return (
              <Link
                key={item.path}
                href={fullPath}
                className={cn(
                  'relative px-4 py-2 rounded-lg font-label-md text-[15px] transition-all duration-200 ease-out flex items-center gap-2',
                  isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-variant/55 hover:text-on-surface'
                )}
              >
                {isActive ? <motion.div data-testid="enterprise-desktop-nav-indicator" layoutId="desktop-nav-indicator" className="absolute inset-0 rounded-lg bg-primary/12 shadow-[0_6px_14px_rgba(59,130,246,0.18)] -z-10" transition={{ type: 'spring', stiffness: 260, damping: 26, mass: 0.9 }} /> : null}
                <span className={cn('material-symbols-outlined text-[18px] transition-transform duration-200', isActive ? 'scale-105' : '')} style={item.iconFill && isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center justify-end min-w-[40px] gap-3 md:gap-4 md:w-auto">
        <button onClick={() => setIsDark((prev) => !(prev ?? false))} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container" title="切换夜间模式">
          <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>

        {rightAction ? rightAction : (
          <Link href="/enterprise/notifications" className="text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors p-2 rounded-full relative flex items-center justify-center w-10 h-10">
            <span className="material-symbols-outlined">notifications</span>
          </Link>
        )}

        <div className="hidden md:flex items-center gap-2" ref={desktopMenuRef}>
          {authState.isAuthenticated ? <span className="max-w-[180px] truncate text-sm text-on-surface">{displayName}</span> : null}
          <button type="button" aria-label="企业账户菜单" onClick={() => { setMenuAnchor('desktop'); setShowAccountMenu((prev) => !prev); }} className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container overflow-hidden shrink-0 items-center justify-center border border-primary/20 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all flex">
            {!avatarSrc || avatarError ? (
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            ) : (
              <img src={avatarSrc} alt="企业用户头像" className="w-full h-full object-cover" onError={() => setAvatarError(true)} />
            )}
          </button>
        </div>
      </div>

      {showAccountMenu ? (
        <div ref={menuPanelRef} className={cn('absolute top-full mt-2 w-56 rounded-xl border border-outline-variant/40 dark:border-slate-600 shadow-lg overflow-hidden z-50', menuAnchor === 'mobile' ? 'left-4 bg-white dark:bg-[#1a1d20]' : 'right-4 bg-surface-lowest')}>
          <div className="px-4 py-3 border-b border-outline-variant/40 dark:border-slate-600">
            <p className="text-sm font-medium text-on-surface truncate">{displayName}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">企业管理中心</p>
          </div>
          <Link href="/enterprise/company/profile" className="block w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-surface-container transition-colors">
            公司资料
          </Link>
          <div className="border-t border-outline-variant/40 dark:border-slate-600">
            <button type="button" aria-label="退出登录" onClick={() => void handleLogout()} className="w-full px-4 py-3 text-left text-sm text-error hover:bg-error-container transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              退出登录
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}




