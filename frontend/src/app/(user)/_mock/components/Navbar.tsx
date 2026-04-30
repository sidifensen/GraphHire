import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, Building2, User, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { userAuthStore } from '@/lib/stores/auth-store';
import { personApi } from '@/lib/api/person';
import { resolveHorizontalIndicatorMetrics } from '@/lib/ui/nav-indicator';

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isPathActive(currentPathname: string, navPath: string) {
  if (navPath === '/') {
    return currentPathname === '/';
  }
  return currentPathname === navPath || currentPathname.startsWith(`${navPath}/`);
}

export default function Navbar() {
  const location = useLocation();
  const normalizedPathname = normalizePath(location.pathname);
  const [authState, setAuthState] = React.useState(() => userAuthStore.getState());
  const [avatarError, setAvatarError] = React.useState(false);
  const isAuthenticated = authState.isAuthenticated;
  const user = authState.user;

  const displayName = user?.displayName || user?.username || '求职者';
  const avatarSrc = user?.avatarUrl ?? null;

  const navItems = [
    { name: '首页', path: '/', icon: Home },
    { name: '职位', path: '/jobs', icon: Briefcase },
    { name: '公司', path: '/companies', icon: Building2 },
    { name: '我的', path: '/profile', icon: User },
  ];
  const activeNavPath = navItems.find((item) => isPathActive(normalizedPathname, item.path))?.path ?? '/';
  const activeNavIndex = Math.max(0, navItems.findIndex((item) => item.path === activeNavPath));
  const navItemWidth = 102;
  const navItemGap = 8;
  const indicatorMetrics = resolveHorizontalIndicatorMetrics(
    { left: 0 },
    { left: activeNavIndex * (navItemWidth + navItemGap), width: navItemWidth },
  );

  React.useEffect(() => {
    setAvatarError(false);
  }, [avatarSrc]);

  React.useEffect(() => {
    const unsubscribe = userAuthStore.subscribe((nextState) => {
      setAuthState(nextState);
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    let active = true;
    if (!isAuthenticated || !user?.id) {
      return () => {
        active = false;
      };
    }
    personApi
      .getProfile()
      .then((profile) => {
        if (!active || !profile) {
          return;
        }
        const nextPatch: {
          displayName?: string;
          email?: string;
          avatarUrl?: string | null;
        } = {};
        if (profile.realName && profile.realName.trim()) {
          nextPatch.displayName = profile.realName.trim();
        }
        if (profile.email && profile.email.trim()) {
          nextPatch.email = profile.email.trim();
        }
        if (profile.avatarUrl) {
          nextPatch.avatarUrl = profile.avatarUrl;
        }
        if (Object.keys(nextPatch).length > 0) {
          userAuthStore.getState().updateUser(nextPatch);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.id]);

  return (
    <nav className="hidden md:flex sticky top-0 z-[60] w-full h-16 bg-surface-lowest/80 backdrop-blur-md border-b border-surface-mid shadow-sm px-8 items-center justify-center">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-black text-primary tracking-tighter shrink-0 flex items-center">
            GraphHire <span className="text-on-surface-variant text-base font-bold ml-3 border-l border-surface-mid pl-3 tracking-widest uppercase">图谱智聘</span>
          </Link>
          <div className="relative flex items-center gap-2">
            <motion.div
              aria-hidden="true"
              data-testid="desktop-nav-indicator"
              className="absolute top-0 h-full bg-primary rounded-xl shadow-lg shadow-primary/20"
              initial={false}
              animate={{
                x: indicatorMetrics.x,
                width: indicatorMetrics.width,
              }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
            />
            {navItems.map((item) => {
              const isActive = isPathActive(normalizedPathname, item.path);
              return (
                <div
                  key={item.path}
                >
                  <Link
                    to={item.path}
                    className={
                      `flex items-center justify-center gap-2 w-[102px] py-2.5 rounded-xl transition-all font-black text-sm relative group ${
                        isActive ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'
                      }`
                    }
                  >
                    <item.icon size={18} className="relative z-10 group-hover:scale-110 transition-transform" />
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                </div>
              );
            })}
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
          {isAuthenticated ? (
            <button className="flex items-center gap-2.5 px-3 py-1.5 bg-surface-low text-on-surface font-bold rounded-xl hover:bg-surface-mid transition-colors text-sm">
              <span className="max-w-[180px] truncate">{displayName}</span>
              <span className="w-7 h-7 rounded-full overflow-hidden bg-surface-mid border border-surface-mid flex items-center justify-center">
                {!avatarSrc || avatarError ? (
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                ) : (
                  <img
                    src={avatarSrc}
                    alt="用户头像"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                )}
              </span>
            </button>
          ) : (
            <Link 
              to="/login"
              className="px-6 py-2 bg-surface-low text-on-surface font-bold rounded-xl hover:bg-surface-mid transition-colors text-sm"
            >
              登录 / 注册
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
