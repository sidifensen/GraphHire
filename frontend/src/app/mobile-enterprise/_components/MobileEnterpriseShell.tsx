"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BottomNav } from "../components/BottomNav";

const INTERNAL_PREFIX = "/mobile-enterprise";

function toInternalPath(pathname: string): string {
  if (!pathname.startsWith(INTERNAL_PREFIX)) {
    return pathname || "/";
  }

  return pathname.slice(INTERNAL_PREFIX.length) || "/";
}

export default function MobileEnterpriseShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const internalPathname = toInternalPath(pathname);
  const [direction, setDirection] = useState(1);
  const [prevPath, setPrevPath] = useState(internalPathname);

  useEffect(() => {
    const currentDepth = internalPathname.split("/").filter(Boolean).length;
    const prevDepth = prevPath.split("/").filter(Boolean).length;

    if (currentDepth > prevDepth) {
      setDirection(1);
    } else if (currentDepth < prevDepth) {
      setDirection(-1);
    } else {
      setDirection(0);
    }

    setPrevPath(internalPathname);
  }, [internalPathname, prevPath]);

  return (
    <div className="mobile-enterprise-ui bg-background min-h-screen overflow-x-hidden">
      <div className="w-full bg-background min-h-screen relative overflow-x-hidden flex flex-col font-body-md text-body-md text-on-surface">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={internalPathname}
            custom={direction}
            variants={{
              initial: (nextDirection: number) => ({
                x: nextDirection > 0 ? 50 : nextDirection < 0 ? -50 : 0,
                opacity: 0,
              }),
              animate: {
                x: 0,
                opacity: 1,
                transition: {
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                },
              },
              exit: (nextDirection: number) => ({
                x: nextDirection > 0 ? -50 : nextDirection < 0 ? 50 : 0,
                opacity: 0,
                transition: {
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                },
              }),
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col h-full w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        <BottomNav />
      </div>
    </div>
  );
}
