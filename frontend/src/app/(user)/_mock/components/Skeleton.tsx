import { motion } from 'framer-motion';

export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
      className={`bg-surface-high rounded-md ${className}`}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-md shadow-sm border border-surface-mid animate-pulse">
      <div className="flex justify-between items-start mb-sm">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-1/4" />
      </div>
      <div className="flex gap-2 mb-md">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex justify-between items-center pt-sm border-t border-surface-mid">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
