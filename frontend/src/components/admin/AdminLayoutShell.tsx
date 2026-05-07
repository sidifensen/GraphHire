'use client';

import { usePathname } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

export default function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const pathname = usePathname();

  return (
    <AdminAuthGuard>
      {pathname === '/admin/login' ? <>{children}</> : <AdminShell>{children}</AdminShell>}
    </AdminAuthGuard>
  );
}
