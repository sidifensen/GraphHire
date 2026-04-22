import type { Metadata } from 'next';
import '@/styles/globals.css';
import EnterpriseHeader from '@/components/enterprise/EnterpriseHeader';
import EnterpriseAuthGuard from '@/components/enterprise/EnterpriseAuthGuard';

export const metadata: Metadata = {
  title: 'GraphHire 图谱智聘 - 企业端',
};

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EnterpriseAuthGuard>
      <div className="flex flex-col h-screen bg-surface">
        <EnterpriseHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </EnterpriseAuthGuard>
  );
}
