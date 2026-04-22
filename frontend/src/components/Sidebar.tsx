'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { userAuthStore } from '@/lib/stores/auth-store';

const menuItems = [
  { href: '/profile', label: '个人资料', icon: 'account_circle' },
  { href: '/resume/manage', label: '简历管理', icon: 'description' },
  { href: '#', label: '投递记录', icon: 'assignment_turned_in' },
  { href: '/skill-graph', label: '我的图谱', icon: 'hub' },
  { href: '#', label: '账号设置', icon: 'settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = userAuthStore((state) => state.user);

  return (
    <aside className="hidden md:flex flex-col gap-2 w-64 h-screen p-4 bg-[#F8F9FF] dark:bg-slate-900 rounded-2xl my-4 ml-4 bg-slate-100/50 dark:bg-slate-800/50 border-none shadow-none sticky top-24 font-['Inter'] text-sm font-medium">
      <div className="flex items-center gap-3 mb-6 p-4">
        <div className="w-12 h-12 rounded-full bg-primary-container overflow-hidden">
          {user?.avatarUrl ? (
            <img
              alt="用户头像"
              className="w-full h-full object-cover"
              src={user.avatarUrl}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary font-bold">
              {(user?.username ?? 'U').slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#003DA6]">智聘空间</h3>
          <p className="text-xs text-tertiary">AI 驱动的职业导航</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex items-center gap-3 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-[#003DA6] dark:text-blue-300 rounded-xl px-4 py-3 font-bold'
                  : 'text-[#394851] dark:text-slate-400 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl'
              } hover:translate-x-1 transition-transform duration-200`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'icon-fill' : ''}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button className="mt-auto bg-gradient-to-br from-primary to-primary-container text-white rounded-xl py-3 px-4 font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-sm">edit</span>
        更新简历
      </button>
    </aside>
  );
}
