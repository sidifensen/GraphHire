'use client';

import { SideNav, TopBar } from '@/components/shared/layout';
import { usePathname } from 'next/navigation';

const companyNavItems = [
  { icon: 'dashboard', label: '控制台', href: '/company/home' },
  { icon: 'business_center', label: '企业信息', href: '/company/profile' },
  { icon: 'add_circle', label: '职位发布', href: '/company/job/create' },
  { icon: 'layers', label: '职位管理', href: '/company/job' },
  { icon: 'auto_awesome', label: '推荐简历', href: '/company/resume' },
];

const bottomAction = (
  <button className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
    <span className="material-symbols-outlined">add</span>
    发布新职位
  </button>
);

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <SideNav
        items={companyNavItems}
        title="图谱智聘"
        subtitle="企业管理后台"
        bottomAction={bottomAction}
      />
      <div className="ml-64">
        <TopBar
          title={
            pathname.includes('/company/profile') ? '企业信息设置' :
            pathname.includes('/company/job/create') ? '发布新职位' :
            pathname.includes('/company/job') ? '职位管理' :
            pathname.includes('/company/resume') ? '推荐简历' :
            '控制台'
          }
        />
        <main className="ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
