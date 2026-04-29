import type { ReactNode } from "react";
import "./_styles/mobile-user.css";
import MobileShell from "./_components/MobileShell";
import { ThemeProvider } from "./_context/ThemeContext";

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MobileShell>{children}</MobileShell>
    </ThemeProvider>
  );
}
