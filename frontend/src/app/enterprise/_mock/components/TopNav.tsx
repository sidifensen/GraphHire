import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../constants";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";
import { enterpriseAuthStore } from "@/lib/stores/auth-store";
import { companyApi } from "@/lib/api/company";

interface TopNavProps {
  title: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  userAvatar?: boolean;
  onBack?: () => void;
}

export function TopNav({ title, showBack, rightAction, userAvatar, onBack }: TopNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [authState, setAuthState] = useState(() => enterpriseAuthStore.getState());
  const isAuthenticated = authState.isAuthenticated;
  const user = authState.user;
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             (localStorage.getItem('theme') === 'dark') ||
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [avatarError, setAvatarError] = useState(false);
  const avatarSrc = user?.avatarUrl ?? null;
  const displayName = user?.displayName || user?.username || "企业账号";

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarSrc]);

  useEffect(() => {
    const unsubscribe = enterpriseAuthStore.subscribe((nextState) => {
      setAuthState(nextState);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated || !user?.id) {
      return () => {
        active = false;
      };
    }
    companyApi
      .getInfo()
      .then((company) => {
        if (!active || !company) {
          return;
        }
        const nextPatch: {
          displayName?: string;
          avatarUrl?: string | null;
        } = {};
        if (company.name && company.name.trim()) {
          nextPatch.displayName = company.name.trim();
        }
        if (company.avatarUrl) {
          nextPatch.avatarUrl = company.avatarUrl;
        } else if (company.logo) {
          nextPatch.avatarUrl = company.logo;
        }
        if (Object.keys(nextPatch).length > 0) {
          enterpriseAuthStore.getState().updateUser(nextPatch);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.id]);

  const toggleDark = () => {
    setIsDark(!isDark);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="bg-surface border-b border-surface-variant shadow-sm flex items-center justify-between h-16 w-full z-40 sticky top-0 md:px-8 px-4 flex-shrink-0 transition-colors">
      {/* Left Area (Mobile Backup or Empty Space on Desktop since logo is in the nav area) */}
      <div className="flex items-center gap-3 w-10 md:hidden">
        {showBack ? (
          <button
            onClick={handleBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-surface-container active:scale-95 transition-colors duration-150 text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[24px] text-on-surface">arrow_back_ios_new</span>
          </button>
        ) : (
          userAvatar && (
            <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant shrink-0 flex items-center justify-center">
               <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
          )
        )}
      </div>

      {/* Center Group (Mobile Title + Desktop Logo & Nav) */}
      <div className="flex-1 flex items-center justify-center md:justify-start gap-8">
        
        {/* Mobile Title (hidden on desktop) */}
        <h1 className="md:hidden text-lg font-bold text-on-surface tracking-tight font-headline-sm text-headline-sm truncate">
          {title === 'GraphHire' ? 'GraphHire 图谱智聘' : title}
        </h1>

        {/* Desktop Logo (hidden on mobile) */}
        <Link to="/" className="hidden md:flex items-center gap-2 group">
           <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
             <span className="material-symbols-outlined text-on-primary text-[20px]">hub</span>
           </div>
           <span className="text-xl font-bold text-primary tracking-tight">GraphHire 图谱智聘</span>
        </Link>

        {/* Desktop Header Nav */}
        <nav
          data-testid="enterprise-desktop-nav-track"
          className="hidden md:flex items-center gap-1 rounded-xl border border-outline-variant/40 bg-surface-container/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative px-4 py-2 rounded-lg font-label-md text-[15px] transition-all duration-200 ease-out flex items-center gap-2",
                  isActive 
                    ? "text-primary font-semibold"
                    : "text-on-surface-variant hover:bg-surface-variant/55 hover:text-on-surface hover:-translate-y-0.5 hover:scale-[1.02]"
                )}
              >
                {isActive && (
                  <motion.div
                    data-testid="enterprise-desktop-nav-indicator"
                    layoutId="desktop-nav-indicator"
                    className="absolute inset-0 rounded-lg bg-primary/12 shadow-[0_6px_14px_rgba(59,130,246,0.18)] -z-10"
                    transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.9 }}
                  />
                )}
                <span
                  className={cn("material-symbols-outlined text-[18px] transition-transform duration-200", isActive ? "scale-105" : "")}
                  style={item.iconFill && isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Area */}
      <div className="flex items-center justify-end min-w-[40px] gap-3 md:gap-4 md:w-auto">
        <button 
          onClick={toggleDark}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container active:scale-95 transition-colors duration-150 text-on-surface-variant hidden md:flex"
          title="切换夜间模式"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {rightAction ? (
            rightAction
        ) : (
            <Link to="/messages" className="text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors active:scale-95 duration-150 p-2 rounded-full relative flex items-center justify-center w-10 h-10">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border border-surface"></span>
            </Link>
        )}

        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? <span className="max-w-[180px] truncate text-sm text-on-surface">{displayName}</span> : null}
          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container overflow-hidden shrink-0 items-center justify-center border border-primary/20 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all flex">
            {!avatarSrc || avatarError ? (
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            ) : (
              <img
                src={avatarSrc}
                alt="企业用户头像"
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            )}
          </div>
        </div>
        
        {/* Mobile theme toggle as well since we moved avatar? Let's just keep theme toggle hidden on mobile or put it somewhere else. We'll leave it hidden on mobile to save space, or we can show it. Actually we don't need it on mobile right area. */}
      </div>
    </header>
  );
}
