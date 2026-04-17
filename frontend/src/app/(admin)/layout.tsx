import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export const metadata: Metadata = {
  title: 'GraphHire 图谱智聘 - 管理端',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <main className="ml-64 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
