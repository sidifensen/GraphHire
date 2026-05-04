'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU_ITEMS = [
  { label: '个人主页', href: '/profile' },
  { label: '个人资料', href: '/personal-info' },
  { label: '简历管理', href: '/resume/manage' },
  { label: '沟通消息', href: '/chat' },
  { label: '我的图谱', href: '/skill-graph' },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function UserWorkbenchSidebar() {
  const pathname = usePathname() ?? '/';

  return (
    <aside className="hidden lg:block lg:w-64 lg:shrink-0">
      <nav aria-label="我的页面菜单" className="sticky top-24 rounded-2xl border border-surface-mid bg-surface-lowest">
        <ul className="divide-y divide-surface-mid">
          {MENU_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`block px-4 py-3 text-sm font-semibold transition-colors ${active ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-low'}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
