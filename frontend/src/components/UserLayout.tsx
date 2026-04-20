'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';

interface UserLayoutProps {
  children: React.ReactNode;
  contentClassName?: string;
}

export default function UserLayout({ children, contentClassName = '' }: UserLayoutProps) {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased">
      <Header />
      <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
        <Sidebar />
        <main className={`flex-1 p-8 md:p-12 pb-24 ${contentClassName}`}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}