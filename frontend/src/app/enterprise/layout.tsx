import type { Metadata } from 'next';
import EnterpriseAuthGuard from '@/components/enterprise/EnterpriseAuthGuard';
import MockEnterpriseShell from '@/features/mock-enterprise/components/MockEnterpriseShell';

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
      <MockEnterpriseShell>{children}</MockEnterpriseShell>
    </EnterpriseAuthGuard>
  );
}
