import type { ReactNode } from "react";
import "@/mobile-enterprise/theme.css";

export default function MobileEnterpriseLayout({ children }: { children: ReactNode }) {
  return <div className="enterprise-mobile-ui">{children}</div>;
}
