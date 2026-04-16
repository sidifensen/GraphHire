'use client';

import { ProLayout } from '@ant-design/pro-components';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Badge } from 'antd';

const menuItems = [
  {
    path: '/admin/dashboard',
    name: '仪表盘',
    icon: '📊',
  },
  {
    path: '/admin/users',
    name: '用户管理',
    icon: '👥',
    children: [
      { path: '/admin/users/person', name: '个人用户' },
      { path: '/admin/users/company', name: '企业用户' },
    ],
  },
  {
    path: '/admin/auth',
    name: '企业认证',
    icon: '🔐',
  },
  {
    path: '/admin/resume',
    name: '简历库',
    icon: '📄',
  },
  {
    path: '/admin/job',
    name: '职位库',
    icon: '💼',
  },
  {
    path: '/admin/skill',
    name: '技能标签',
    icon: '🏷️',
  },
  {
    path: '/admin/task',
    name: '任务监控',
    icon: '⚙️',
  },
  {
    path: '/admin/settings',
    name: '设置',
    icon: '⚙️',
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <ProLayout
      title="GraphHire"
      logo="/logo.png"
      location={{ pathname }}
      menuItems={menuItems}
      menuItemRender={(item, dom) => (
        <a
          onClick={() => {
            if (item.path) router.push(item.path);
          }}
        >
          {dom}
        </a>
      )}
      headerRender={false}
      footerRender={false}
    >
      {children}
    </ProLayout>
  );
}
