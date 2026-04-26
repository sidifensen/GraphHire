'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldCheck, Users, Tags, Activity, Network } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: '仪表盘', path: '/admin/dashboard' },
  { icon: ShieldCheck, label: '企业审核', path: '/admin/enterprise-review' },
  { icon: Users, label: '用户管理', path: '/admin/users' },
  { icon: Tags, label: '标签管理', path: '/admin/skill-tags' },
  { icon: Activity, label: '任务监控', path: '/admin/task-monitor' },
];

export function AdminSidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-full border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-white/10 flex flex-col py-6 z-50 overflow-hidden transition-colors duration-300"
    >
      <div className={cn(
        "px-6 mb-8 flex items-center justify-between transition-all duration-300",
        isCollapsed && "px-4 justify-center"
      )}>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex h-10 items-center gap-3 overflow-hidden whitespace-nowrap"
            >
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shrink-0">
                <Network size={20} />
              </div>
              <h1 className="text-xl font-bold text-blue-600 font-display">GraphHire</h1>
            </motion.div>
          )}
          {isCollapsed && (
             <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.8 }}
               className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0"
             >
               <Network size={24} />
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
              className="group relative block"
              title={isCollapsed ? item.label : ""}
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out font-medium text-sm",
                  isActive
                    ? "text-blue-600 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800",
                  isCollapsed && "px-0 justify-center h-12"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-blue-50/80 dark:bg-blue-600/10 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {isActive && (
                  <motion.div
                    layoutId="active-border"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <motion.div
                  layout="position"
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="shrink-0"
                >
                  <item.icon size={20} />
                </motion.div>

                <AnimatePresence initial={false} mode="popLayout">
                  {!isCollapsed && (
                    <motion.span
                      layout
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="relative z-10 whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {!isActive && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-50 dark:bg-slate-800 rounded-lg -z-20 transition-opacity duration-300" />
                )}
              </motion.div>
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
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">系统版本 V2.4.0</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">© 2024 GraphHire</p>
            </>
          ) : (
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">V 2.4</div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
