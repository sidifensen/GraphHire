'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { BottomNav } from './BottomNav';
import { ThemeProvider } from '../context/ThemeContext';

export default function MockUserShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const showBottomNav = ['/', '/jobs', '/companies', '/profile'].includes(pathname);

  return (
    <ThemeProvider>
      <div className="mock-user-theme flex min-h-screen flex-col bg-surface-background text-on-surface">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        {showBottomNav ? <BottomNav /> : null}
      </div>
    </ThemeProvider>
  );
}
