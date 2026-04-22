'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

interface AdminSidebarProps {
  activeItem?: 'dashboard' | 'enterprise-review' | 'users' | 'skill-tags' | 'task-monitor' | 'settings';
}

const navItems = [
  { id: 'dashboard', label: '工作台', icon: 'dashboard' },
  { id: 'enterprise-review', label: '企业审核', icon: 'fact_check' },
  { id: 'users', label: '用户管理', icon: 'group' },
  { id: 'skill-tags', label: '标签治理', icon: 'label' },
  { id: 'task-monitor', label: '任务监控', icon: 'monitoring' },
  { id: 'settings', label: '系统设置', icon: 'settings' },
] as const;

export default function AdminSidebar({ activeItem = 'dashboard' }: AdminSidebarProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex flex-col h-screen w-64 shadow-2xl font-['Manrope'] text-sm antialiased bg-white border-r border-slate-200">
      {/* Header */}
      <div className="h-14 flex items-center px-5 gap-3 bg-white border-b border-slate-100">
        <div className="w-7 h-7 rounded bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-base icon-fill">hub</span>
        </div>
        <div className="leading-tight">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">GraphHire</h1>
          <p className="text-[11px] mt-0.5">图谱智聘管理端</p>
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <motion.div
              key={item.id}
              whileHover={shouldReduceMotion ? undefined : { x: 3 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.16, ease: 'easeOut' }}
            >
              <Link
                className={
                  isActive
                    ? 'relative bg-blue-50 text-blue-600 px-4 py-3 flex items-center gap-3 active:opacity-80 transition-all duration-200'
                    : 'relative text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-3 flex items-center gap-3 transition-colors transition-all duration-200 active:opacity-80'
                }
                href={`/admin/${item.id === 'dashboard' ? 'dashboard' : item.id}`}
              >
                {isActive && (
                  <motion.span
                    data-testid="admin-sidebar-indicator"
                    layoutId="admin-sidebar-indicator"
                    className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l"
                    transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <span className={`material-symbols-outlined ${isActive ? 'icon-fill' : ''}`}>
                  {item.icon}
                </span>
                <span className="font-medium tracking-wide">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </aside>
  );
}
