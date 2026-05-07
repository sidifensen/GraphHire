import type { ChatConversationSummary, ChatMessage } from '@/lib/types/chat';
import { ChatAvatar } from './ChatAvatar';

type ChatMessageStreamProps = {
  messages: ChatMessage[];
  loadingMessages: boolean;
  currentUserId: number | null;
  currentUserName: string;
  role: 'user' | 'enterprise';
  selectedConversation: ChatConversationSummary;
  peerAvatarUrl: string | null;
  currentAvatar: string | null;
  parseExt: (ext?: string | null) => Record<string, unknown> | null;
  getDateKey: (value?: string | null) => string;
  formatDateTag: (value?: string | null) => string;
  getUserDisplay: (role: 'user' | 'enterprise', item: ChatConversationSummary) => string;
  canDownloadResume: (ext: Record<string, unknown> | null) => boolean;
  resumeFileLoading: boolean;
  inlineImageUrls: Record<number, string>;
  inlineImageErrors: Record<number, string>;
  onPreviewResume: (conversationId: number, ext: Record<string, unknown> | null) => Promise<void>;
  onDownloadResume: (conversationId: number, ext: Record<string, unknown> | null) => Promise<void>;
  onPreviewImage: (conversationId: number, messageId: number, ext: Record<string, unknown> | null) => Promise<void>;
  onLoadInlineImage: (conversationId: number, messageId: number) => Promise<void>;
  messageEndRef: React.RefObject<HTMLDivElement | null>;
};

export function ChatMessageStream({
  messages,
  loadingMessages,
  currentUserId,
  currentUserName,
  role,
  selectedConversation,
  peerAvatarUrl,
  currentAvatar,
  parseExt,
  getDateKey,
  formatDateTag,
  getUserDisplay,
  canDownloadResume,
  resumeFileLoading,
  inlineImageUrls,
  inlineImageErrors,
  onPreviewResume,
  onDownloadResume,
  onPreviewImage,
  onLoadInlineImage,
  messageEndRef,
}: ChatMessageStreamProps) {
  return (
    <div data-testid="chat-message-scroll-container" className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-white/25 to-white/8 dark:from-white/5 dark:to-transparent">
      {loadingMessages ? <div className="text-sm text-on-surface-variant">消息加载中...</div> : null}
      {!loadingMessages && messages.length === 0 ? <div className="text-sm text-on-surface-variant">暂无消息</div> : null}

      {messages.map((message, index) => {
        const self = currentUserId != null && message.senderUserId === currentUserId;
        const ext = parseExt(message.ext);
        const currentDateKey = getDateKey(message.createTime);
        const prevDateKey = index > 0 ? getDateKey(messages[index - 1].createTime) : null;
        const showDateTag = index === 0 || currentDateKey !== prevDateKey;
        const senderName = self ? currentUserName : getUserDisplay(role, selectedConversation);

        const resumeCanDownload = message.messageType === 3 ? canDownloadResume(ext) : false;

        return (
          <div key={message.id}>
            {showDateTag ? (
              <div data-testid="chat-date-separator" className="flex justify-center my-2">
                <span className="rounded-full bg-white/78 px-3 py-1 text-[11px] text-on-surface-variant ring-1 ring-white/85 dark:bg-surface-container-high/70 dark:text-on-surface-variant dark:ring-white/10">{formatDateTag(message.createTime)}</span>
              </div>
            ) : null}
            <div className={`flex items-end gap-2 ${self ? 'justify-end' : 'justify-start'}`}>
              {!self ? <ChatAvatar name={senderName} imageUrl={peerAvatarUrl} testId="chat-message-avatar" /> : null}
              <div
                data-testid={self ? 'chat-message-bubble-self' : 'chat-message-bubble-peer'}
                className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-[0_8px_24px_rgba(15,23,42,0.08)] ${self ? 'bg-primary text-on-primary ring-1 ring-primary/10 dark:shadow-[0_8px_24px_rgba(0,0,0,0.28)]' : 'bg-white/85 text-on-surface ring-1 ring-white/80 dark:bg-surface-container-high/65 dark:ring-white/10'}`}
              >
                {message.messageType === 3 && ext ? (
                  <div className={`rounded-xl px-3 py-2 ${self ? 'bg-white/12 ring-1 ring-white/20 dark:bg-white/10 dark:ring-white/10' : 'bg-white/88 ring-1 ring-white/90 dark:bg-surface-container-highest/70 dark:ring-white/10'}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-xl leading-none">📄</span>
                      <div className="min-w-0">
                        <p className="font-bold">PDF简历</p>
                        <p className={`${self ? 'text-on-primary/90' : 'text-on-surface-variant'} truncate`}>
                          {String(ext.fileName ?? '未命名简历.pdf')}
                        </p>
                      </div>
                    </div>
                    {resumeCanDownload ? (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void onPreviewResume(message.conversationId, ext)}
                          disabled={resumeFileLoading}
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold disabled:opacity-60 ${self ? 'bg-white/90 text-primary dark:bg-white/85' : 'bg-surface-low text-on-surface dark:bg-surface-container-low dark:text-on-surface'}`}
                        >
                          {resumeFileLoading ? '处理中...' : '预览PDF'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDownloadResume(message.conversationId, ext)}
                          disabled={resumeFileLoading}
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold disabled:opacity-60 ${self ? 'bg-white text-primary dark:bg-white/90' : 'bg-primary text-on-primary'}`}
                        >
                          {resumeFileLoading ? '处理中...' : '下载PDF'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {message.messageType === 2 && ext ? (
                  <div>
                    {inlineImageUrls[message.id] ? (
                      <button
                        type="button"
                        className="block overflow-hidden rounded-lg"
                        onClick={() => void onPreviewImage(message.conversationId, message.id, ext)}
                      >
                        <img
                          src={inlineImageUrls[message.id]}
                          alt={String(ext.fileName ?? '图片预览')}
                          className="max-h-60 h-auto w-full max-w-full rounded-lg object-contain bg-black/10"
                        />
                      </button>
                    ) : inlineImageErrors[message.id] ? (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs opacity-90">{inlineImageErrors[message.id]}</p>
                        <button
                          type="button"
                          onClick={() => void onLoadInlineImage(message.conversationId, message.id)}
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${self ? 'bg-white text-primary dark:bg-white/90' : 'bg-primary text-on-primary'}`}
                        >
                          重试加载图片
                        </button>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs opacity-80">图片加载中...</p>
                    )}
                  </div>
                ) : null}
                {message.messageType === 4 && ext ? (
                  <div>
                    <p className="font-bold">面试通知</p>
                    <p>时间：{String(ext.interviewTime ?? '-')}</p>
                    <p>地点：{String(ext.location ?? '-')}</p>
                    <p>备注：{String(ext.remark ?? '')}</p>
                  </div>
                ) : null}
                {[2, 3, 4].includes(message.messageType) ? null : <p className="whitespace-pre-wrap">{message.content || ''}</p>}
              </div>
              {self ? <ChatAvatar name={senderName} imageUrl={currentAvatar} testId="chat-message-avatar" /> : null}
            </div>
          </div>
        );
      })}
      <div ref={messageEndRef} />
    </div>
  );
}
