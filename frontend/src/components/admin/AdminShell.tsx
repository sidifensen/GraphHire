'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import RouteTransition from '@/components/layout/RouteTransition';

interface AdminShellProps {
  children: ReactNode;
}

const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_EXPANDED_WIDTH = 224;
const SHELL_TRANSITION = { duration: 0.22, ease: 'easeOut' as const };

export default function AdminShell({ children }: AdminShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(window.localStorage.getItem('admin.sidebar.collapsed') === 'true');
  }, []);

  useEffect(() => {
    window.localStorage.setItem('admin.sidebar.collapsed', String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminSidebar isCollapsed={isCollapsed} />
      <motion.div
        initial={false}
        animate={{ marginLeft: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
        transition={SHELL_TRANSITION}
        className="flex h-full min-w-0 flex-1 flex-col overflow-hidden"
      >
        <AdminTopbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className="no-scrollbar flex-1 overflow-y-auto">
          <RouteTransition className="h-full" testId="admin-route-transition">
            {children}
          </RouteTransition>
        </main>
      </motion.div>
    </div>
  );
}
