import type { ReactNode } from "react";
import "@/mobile-user-page/styles.css";
import MobileShell from "@/mobile-user-page/MobileShell";

export default function MobileLayout({ children }: { children: ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}
