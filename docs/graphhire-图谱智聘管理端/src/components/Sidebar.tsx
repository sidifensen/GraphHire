import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Users, Tags, Activity, Network, Menu, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { icon: LayoutDashboard, label: '仪表盘', path: '/dashboard' },
  { icon: ShieldCheck, label: '企业审核', path: '/companies' },
  { icon: Users, label: '用户管理', path: '/users' },
  { icon: Tags, label: '标签管理', path: '/tags' },
  { icon: Activity, label: '任务监控', path: '/tasks' },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-full border-r border-outline-variant bg-white dark:bg-black dark:border-white/10 flex flex-col py-6 z-50 overflow-hidden transition-colors duration-300"
    >
      <div className={cn(
        "px-6 mb-8 flex items-center justify-between transition-all duration-300",
        isCollapsed && "px-4 justify-center"
      )}>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
            >
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white shrink-0">
                <Network size={20} />
              </div>
              <h1 className="text-xl font-bold text-primary font-display">GraphHire</h1>
            </motion.div>
          )}
          {isCollapsed && (
             <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.8 }}
               className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shrink-0"
             >
               <Network size={24} />
             </motion.div>
          )}
        </AnimatePresence>

        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg text-outline hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="px-4 mb-8 flex justify-center">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-lg text-primary hover:bg-blue-50 dark:hover:bg-primary/10 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      )}
      
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="group relative block"
            title={isCollapsed ? item.label : ""}
          >
            {({ isActive }) => (
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out font-medium text-sm",
                  isActive 
                    ? "text-primary font-bold" 
                    : "text-slate-600 hover:text-on-surface select-none",
                  isCollapsed && "px-0 justify-center h-12"
                )}
              >
                {/* Active indicator sliding background */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-blue-50/80 dark:bg-primary/10 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Active left border indicator */}
                {isActive && (
                  <motion.div
                    layoutId="active-border"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <motion.div
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    color: isActive ? "var(--color-primary)" : "currentColor"
                  }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <item.icon size={20} />
                </motion.div>
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="relative z-10 whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Hover subtle glow */}
                {!isActive && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-50 dark:bg-slate-800 rounded-lg -z-20 transition-opacity duration-300" />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="px-4 mt-auto">
        <div className={cn(
          "p-4 bg-surface rounded-xl border border-outline-variant/30 text-center transition-all",
          isCollapsed && "p-2 bg-transparent border-none"
        )}>
          {!isCollapsed ? (
            <>
              <p className="text-xs text-outline mb-2">系统版本 V2.4.0</p>
              <p className="text-[10px] text-outline/60">© 2024 GraphHire</p>
            </>
          ) : (
            <div className="text-[10px] text-outline/60 font-bold">V 2.4</div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
