'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const MENU_ITEMS = [
  { label: '个人主页', href: '/profile' },
  { label: '个人资料', href: '/personal-info' },
  { label: '简历管理', href: '/resume/manage' },
  { label: '我的图谱', href: '/skill-graph' },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function UserWorkbenchSidebar() {
  const pathname = usePathname() ?? '/';
  const transparent = pathname === '/skill-graph' || pathname.startsWith('/skill-graph/');

  return (
    <aside className={`hidden lg:block lg:shrink-0 ${transparent ? 'lg:w-0' : 'lg:w-24'}`}>
      <nav
        aria-label="我的页面菜单"
        className={`fixed left-8 top-28 z-30 inline-block ${
          transparent ? 'bg-transparent backdrop-blur-[1px]' : ''
        }`}
      >
        <ul className="space-y-1.5">
          {MENU_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.label} className="relative">
                {active ? (
                  <motion.span
                    layoutId="user-workbench-sidebar-active"
                    transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                    className={`absolute inset-0 rounded-r-full border-l-2 border-primary ${
                      transparent ? 'bg-primary/15' : 'bg-primary/10'
                    }`}
                  />
                ) : null}
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`block whitespace-nowrap rounded-r-full border-l-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-transparent text-primary'
                      : transparent
                        ? 'border-transparent text-on-surface hover:bg-surface-low/55 hover:text-on-surface'
                        : 'border-transparent text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
                  } relative z-10`}
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
