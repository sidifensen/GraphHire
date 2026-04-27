import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";

export function MobileLayout() {
  const location = useLocation();
  const [direction, setDirection] = useState(1);
  const [prevPath, setPrevPath] = useState(location.pathname);

  useEffect(() => {
    const currentDepth = location.pathname.split("/").filter(Boolean).length;
    const prevDepth = prevPath.split("/").filter(Boolean).length;

    if (currentDepth > prevDepth) {
      setDirection(1);
    } else if (currentDepth < prevDepth) {
      setDirection(-1);
    } else {
      setDirection(0);
    }

    setPrevPath(location.pathname);
  }, [location.pathname, prevPath]);

  const variants: Variants = {
    initial: (moveDirection: number) => ({
      x: moveDirection > 0 ? 50 : moveDirection < 0 ? -50 : 0,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 } as const,
        opacity: { duration: 0.2 },
      },
    },
    exit: (moveDirection: number) => ({
      x: moveDirection > 0 ? -50 : moveDirection < 0 ? 50 : 0,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 } as const,
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <div className="bg-surface-dim min-h-screen flex justify-center">
      <div className="w-full max-w-[375px] md:max-w-none bg-background min-h-screen relative shadow-2xl overflow-x-hidden flex flex-col font-body-md text-body-md text-on-surface mx-auto">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={location.pathname}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col h-full w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        <BottomNav />
      </div>
    </div>
  );
}

