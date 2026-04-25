'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

const menuItems = [
  { href: '/profile', label: '个人资料', icon: 'account_circle' },
  { href: '/resume/manage', label: '简历管理', icon: 'description' },
  { href: '#', label: '投递记录', icon: 'assignment_turned_in' },
  { href: '/skill-graph', label: '我的图谱', icon: 'hub' },
  { href: '#', label: '账号设置', icon: 'settings' },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <aside className="hidden md:flex flex-col gap-2 w-64 h-screen p-4 bg-[#F8F9FF] dark:bg-slate-900 rounded-2xl my-4 ml-4 bg-slate-100/50 dark:bg-slate-800/50 border-none shadow-none sticky top-24 font-['Inter'] text-sm font-medium">
      <nav className="flex flex-col gap-1 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <motion.div
              key={item.href + item.label}
              whileHover={shouldReduceMotion ? undefined : { x: 4 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' }}
            >
              <Link
                href={item.href}
                className={`relative flex items-center gap-3 rounded-xl px-4 py-3 ${
                  isActive
                    ? 'text-[#003DA6] dark:text-blue-300 font-bold'
                    : 'text-[#394851] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                } transition-colors`}
              >
                {isActive && (
                  <motion.span
                    data-testid="sidebar-nav-indicator"
                    layoutId="sidebar-nav-indicator"
                    className="absolute inset-0 rounded-xl bg-blue-50 dark:bg-blue-900/30"
                    transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <span className={`material-symbols-outlined relative z-10 ${isActive ? 'icon-fill' : ''}`}>
                  {item.icon}
                </span>
                <span className="relative z-10">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <motion.button
        whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' }}
        className="mt-auto bg-gradient-to-br from-primary to-primary-container text-white rounded-xl py-3 px-4 font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">edit</span>
        更新简历
      </motion.button>
    </aside>
  );
}
