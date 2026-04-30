import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Home, Briefcase, Building2, User, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: '首页', path: '/', icon: Home },
    { name: '职位', path: '/jobs', icon: Briefcase },
    { name: '公司', path: '/companies', icon: Building2 },
    { name: '我的', path: '/profile', icon: User },
  ];

  return (
    <nav className="hidden md:flex sticky top-0 z-[60] w-full h-16 bg-surface-lowest/80 backdrop-blur-md border-b border-surface-mid shadow-sm px-8 items-center justify-center">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-black text-primary tracking-tighter shrink-0 flex items-center">
            GraphHire <span className="text-on-surface-variant text-base font-bold ml-3 border-l border-surface-mid pl-3 tracking-widest uppercase">图谱智聘</span>
          </Link>
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-black text-sm relative group ${
                    isActive ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-pill"
                        className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon size={18} className="relative z-10 group-hover:scale-110 transition-transform" />
                    <span className="relative z-10">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/notifications" 
            className="p-2 text-on-surface-variant hover:bg-surface-low rounded-full transition-colors relative"
          >
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface-lowest"></span>
          </Link>
          <Link 
            to="/login"
            className="px-6 py-2 bg-surface-low text-on-surface font-bold rounded-xl hover:bg-surface-mid transition-colors text-sm"
          >
            登录 / 注册
          </Link>
        </div>
      </div>
    </nav>
  );
}
