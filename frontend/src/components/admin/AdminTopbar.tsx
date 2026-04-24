'use client';

import { Bell, HelpCircle, Settings, Moon, Sun, Menu, ChevronLeft } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface AdminTopbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function AdminTopbar({ isCollapsed, setIsCollapsed }: AdminTopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full shrink-0 items-center justify-between border-b border-outline-variant bg-white/80 px-8 backdrop-blur-md transition-colors duration-300 dark:bg-black/60">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mr-4 rounded-lg p-2 text-outline transition-colors hover:bg-surface dark:hover:bg-slate-800"
      >
        {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className="flex flex-1 items-center" />

      <div className="flex items-center gap-5">
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-outline transition-all hover:bg-surface hover:text-primary dark:hover:bg-slate-800"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button className="relative rounded-full p-2 text-outline transition-all hover:bg-surface hover:text-primary dark:hover:bg-slate-800">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-800" />
        </button>
        <button className="rounded-full p-2 text-outline transition-all hover:bg-surface hover:text-primary dark:hover:bg-slate-800">
          <HelpCircle size={20} />
        </button>
        <button className="rounded-full p-2 text-outline transition-all hover:bg-surface hover:text-primary dark:hover:bg-slate-800">
          <Settings size={20} />
        </button>

        <div className="mx-2 h-6 w-px bg-outline-variant" />

        <div className="group flex cursor-pointer items-center gap-3 pl-2">
          <div className="hidden text-right sm:block">
            <p className="leading-none text-on-surface transition-colors group-hover:text-primary">管理员</p>
            <p className="mt-1 text-[10px] uppercase tracking-tighter text-outline">Super Admin</p>
          </div>
          <div className="h-10 w-10 rounded-full border border-outline-variant p-0.5 transition-all group-hover:border-primary">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtQipRLkfc3RNhjEUgLQHdhyiEC6WY-ru9gMVMzqXhU2pECMq0qHfKJvbdWbZiinsp28UacDWLFPCWU2kzGzE1u6Kn6P4bTDDeeR9dUXYKoJwFPgRTBIkm243c8Bocl2DMZSlmi3MMmPnfrS1OAPEzvf6nKHHf4R5H3aSD60mLpdCw-vezRba6LwjXfm3lxDeTkB4P7CMBp56p1O5H0N0WeE5dMyhJBQagBLGb4ntCm3qHSx40J0gYqU1WObnpwSgZvQALDVgP5hqo"
              alt="Avatar"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
