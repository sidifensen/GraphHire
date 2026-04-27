"use client";

import { useEffect, useState } from "react";
import EnterpriseMobileApp from "@/mobile-enterprise/App";

export default function EnterpriseMobilePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <EnterpriseMobileApp basename="/enterprise" />;
}
