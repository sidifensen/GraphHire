'use client';

import { Dropdown, Badge, Avatar, Menu, Button } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const personNavItems = [
  { key: '/person/home', label: '首页' },
  { key: '/person/jobs', label: '职位推荐' },
  { key: '/person/graph', label: '能力图谱' },
  { key: '/person/resume', label: '简历管理' },
];

const companyNavItems = [
  { key: '/company/home', label: '首页' },
  { key: '/company/jobs', label: '职位管理' },
  { key: '/company/match', label: '候选人推荐' },
  { key: '/company/talent', label: '人才库' },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, clearAuth } = useAuthStore();

  const isLoggedIn = !!role;
  const navItems = role === 'COMPANY' ? companyNavItems : personNavItems;
  const homePath = role === 'COMPANY' ? '/company/home' : '/person/home';

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile">{role === 'COMPANY' ? '企业中心' : '个人中心'}</Menu.Item>
      <Menu.Item key="settings">设置</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>退出登录</Menu.Item>
    </Menu>
  );

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center">
      <div className="flex items-center gap-8 flex-1">
        <a href="/" className="text-xl font-semibold text-primary">
          GraphHire
        </a>
        {isLoggedIn && (
          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.key}
                className={`px-4 py-2 text-sm rounded-button transition-colors ${
                  pathname.startsWith(item.key)
                    ? 'text-primary bg-primary/5 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <Badge count={3}>
              <a href="/notifications" className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </a>
            </Badge>

            <Dropdown overlay={menu} placement="bottomRight">
              <Avatar className="cursor-pointer bg-primary">U</Avatar>
            </Dropdown>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button type="text" onClick={() => router.push('/login')}>
              登录
            </Button>
            <Button type="primary" onClick={() => router.push('/login')}>
              注册
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
