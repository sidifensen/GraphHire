'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-grow flex flex-col min-h-screen bg-surface">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}