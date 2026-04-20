'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authStore } from '@/lib/stores/auth-store';

const navLinks = [
  { label: '首页', href: '/' },
  { label: '职位', href: '/jobs' },
  { label: '公司', href: '/companies' },
  { label: '能力图谱', href: '/skill-graph' },
];

export default function Header() {
  const pathname = usePathname();
  const isAuthenticated = authStore((state) => state.isAuthenticated);

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
              <button className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 p-2 rounded-full active:scale-95 opacity-80 transition-transform">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 p-2 rounded-full active:scale-95 opacity-80 transition-transform">
                <span className="material-symbols-outlined">chat_bubble</span>
              </button>
              <div className="w-9 h-9 rounded-full bg-surface-container-high overflow-hidden border-2 border-surface cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300">
                <Image
                  alt="用户头像"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIYa43L-pryRXbX_0CaMonCmGzAj_Dzj86nXpYHvCsDUbFn2dQwjVHfcA1GdViiDM0V1owjYEN1XNAGcQPWvvnopWW8B15Hk11yTWzHXhHNI9tPRzFjQfL1nK_qdGznxU0IEuNGSB6Dzkvy0iHn6T0ndOQS_YR29P48e_7xTcWYuAAA-gtna5DEpOs45XiHZphPUgHGq4fK8dk9PQU7_6KA5OPFmQEoQINO2OEvoo4-nFYRg5AmXUb1HWPDhiwBpSJ9Smazb5Un1y6"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
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
