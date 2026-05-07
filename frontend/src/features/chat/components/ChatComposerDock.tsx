import { Images } from 'lucide-react';
import { ChatEmojiPanel } from './ChatEmojiPanel';
import { InterviewInviteDialog } from './InterviewInviteDialog';

type ChatComposerDockProps = {
  isUserRole: boolean;
  showEmojiPanel: boolean;
  onToggleEmoji: () => void;
  onSelectEmoji: (emoji: string) => void;
  onPickImage: (file: File | null) => void;
  hasDefaultResume: boolean;
  resumeSending: boolean;
  onSendResume: () => Promise<void>;
  inviteSending: boolean;
  onInviteError: (message: string) => void;
  onSendInterview: (payload: { interviewTime: string; location: string; remark: string }) => Promise<void>;
  input: string;
  onInputChange: (value: string) => void;
  sending: boolean;
  onSendText: () => Promise<void>;
};

export function ChatComposerDock({
  isUserRole,
  showEmojiPanel,
  onToggleEmoji,
  onSelectEmoji,
  onPickImage,
  hasDefaultResume,
  resumeSending,
  onSendResume,
  inviteSending,
  onInviteError,
  onSendInterview,
  input,
  onInputChange,
  sending,
  onSendText,
}: ChatComposerDockProps) {
  return (
    <footer data-testid="chat-detail-composer" className="chat-frosted-composer shrink-0 border-t border-white/70 px-4 py-3 bg-white/56 backdrop-blur-xl">
      <div className="mb-2 relative flex items-center gap-2 rounded-2xl bg-white/72 p-2 ring-1 ring-white/85 shadow-[0_10px_22px_rgba(15,23,42,0.08)]">
        <button
          type="button"
          data-testid="chat-emoji-button"
          onClick={onToggleEmoji}
          className="h-9 w-9 rounded-xl bg-white/90 text-on-surface-variant hover:bg-white"
          aria-label="表情"
        >
          😀
        </button>
        {showEmojiPanel ? <ChatEmojiPanel onSelect={onSelectEmoji} /> : null}

        <label className="h-9 w-9 rounded-xl bg-white/90 text-on-surface-variant hover:bg-white inline-flex items-center justify-center cursor-pointer" aria-label="相册">
          <Images className="h-5 w-5" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              onPickImage(file);
              event.currentTarget.value = '';
            }}
          />
        </label>

        {isUserRole ? (
          <button
            type="button"
            onClick={() => void onSendResume()}
            disabled={!hasDefaultResume || resumeSending}
            className="h-9 px-3 rounded-xl bg-white text-primary text-sm font-bold ring-1 ring-primary/25 disabled:opacity-60"
          >
            {resumeSending ? '发送中...' : '发送简历'}
          </button>
        ) : (
          <InterviewInviteDialog
            sending={inviteSending}
            onError={onInviteError}
            onSubmit={onSendInterview}
          />
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="输入消息..."
          className="flex-1 h-10 rounded-2xl bg-white/86 px-3 text-sm ring-1 ring-white/90 outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={() => void onSendText()}
          disabled={sending}
          className="h-10 px-5 rounded-2xl bg-primary text-white text-sm font-bold shadow-[0_8px_20px_rgba(37,99,235,0.45)] disabled:opacity-60"
        >
          {sending ? '发送中...' : '发送'}
        </button>
      </div>
    </footer>
  );
}