'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Icon } from './icons';
import { cn } from '@/lib/utils';
import { authStore } from '@/lib/stores/auth-store';
import { useShallow } from 'zustand/react/shallow';

const navLinks = [
  { href: '/home', label: '首页', icon: 'home' },
  { href: '/jobs', label: '职位', icon: 'work' },
  { href: '/companies', label: '公司', icon: 'business' },
  { href: '/skill-graph', label: '能力图谱', icon: 'psychology' },
];

export function TopNavBar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = authStore(useShallow((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    logout: state.logout,
  })));
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    logout();
    setShowDropdown(false);
    window.location.href = '/home';
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface-container-low border-b border-outline-variant/15">
      <div className="flex justify-between items-center w-full px-6 py-3 max-w-full mx-auto">
        {/* Logo */}
        <Link href="/home" className="text-2xl font-bold tracking-tight text-primary">
          GraphHire
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'pb-1 transition-colors hover:text-primary',
                pathname === link.href
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/notifications" className="text-on-surface-variant hover:text-primary transition-colors">
            <Icon name="notifications" />
          </Link>
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-on-primary font-semibold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm font-medium">{user.username}</span>
                <Icon name="expand_more" className="text-sm" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-[0px_10px_40px_rgba(19,27,46,0.15)] border border-outline-variant/15 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-outline-variant/15">
                    <p className="text-sm font-medium text-on-surface">{user.username}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {user.type === 'PERSON' ? '求职者' : user.type === 'COMPANY' ? '招聘者' : '管理员'}
                    </p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/resume/manage"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
                    >
                      <Icon name="description" className="text-lg" />
                      我的简历
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
                    >
                      <Icon name="person" className="text-lg" />
                      个人信息
                    </Link>
                    <Link
                      href="/notifications"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
                    >
                      <Icon name="notifications" className="text-lg" />
                      通知中心
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
                    >
                      <Icon name="settings" className="text-lg" />
                      设置
                    </Link>
                  </div>
                  <div className="border-t border-outline-variant/15 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-error hover:bg-error-container transition-colors"
                    >
                      <Icon name="logout" className="text-lg" />
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="text-on-surface-variant hover:text-primary transition-colors">
              <Icon name="person" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
