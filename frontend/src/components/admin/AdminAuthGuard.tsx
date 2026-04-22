'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authStore } from '@/lib/stores/auth-store';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = authStore((state) => state.isAuthenticated);

  useEffect(() => {
    const currentAuth = authStore.getState().isAuthenticated;

    // 如果是登录页
    if (pathname === '/admin/login') {
      // 已登录用户访问登录页，重定向到 dashboard
      if (currentAuth) {
        router.replace('/admin/dashboard');
      }
      return;
    }

    // 其他管理页面：未登录则重定向到登录页
    if (!currentAuth) {
      router.replace('/admin/login');
      return;
    }

    // 订阅 authStore 变化
    const unsubscribe = authStore.subscribe((state) => {
      if (!state.isAuthenticated && pathname !== '/admin/login') {
        router.replace('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [router, pathname, isAuthenticated]);

  // 登录页：已登录用户不渲染（重定向中），未登录用户正常渲染
  if (pathname === '/admin/login') {
    return isAuthenticated ? null : <>{children}</>;
  }

  // 其他页面：未登录不渲染（重定向中），已登录正常渲染
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}