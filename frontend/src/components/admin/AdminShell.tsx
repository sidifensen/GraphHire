'use client';

import type { ReactNode } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';

type AdminNavItem = 'dashboard' | 'enterprise-review' | 'users' | 'skill-tags' | 'task-monitor' | 'settings';

interface AdminShellProps {
  activeItem: AdminNavItem;
  children: ReactNode;
}

export default function AdminShell({ activeItem, children }: AdminShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar activeItem={activeItem} />
      <div className="ml-64 flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">{children}</main>
      </div>
    </div>
  );
}
