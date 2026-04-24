'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldCheck, Users, Tags, Activity, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: '仪表盘', path: '/admin/dashboard' },
  { icon: ShieldCheck, label: '企业审核', path: '/admin/enterprise-review' },
  { icon: Users, label: '用户管理', path: '/admin/users' },
  { icon: Tags, label: '标签管理', path: '/admin/skill-tags' },
  { icon: Activity, label: '任务监控', path: '/admin/task-monitor' },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
}

export default function AdminSidebar({ isCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 z-50 flex h-full flex-col overflow-hidden border-r border-outline-variant bg-white py-6 transition-colors duration-300 dark:border-white/10 dark:bg-[#03060d]"
    >
      <div className={cn('mb-8 h-12 px-4 transition-all duration-300', !isCollapsed && 'px-6')}>
        <div className="flex h-full items-center justify-center transition-all duration-300">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="expanded"
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary text-white">
                  <Network size={20} />
                </div>
                <div className="flex flex-col">
                  <h1 className="font-display text-xl font-bold text-primary">GraphHire</h1>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">图谱智聘</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={false}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white"
              >
                <Network size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className="group relative block" title={isCollapsed ? item.label : ''}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out',
                  isActive ? 'font-bold text-primary' : 'select-none text-slate-600 hover:text-on-surface',
                  isCollapsed && 'h-12 justify-center px-0'
                )}
              >
                {isActive ? (
                  <motion.div
                    layoutId="admin-active-nav"
                    className="absolute inset-0 -z-10 rounded-lg bg-blue-50/80 dark:bg-[#0b1630]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                ) : null}

                {isActive ? (
                  <motion.div
                    layoutId="admin-active-border"
                    className="absolute bottom-2 left-0 top-2 w-1 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                ) : null}

                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    color: isActive ? 'var(--color-primary)' : 'currentColor',
                  }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <item.icon size={20} />
                </motion.div>

                <AnimatePresence>
                  {!isCollapsed ? (
                    <motion.span
                      initial={false}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="relative z-10 overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  ) : null}
                </AnimatePresence>

                {!isActive ? <div className="absolute inset-0 -z-20 rounded-lg bg-slate-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-slate-800" /> : null}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4">
        <div className={cn('rounded-xl border border-outline-variant/30 bg-surface p-4 text-center transition-all', isCollapsed && 'border-none bg-transparent p-2')}>
          {!isCollapsed ? (
            <>
              <p className="mb-2 text-xs text-outline">系统版本 V2.5.0</p>
              <p className="text-[10px] text-outline/60">© 2026 GraphHire</p>
            </>
          ) : (
            <div className="text-[10px] font-bold text-outline/60">V 2.5</div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
