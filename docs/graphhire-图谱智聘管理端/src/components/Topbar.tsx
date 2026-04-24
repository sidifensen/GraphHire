import { Bell, HelpCircle, Search, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 w-full z-40 bg-white/80 dark:bg-black/60 backdrop-blur-md border-b border-outline-variant flex justify-between items-center px-8 h-20 shrink-0 transition-colors duration-300">
      <div className="flex items-center flex-1">
        <div className="relative w-80 text-on-surface">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
          <input
            type="text"
            placeholder="搜索..."
            className="w-full bg-surface dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary placeholder-outline transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button 
          onClick={toggleTheme}
          className="text-outline hover:text-primary transition-all p-2 rounded-full hover:bg-surface dark:hover:bg-slate-800"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button className="text-outline hover:text-primary transition-all p-2 rounded-full hover:bg-surface dark:hover:bg-slate-800 relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
        </button>
        <button className="text-outline hover:text-primary transition-all p-2 rounded-full hover:bg-surface dark:hover:bg-slate-800">
          <HelpCircle size={20} />
        </button>
        <button className="text-outline hover:text-primary transition-all p-2 rounded-full hover:bg-surface dark:hover:bg-slate-800">
          <Settings size={20} />
        </button>
        
        <div className="h-6 w-px bg-outline-variant mx-2"></div>
        
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-on-surface leading-none group-hover:text-primary transition-colors">管理员</p>
            <p className="text-[10px] text-outline mt-1 uppercase tracking-tighter">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-outline-variant group-hover:border-primary transition-all p-0.5">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtQipRLkfc3RNhjEUgLQHdhyiEC6WY-ru9gMVMzqXhU2pECMq0qHfKJvbdWbZiinsp28UacDWLFPCWU2kzGzE1u6Kn6P4bTDDeeR9dUXYKoJwFPgRTBIkm243c8Bocl2DMZSlmi3MMmPnfrS1OAPEzvf6nKHHf4R5H3aSD60mLpdCw-vezRba6LwjXfm3lxDeTkB4P7CMBp56p1O5H0N0WeE5dMyhJBQagBLGb4ntCm3qHSx40J0gYqU1WObnpwSgZvQALDVgP5hqo"
              alt="Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
