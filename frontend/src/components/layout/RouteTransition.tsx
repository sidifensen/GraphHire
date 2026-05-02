'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface RouteTransitionProps {
  children: React.ReactNode;
  className?: string;
  testId?: string;
}

export default function RouteTransition({ children, className = '', testId }: RouteTransitionProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={className} data-testid={testId}>
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
        className={className}
        data-testid={testId}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

