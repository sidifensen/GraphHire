'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldCheck, Users, Tags, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: '仪表盘', path: '/admin/dashboard' },
  { icon: ShieldCheck, label: '企业审核', path: '/admin/enterprise-review' },
  { icon: Users, label: '用户管理', path: '/admin/users' },
  { icon: Tags, label: '标签管理', path: '/admin/skill-tags' },
  { icon: Activity, label: '任务监控', path: '/admin/task-monitor' },
];

const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_EXPANDED_WIDTH = 224;
const SIDEBAR_TRANSITION = { duration: 0.22, ease: 'easeOut' as const };

export function AdminSidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
      transition={SIDEBAR_TRANSITION}
      className="fixed left-0 top-0 h-full border-r border-slate-200 bg-white dark:bg-black dark:border-white/10 flex flex-col py-6 z-50 overflow-hidden transition-colors duration-300"
    >
      <div className="px-6 mb-8 flex h-10 items-center overflow-hidden">
        <div className="w-8 h-8 shrink-0">
          <img
            src="/favicon.svg"
            alt="GraphHire logo"
            data-testid="admin-brand-logo"
            className="w-8 h-8 object-contain"
          />
        </div>
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              className="ml-3 leading-tight"
            >
              <h1 className="text-xl font-bold text-blue-600 font-display whitespace-nowrap">GraphHire</h1>
              <p className="text-[11px] text-slate-500 whitespace-nowrap">图谱智聘</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="relative block"
              title={isCollapsed ? item.label : ""}
            >
              <div
                className={cn(
                  "flex h-12 items-center gap-3 px-4 rounded-lg transition-colors duration-200 font-medium text-sm",
                  isActive
                    ? "text-blue-600 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/80",
                  isCollapsed && "px-0 justify-center"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-blue-50/80 dark:bg-blue-600/10 rounded-lg -z-10"
                    transition={SIDEBAR_TRANSITION}
                  />
                )}

                {isActive && (
                  <motion.div
                    layoutId="active-border"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-full"
                    transition={SIDEBAR_TRANSITION}
                  />
                )}

                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={SIDEBAR_TRANSITION}
                  className="shrink-0"
                >
                  <item.icon size={20} />
                </motion.div>

                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={SIDEBAR_TRANSITION}
                    className="relative z-10 whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <div className={cn(
          "p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center transition-all",
          isCollapsed && "p-2 bg-transparent border-none"
        )}>
          {!isCollapsed ? (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">系统版本 V2.5.0</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">© 2026 GraphHire</p>
            </>
          ) : (
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">V 2.5</div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
