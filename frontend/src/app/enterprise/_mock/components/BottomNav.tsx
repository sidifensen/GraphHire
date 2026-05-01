import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import { NAV_ITEMS } from '../constants';

export function BottomNav() {
  const pathname = usePathname() ?? '/enterprise/dashboard';

  if (
    pathname.includes('/jobs/create') ||
    pathname.includes('/jobs/edit') ||
    pathname.match(/\/jobs\/.+$/) ||
    pathname.includes('/candidate/')
  ) {
    if (!pathname.match(/\/jobs$/)) {
      return null;
    }
  }

  return (
    <nav className="bg-surface/90 backdrop-blur-md border-t border-surface-variant shadow-[0_-2px_8px_rgba(0,0,0,0.04)] fixed bottom-0 left-0 right-0 h-16 z-50 flex justify-around items-center px-4 pb-safe md:hidden">
      {NAV_ITEMS.map((item) => {
        const fullPath = `/enterprise${item.path}`;
        const isActive = pathname === fullPath || (fullPath !== '/enterprise/' && pathname.startsWith(fullPath));

        return (
          <Link
            key={item.path}
            href={fullPath}
            className={cn(
              'flex flex-col items-center justify-center hover:opacity-80 active:opacity-70 transition-opacity w-16 gap-1',
              isActive ? 'text-primary' : 'text-outline'
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className={cn('material-symbols-outlined text-[24px]')} style={item.iconFill && isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {item.icon}
            </span>
            <span className="text-[10px] font-medium font-sans">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
