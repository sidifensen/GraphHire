import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Briefcase, Building2, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function BottomNav() {
  const navItems = [
    { name: '首页', icon: Home, path: '/' },
    { name: '职位', icon: Briefcase, path: '/jobs' },
    { name: '公司', icon: Building2, path: '/companies' },
    { name: '我的', icon: User, path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-20 bg-surface-lowest/95 backdrop-blur-md border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,82,255,0.05)] flex justify-around items-center px-4 pb-safe z-50 rounded-t-2xl md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-16 relative transition-all duration-300 ${
              isActive ? 'text-primary' : 'text-outline hover:text-primary/70'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <motion.div
                whileTap={{ scale: 0.8 }}
                className="p-2 rounded-xl relative transition-colors duration-300"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-bg"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <item.icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`relative z-10 transition-colors ${isActive ? 'text-primary fill-primary/10' : 'text-outline'}`} 
                />
              </motion.div>
              <span className={`text-[10px] font-black mt-1 transition-all ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.name}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
