import type { ReactNode } from "react";
import "@/mobile/styles.css";
import MobileShell from "@/mobile/MobileShell";

export default function MobileLayout({ children }: { children: ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}
