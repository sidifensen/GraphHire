"use client";

import { Link, useLocation } from "../_lib/router";
import { cn } from "../lib/utils";
import { NAV_ITEMS } from "../constants";
import { mapEnterprisePathToMobilePath } from "@/lib/device-routing";

export function BottomNav() {
  const location = useLocation();
  const currentPath = mapEnterprisePathToMobilePath(location.pathname);

  // Hide bottom nav on specific pages
  if (
    currentPath.includes("/jobs/create") ||
    currentPath.includes("/jobs/edit") ||
    currentPath.match(/\/jobs\/.+$/) ||
    currentPath.includes("/candidate/") ||
    currentPath.includes("/messages")
  ) {
    if (!currentPath.match(/\/jobs$/)) {
        return null;
    }
  }

  return (
    <nav className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] fixed bottom-0 left-0 right-0 h-16 z-50 flex justify-around items-center px-4 pb-safe md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center hover:opacity-80 active:opacity-70 transition-opacity w-16 gap-1",
              isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span
              className={cn("material-symbols-outlined text-[24px]")}
              style={item.iconFill && isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-medium font-sans">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
