'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import RouteTransition from '@/components/RouteTransition';

interface UserLayoutProps {
  children: React.ReactNode;
  contentClassName?: string;
}

const SIDEBAR_ROUTE_PREFIXES = ['/profile', '/resume'];

export default function UserLayout({ children, contentClassName = '' }: UserLayoutProps) {
  const pathname = usePathname();
  const showSidebar = SIDEBAR_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const hideFooter = /^\/jobs\/[^/]+$/.test(pathname) || /^\/match\/[^/]+$/.test(pathname);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased">
      <Header />
      <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
        {showSidebar ? <Sidebar /> : null}
        <main className={`flex-1 p-4 md:p-6 pb-24 ${contentClassName}`}>
          <RouteTransition>
            {children}
          </RouteTransition>
        </main>
      </div>
      {!hideFooter ? <Footer /> : null}
    </div>
  );
}
