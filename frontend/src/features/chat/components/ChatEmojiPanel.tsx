'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { CHAT_EMOJI_CATEGORIES } from './emoji';

type ChatEmojiPanelProps = {
  onSelect: (emoji: string) => void;
};

export function ChatEmojiPanel({ onSelect }: ChatEmojiPanelProps) {
  const emojisPerPage = 72;
  const [activeCategoryId, setActiveCategoryId] = useState(CHAT_EMOJI_CATEGORIES[0]?.id ?? '');
  const [page, setPage] = useState(1);

  const activeCategory = useMemo(
    () => CHAT_EMOJI_CATEGORIES.find((item) => item.id === activeCategoryId) ?? CHAT_EMOJI_CATEGORIES[0],
    [activeCategoryId],
  );
  const totalPages = Math.max(1, Math.ceil((activeCategory?.emojis.length ?? 0) / emojisPerPage));
  const pageStart = (page - 1) * emojisPerPage;
  const pageEmojis = (activeCategory?.emojis ?? []).slice(pageStart, pageStart + emojisPerPage);

  useEffect(() => {
    setPage(1);
  }, [activeCategoryId]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div
      data-testid="chat-emoji-panel"
      className="absolute bottom-14 left-0 z-20 w-[430px] rounded-2xl border border-surface-container-highest bg-surface-container-lowest p-3 shadow-[0_20px_50px_rgba(15,23,42,0.20)] dark:border-outline-variant dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
    >
      <div className="chat-scrollbar mb-2 flex items-center gap-2 overflow-x-auto pb-1" data-testid="chat-emoji-category-tabs">
        {CHAT_EMOJI_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-pressed={activeCategory?.id === category.id}
            onClick={() => setActiveCategoryId(category.id)}
            className={cn(
              'shrink-0 rounded-full px-2.5 py-1 text-xs font-bold transition-colors',
              activeCategory?.id === category.id
                ? 'bg-primary/15 text-primary ring-1 ring-primary/25 dark:bg-primary/20 dark:text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high dark:text-on-surface-variant',
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div
        data-testid="chat-emoji-scroll-region"
        className="chat-scrollbar h-64 overflow-y-auto rounded-xl bg-surface-container p-2 ring-1 ring-surface-container-highest dark:ring-outline-variant"
      >
        <div className="grid grid-cols-10 gap-2">
          {pageEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
              className="h-7 w-7 rounded-lg hover:bg-surface-container-high text-base leading-none dark:text-on-surface"
              aria-label={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-on-surface-variant">
        <span>{activeCategory?.label ?? '表情'} · 第{page}/{totalPages}页</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
          aria-label="上一页表情"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1}
          className="rounded-md bg-surface-container px-2 py-0.5 font-bold disabled:opacity-40 dark:text-on-surface"
        >
          上一页
        </button>
          <button
            type="button"
          aria-label="下一页表情"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page >= totalPages}
          className="rounded-md bg-surface-container px-2 py-0.5 font-bold disabled:opacity-40 dark:text-on-surface"
        >
          下一页
        </button>
        </div>
      </div>
    </div>
  );
}
