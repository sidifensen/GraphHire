import type { Metadata } from 'next';
import '@/styles/globals.css';
import EnterpriseHeader from '@/components/enterprise/EnterpriseHeader';
import EnterpriseAuthGuard from '@/components/enterprise/EnterpriseAuthGuard';
import RouteTransition from '@/components/layout/RouteTransition';
import EnterpriseAdaptiveShell from '@/components/enterprise/EnterpriseAdaptiveShell';

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
      <EnterpriseAdaptiveShell>
        <div className="flex flex-col h-screen bg-surface">
          <EnterpriseHeader />
          <main className="flex-1 overflow-y-auto">
            <RouteTransition className="min-h-full">
              {children}
            </RouteTransition>
          </main>
        </div>
      </EnterpriseAdaptiveShell>
    </EnterpriseAuthGuard>
  );
}
