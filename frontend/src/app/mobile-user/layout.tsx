import type { ReactNode } from "react";
import "./_styles/mobile-user.css";
import MobileShell from "./_components/MobileShell";

export default function MobileLayout({ children }: { children: ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}
