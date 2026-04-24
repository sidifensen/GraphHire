'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { adminAuthStore } from '@/lib/stores/auth-store';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = adminAuthStore((state) => state.isAuthenticated);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    const verify = async () => {
      const currentAuth = adminAuthStore.getState().isAuthenticated;
      if (pathname === '/admin/login') {
        if (!currentAuth) {
          if (active) setChecking(false);
          return;
        }
        try {
          const context = await authApi.getContext();
          if (context.userType === 'ADMIN') {
            router.replace('/admin/dashboard');
            return;
          }
        } catch {
          // ignore
        }
        adminAuthStore.getState().logout();
        if (active) setChecking(false);
        return;
      }

      if (!currentAuth) {
        router.replace('/admin/login');
        if (active) setChecking(false);
        return;
      }

      try {
        const context = await authApi.getContext();
        if (context.userType !== 'ADMIN') {
          adminAuthStore.getState().logout();
          router.replace('/admin/login');
          return;
        }
      } catch {
        adminAuthStore.getState().logout();
        router.replace('/admin/login');
        return;
      }

      if (active) setChecking(false);
    };

    verify();

    const unsubscribe = adminAuthStore.subscribe((state) => {
      if (!state.isAuthenticated && pathname !== '/admin/login') {
        router.replace('/admin/login');
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router, pathname, isAuthenticated]);

  if (checking) {
    return null;
  }

  if (pathname === '/admin/login') {
    return isAuthenticated ? null : <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}