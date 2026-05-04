'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { userAuthStore } from '@/lib/stores/auth-store';

const PROTECTED_PREFIXES = ['/profile', '/personal-info', '/resume', '/skill-graph', '/notifications', '/chat'];

function requiresAuth(pathname: string | null | undefined): boolean {
  if (!pathname) {
    return false;
  }
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default function UserAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = userAuthStore((state) => state.isAuthenticated);
  const protectedRoute = useMemo(() => requiresAuth(pathname), [pathname]);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    if (!protectedRoute) {
      if (active) {
        setChecking(false);
      }
      return () => {
        active = false;
      };
    }

    const verify = async () => {
      const currentAuth = userAuthStore.getState().isAuthenticated;
      if (!currentAuth) {
        router.replace('/login');
        if (active) {
          setChecking(false);
        }
        return;
      }

      try {
        const context = await authApi.getContext();
        if (context.userType !== 'PERSON') {
          userAuthStore.getState().logout();
          router.replace('/login');
          return;
        }
      } catch {
        userAuthStore.getState().logout();
        router.replace('/login');
        return;
      }

      if (active) {
        setChecking(false);
      }
    };

    void verify();

    const unsubscribe = userAuthStore.subscribe((state) => {
      if (!state.isAuthenticated && requiresAuth(pathname)) {
        router.replace('/login');
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router, pathname, isAuthenticated, protectedRoute]);

  if (!protectedRoute) {
    return <>{children}</>;
  }

  if (checking || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
