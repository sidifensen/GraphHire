import type { Metadata } from 'next';
import { SideNavBar } from '@/components/layout/side-navbar';

export const metadata: Metadata = {
  title: 'GraphHire 图谱智聘 - 企业端',
};

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full overflow-hidden flex">
      <SideNavBar />
      <main className="ml-64 flex-1 h-screen overflow-y-auto bg-surface">
        {children}
      </main>
    </div>
  );
}
