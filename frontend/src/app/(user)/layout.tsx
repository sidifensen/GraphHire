import type { Metadata } from 'next';
import { TopNavBar } from '@/components/layout/top-navbar';
import { BottomTabBar } from '@/components/layout/bottom-tab';

export const metadata: Metadata = {
  title: 'GraphHire 图谱智聘 - 用户端',
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      <main className="flex-1">{children}</main>
      <BottomTabBar />
    </div>
  );
}
