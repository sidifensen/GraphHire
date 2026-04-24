'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('admin.sidebar.collapsed') === 'true';
  });

  useEffect(() => {
    window.localStorage.setItem('admin.sidebar.collapsed', String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminSidebar isCollapsed={isCollapsed} />
      <motion.div
        initial={false}
        animate={{ marginLeft: isCollapsed ? 80 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex h-full min-w-0 flex-1 flex-col overflow-hidden"
      >
        <AdminTopbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
      </motion.div>
    </div>
  );
}
