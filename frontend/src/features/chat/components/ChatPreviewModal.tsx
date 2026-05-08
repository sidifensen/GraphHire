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
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-2xl dark:bg-surface-container-lowest dark:shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-surface-container-highest bg-surface-container-low px-4 py-3 dark:border-outline-variant/70 dark:bg-surface-container-low">
          <p className="truncate text-sm font-bold text-on-surface">{previewFileName || '简历预览'}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-surface-container-high px-3 py-1 text-sm text-on-surface shadow-sm transition-colors hover:bg-surface-container-highest dark:bg-surface-container-high dark:text-on-surface dark:hover:bg-surface-container-highest"
          >
            关闭预览
          </button>
        </div>
        {previewKind === 'image' ? (
          <div className="flex h-full w-full flex-1 items-center justify-center bg-black/80 p-3 dark:bg-black">
            <img title="图片预览" src={previewUrl} alt={previewFileName || '图片预览'} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <div className="flex h-full w-full flex-1 flex-col bg-surface-container-lowest dark:bg-surface-container-lowest">
            <iframe
              data-testid="chat-pdf-preview-frame"
              src={previewUrl}
              className="h-full w-full flex-1"
              title="简历预览"
            />
            <div className="flex justify-end border-t border-surface-container-highest bg-surface-container-low px-4 py-2 dark:border-outline-variant/70 dark:bg-surface-container-low">
              <a
                data-testid="chat-pdf-download-link"
                href={previewUrl}
                download={previewFileName || 'resume.pdf'}
                className="inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-on-primary"
              >
                下载PDF文件
              </a>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
