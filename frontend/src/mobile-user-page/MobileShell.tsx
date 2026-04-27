"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/mobile-user-page/components/BottomNav";
import { mapMobilePathToUserPath } from "@/lib/device-routing";

const HIDE_BOTTOM_NAV_PATHS = ["/login", "/register"];
const SHOW_BOTTOM_NAV_PATHS = ["/", "/jobs", "/companies", "/profile"];

export default function MobileShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const cleanPathname = mapMobilePathToUserPath(pathname);

  const hideBottomNav = HIDE_BOTTOM_NAV_PATHS.includes(cleanPathname);
  const showBottomNav = SHOW_BOTTOM_NAV_PATHS.includes(cleanPathname);

  return (
    <div className="mobile-ui min-h-screen">
      {children}
      {!hideBottomNav && showBottomNav ? <BottomNav /> : null}
    </div>
  );
}
