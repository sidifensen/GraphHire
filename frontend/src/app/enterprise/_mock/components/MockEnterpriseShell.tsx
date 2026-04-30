'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';

const variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: 'easeIn' as const,
    },
  },
};

function getTopNavProps(pathname: string) {
  if (pathname === '/enterprise/dashboard') return { title: 'GraphHire 图谱智聘', userAvatar: true };
  if (pathname === '/enterprise/jobs') return { title: '职位管理', userAvatar: true };
  if (pathname === '/enterprise/jobs/new') return { title: '发布职位', showBack: true };
  if (pathname.endsWith('/edit')) return { title: '编辑职位', showBack: true };
  if (pathname.startsWith('/enterprise/jobs/')) return { title: '职位详情', showBack: true };
  if (pathname.startsWith('/enterprise/candidates/')) return { title: '简历详情', showBack: true };
  if (pathname.startsWith('/enterprise/recommendations')) return { title: '智能推荐', userAvatar: true };
  if (pathname.startsWith('/enterprise/employees')) return { title: '团队管理', userAvatar: true };
  if (pathname.startsWith('/enterprise/notifications')) return { title: '消息中心', showBack: true };
  return { title: 'GraphHire', userAvatar: true };
}

export default function MockEnterpriseShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/enterprise/dashboard';

  return (
    <div className="mock-enterprise-theme flex min-h-screen justify-center bg-surface-dim">
      <div className="relative mx-auto flex min-h-screen w-full flex-col overflow-hidden bg-background font-body-md text-body-md text-on-surface shadow-2xl">
        <TopNav {...getTopNavProps(pathname)} />
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        <BottomNav />
      </div>
    </div>
  );
}
