'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin/dashboard', label: '数据仪表盘', icon: 'dashboard' },
  { href: '/admin/company/audit', label: '企业审核', icon: 'gavel' },
  { href: '/admin/users', label: '用户管理', icon: 'group' },
  { href: '/admin/skills', label: '技能标签', icon: 'label' },
  { href: '/admin/tasks', label: '任务监控', icon: 'settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="h-screen w-64 fixed left-0 top-0 bg-surface border-r border-surface-container-low flex flex-col p-4 gap-2 z-50">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 py-6 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary font-headline font-bold">
          GH
        </div>
        <div>
          <h1 className="text-xl font-black text-blue-700 font-headline tracking-tight">GraphHire</h1>
          <p className="text-xs text-on-surface-variant font-label">管理后台</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:translate-x-1 cursor-pointer',
                isActive
                  ? 'bg-surface-container-highest text-primary font-headline text-sm font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low font-headline text-sm font-semibold'
              )}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-auto pt-4 border-t border-outline-variant/15">
        <button className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          返回前台
        </button>
      </div>
    </nav>
  );
}
