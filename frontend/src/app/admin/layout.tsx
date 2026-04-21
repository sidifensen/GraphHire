import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'GraphHire 图谱智聘 - 管理端',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-x-hidden antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {children}
    </div>
  );
}