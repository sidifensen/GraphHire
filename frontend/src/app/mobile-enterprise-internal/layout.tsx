import type { ReactNode } from "react";
import "@/mobile/styles.css";

export default function MobileEnterpriseLayout({ children }: { children: ReactNode }) {
  return <div className="mobile-ui">{children}</div>;
}
