'use client';

import { createPortal } from 'react-dom';

type ChatPreviewModalProps = {
  previewUrl: string | null;
  previewFileName: string;
  previewKind: 'pdf' | 'image';
  onClose: () => void;
};

export function ChatPreviewModal({ previewUrl, previewFileName, previewKind, onClose }: ChatPreviewModalProps) {
  if (!previewUrl || typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <div data-testid="chat-resume-preview-modal" className="fixed inset-0 z-[9999] bg-black/70 p-2 md:p-6 dark:bg-black/80">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white/95 shadow-2xl backdrop-blur-lg dark:bg-surface-container-lowest dark:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-white/70 bg-white/90 px-4 py-3 dark:border-white/10 dark:bg-surface-container-low">
          <p className="truncate text-sm font-bold text-on-surface">{previewFileName || '简历预览'}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/85 px-3 py-1 text-sm text-on-surface shadow-sm hover:bg-white dark:bg-surface-container-high dark:text-on-surface dark:hover:bg-surface-container-highest"
          >
            关闭预览
          </button>
        </div>
        {previewKind === 'image' ? (
          <div className="flex h-full w-full flex-1 items-center justify-center bg-black/80 p-3 dark:bg-black">
            <img title="图片预览" src={previewUrl} alt={previewFileName || '图片预览'} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <iframe title="简历预览" src={previewUrl} sandbox="allow-downloads" className="h-full w-full flex-1 bg-white dark:bg-surface-container-lowest" />
        )}
      </div>
    </div>,
    document.body,
  );
}
