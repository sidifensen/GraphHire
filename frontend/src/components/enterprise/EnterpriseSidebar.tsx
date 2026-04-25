'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const enterpriseNavItems = [
  { href: '/enterprise/dashboard', label: '概览', icon: 'dashboard' },
  { href: '/enterprise/jobs', label: '职位管理', icon: 'work' },
  { href: '/enterprise/recommendations', label: '人才推荐', icon: 'groups' },
  { href: '/enterprise/employees', label: '团队成员', icon: 'badge' },
  { href: '/enterprise/notifications', label: '通知中心', icon: 'notifications' },
];

export function EnterpriseSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-slate-200 bg-white px-3 py-5">
      <div className="mb-6 flex items-center gap-3 px-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <span className="material-symbols-outlined text-base icon-fill">domain</span>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">GraphHire</p>
          <p className="text-xs text-slate-500">企业管理端</p>
        </div>
      </div>

      <nav className="space-y-1">
        {enterpriseNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${isActive ? 'icon-fill' : ''}`}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
