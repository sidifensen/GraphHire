'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type ChatAvatarProps = {
  name: string;
  imageUrl?: string | null;
  testId?: string;
  className?: string;
};

export function ChatAvatar({ name, imageUrl, testId, className }: ChatAvatarProps) {
  const [broken, setBroken] = useState(false);
  const initial = name.trim().slice(0, 1).toUpperCase() || '?';

  useEffect(() => {
    setBroken(false);
  }, [imageUrl]);

  if (imageUrl && !broken) {
    return (
      <img
        src={imageUrl}
        alt={`${name}头像`}
        data-testid={testId}
        onError={() => setBroken(true)}
        className={cn(
          'h-9 w-9 shrink-0 rounded-full object-cover shadow-[0_4px_12px_rgba(15,23,42,0.18)] ring-1 ring-white/70',
          className,
        )}
      />
    );
  }

  return (
    <div
      data-testid={testId}
      className={cn(
        'h-9 w-9 shrink-0 rounded-full bg-white/80 text-on-surface font-bold text-sm flex items-center justify-center shadow-[0_4px_12px_rgba(15,23,42,0.12)] ring-1 ring-white/75',
        className,
      )}
    >
      {initial}
    </div>
  );
}