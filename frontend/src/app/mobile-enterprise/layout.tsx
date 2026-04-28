import type { ReactNode } from "react";
import "./_styles/mobile-enterprise.css";
import MobileEnterpriseShell from "./_components/MobileEnterpriseShell";
import EnterpriseAuthGuard from "@/components/enterprise/EnterpriseAuthGuard";

export default function MobileEnterpriseLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <EnterpriseAuthGuard>
      <MobileEnterpriseShell>{children}</MobileEnterpriseShell>
    </EnterpriseAuthGuard>
  );
}
