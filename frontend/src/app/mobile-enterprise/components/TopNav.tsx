"use client";

import { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "../_lib/router";
import { NAV_ITEMS } from "../constants";
import { cn } from "../lib/utils";
import { mapEnterprisePathToMobilePath } from "@/lib/device-routing";

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
  const currentPath = mapEnterprisePathToMobilePath(location.pathname);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between h-16 px-4 w-full z-40 sticky top-0 md:px-container-margin">
      {/* Left Area (Mobile Back or Desktop Avatar) */}
      <div className="flex items-center gap-3 w-10 md:w-auto">
        {showBack ? (
          <button
            onClick={handleBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 duration-150 text-slate-500 dark:text-slate-400"
          >
            <span className="material-symbols-outlined text-[24px] text-on-surface">arrow_back_ios_new</span>
          </button>
        ) : (
          <div className="hidden md:flex w-8 h-8 rounded-full bg-blue-100 text-blue-600 overflow-hidden border border-blue-200 shrink-0 items-center justify-center">
             <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
        )}
        
        {!showBack && userAvatar && (
          <div className="md:hidden w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant shrink-0 flex items-center justify-center">
             <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
        )}
      </div>

      {/* Center Group (Title + Desktop Nav) */}
      <div className="flex-1 flex items-center justify-center md:justify-start md:ml-6 gap-stack-gap-lg">
        <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400 tracking-tight font-headline-sm text-headline-sm">
          {title === 'GraphHire' ? (
                <Link to="/" className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  {title}
                </Link>
          ) : (
              <span className="text-slate-900 dark:text-slate-100">{title}</span>
          )}
        </h1>

        {/* Desktop Header Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-2",
                  isActive 
                    ? "bg-blue-50 text-blue-600 font-semibold" 
                    : "text-on-surface-variant hover:bg-surface-variant/50"
                )}
              >
                <span className="material-symbols-outlined text-[18px]" style={item.iconFill && isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Area */}
      <div className="flex items-center justify-end min-w-10 w-10 gap-3 md:w-auto">
        {rightAction ? (
            rightAction
        ) : (
            <Link to="/messages" className="text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 duration-150 p-2 -mr-2 rounded-full relative flex">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-white"></span>
            </Link>
        )}
      </div>
    </header>
  );
}
