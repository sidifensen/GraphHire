"use client";

import { useEffect, useState, type ReactNode } from "react";
import EnterpriseMobileApp from "@/mobile-enterprise/App";
import "@/mobile-enterprise/theme.css";

interface EnterpriseAdaptiveShellProps {
  children: ReactNode;
}

export default function EnterpriseAdaptiveShell({
  children,
}: EnterpriseAdaptiveShellProps) {
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobileViewport(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (isMobileViewport) {
    return (
      <div className="enterprise-mobile-ui">
        <EnterpriseMobileApp basename="/enterprise" />
      </div>
    );
  }

  return <>{children}</>;
}
