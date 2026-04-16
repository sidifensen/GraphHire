import { PublicHeader, Footer } from '@/components/shared/layout';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
