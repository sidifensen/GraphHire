'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { enterpriseAuthStore } from '@/lib/stores/auth-store';

export default function EnterpriseAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = enterpriseAuthStore((state) => state.isAuthenticated);
  const isHydrated = enterpriseAuthStore((state) => state.isHydrated);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const verify = async () => {
      if (!enterpriseAuthStore.getState().isHydrated) {
        return;
      }
      const currentAuth = enterpriseAuthStore.getState().isAuthenticated;
      if (!currentAuth) {
        router.replace('/login');
        if (active) setChecking(false);
        return;
      }

      try {
        const context = await authApi.getContext();
        if (context.userType !== 'COMPANY') {
          enterpriseAuthStore.getState().logout();
          router.replace('/login');
          return;
        }
      } catch {
        enterpriseAuthStore.getState().logout();
        router.replace('/login');
        return;
      }

      if (active) setChecking(false);
    };

    verify();

    const unsubscribe = enterpriseAuthStore.subscribe((state) => {
      if (!state.isAuthenticated && pathname?.startsWith('/enterprise')) {
        router.replace('/login');
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router, pathname, isAuthenticated, isHydrated]);

  if (!isHydrated || checking || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
