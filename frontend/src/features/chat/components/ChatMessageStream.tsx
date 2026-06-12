import type { ChatConversationSummary, ChatMessage } from '@/lib/types/chat';
import { ChatAvatar } from './ChatAvatar';

/** ISO 或类 ISO 时间字符串格式化为 "YYYY/MM/DD HH:mm" */
function formatInterviewTime(raw?: unknown): string {
  if (!raw) return '-';
  const str = String(raw);
  try {
    const d = new Date(str);
    if (Number.isNaN(d.getTime())) return str;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return str;
  }
}

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
    <div data-testid="chat-message-scroll-container" className="chat-scrollbar flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-surface-container/55 to-surface-container-low/25 dark:from-surface-container/45 dark:to-transparent">
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
        const isResumeMessage = message.messageType === 3 && !!ext;
        const isImageMessage = message.messageType === 2 && !!ext;
        const isInterviewMessage = message.messageType === 4 && !!ext;
        const useFlatMessageContainer = isResumeMessage || isImageMessage || isInterviewMessage;

        return (
          <div key={message.id}>
            {showDateTag ? (
              <div data-testid="chat-date-separator" className="flex justify-center my-2">
                <span className="rounded-full bg-surface-container px-3 py-1 text-[11px] text-on-surface-variant ring-1 ring-outline-variant/55">{formatDateTag(message.createTime)}</span>
              </div>
            ) : null}
            <div className={`flex items-end gap-2 ${self ? 'justify-end' : 'justify-start'}`}>
              {!self ? <ChatAvatar name={senderName} imageUrl={peerAvatarUrl} testId="chat-message-avatar" /> : null}
              {/* 简历消息不再套外层气泡框，避免出现双层边框。 */}
              <div
                data-testid={self ? 'chat-message-bubble-self' : 'chat-message-bubble-peer'}
                className={`max-w-[78%] text-sm ${useFlatMessageContainer ? '' : `rounded-2xl px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.08)] ${self ? 'bg-primary text-on-primary ring-1 ring-primary/10 dark:shadow-[0_8px_24px_rgba(0,0,0,0.28)]' : 'bg-surface-container text-on-surface ring-1 ring-outline-variant/55'}`}`}
              >
                {message.messageType === 3 && ext ? (
                  <div className={`rounded-xl px-3 py-2 ${self ? 'bg-primary/20 ring-1 ring-primary/25 dark:bg-primary/25 dark:ring-primary/30' : 'bg-surface-container-high ring-1 ring-outline-variant/55'}`}>
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
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold disabled:opacity-60 ${self ? 'bg-surface-container-lowest text-primary dark:bg-surface-container-high dark:text-on-surface' : 'bg-surface-low text-on-surface dark:bg-surface-container-low dark:text-on-surface'}`}
                        >
                          {resumeFileLoading ? '处理中...' : '预览PDF'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDownloadResume(message.conversationId, ext)}
                          disabled={resumeFileLoading}
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold disabled:opacity-60 ${self ? 'bg-surface-container-lowest text-primary dark:bg-surface-container-high dark:text-on-surface' : 'bg-primary text-on-primary'}`}
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
                        className={`block w-[13rem] max-w-[52vw] overflow-hidden rounded-xl md:w-[14rem] ${self ? 'ring-1 ring-primary/25' : 'ring-1 ring-outline-variant/55'}`}
                        onClick={() => void onPreviewImage(message.conversationId, message.id, ext)}
                      >
                        <img
                          src={inlineImageUrls[message.id]}
                          alt={String(ext.fileName ?? '图片预览')}
                          className="block h-auto max-h-60 w-full object-cover"
                        />
                      </button>
                    ) : inlineImageErrors[message.id] ? (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs opacity-90">{inlineImageErrors[message.id]}</p>
                        <button
                          type="button"
                          onClick={() => void onLoadInlineImage(message.conversationId, message.id)}
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${self ? 'bg-surface-container-lowest text-primary dark:bg-surface-container-high dark:text-on-surface' : 'bg-primary text-on-primary'}`}
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
                  <InterviewNoticeCard ext={ext} self={self} />
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

/** 面试通知专属卡片：区分发送方/接收方配色，带图标和格式化时间 */
function InterviewNoticeCard({
  ext,
  self,
}: {
  ext: Record<string, unknown>;
  self: boolean;
}) {
  const rows: { icon: string; label: string; value: string }[] = [
    { icon: '🕐', label: '时间', value: formatInterviewTime(ext.interviewTime) },
    { icon: '📍', label: '地点', value: ext.location ? String(ext.location) : '-' },
  ];
  const remark = ext.remark ? String(ext.remark) : '';

  return (
    <div
      className={`w-64 overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.12)] ring-1 ${
        self
          ? 'bg-primary ring-primary/20 text-on-primary'
          : 'bg-surface-container-high ring-outline-variant/55 text-on-surface'
      }`}
    >
      {/* 标题栏 */}
      <div
        className={`flex items-center gap-2 px-4 py-3 border-b ${
          self
            ? 'border-white/15 bg-white/10'
            : 'border-outline-variant/40 bg-surface-container-highest/60'
        }`}
      >
        <span className="text-base leading-none">📋</span>
        <span className="text-sm font-black tracking-wide">面试通知</span>
      </div>

      {/* 内容行 */}
      <div className="px-4 py-3 space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 shrink-0 text-base leading-none">{row.icon}</span>
            <div className="min-w-0">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  self ? 'text-on-primary/60' : 'text-on-surface-variant'
                }`}
              >
                {row.label}
              </span>
              <p className="font-bold leading-snug break-words">{row.value}</p>
            </div>
          </div>
        ))}

        {/* 备注（有内容才显示） */}
        {remark ? (
          <div
            className={`mt-1 rounded-xl px-3 py-2 text-xs leading-relaxed ${
              self ? 'bg-white/10 text-on-primary/90' : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {remark}
          </div>
        ) : null}
      </div>
    </div>
  );
}
