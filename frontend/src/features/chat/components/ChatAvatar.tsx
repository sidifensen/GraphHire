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
          'h-9 w-9 shrink-0 rounded-full object-cover shadow-[0_4px_12px_rgba(15,23,42,0.18)] ring-1 ring-surface-container-highest dark:ring-outline-variant/70',
          className,
        )}
      />
    );
  }

  return (
    <div
      data-testid={testId}
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-sm font-bold text-on-surface shadow-[0_4px_12px_rgba(15,23,42,0.12)] ring-1 ring-surface-container-highest dark:bg-surface-container-high dark:ring-outline-variant/70',
        className,
      )}
    >
      {initial}
    </div>
  );
}
