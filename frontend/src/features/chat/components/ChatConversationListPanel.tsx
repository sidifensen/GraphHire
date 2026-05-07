import { ChatAvatar } from './ChatAvatar';
import type { ChatConversationSummary } from '@/lib/types/chat';

type ChatConversationListPanelProps = {
  mobileMode: 'list' | 'detail';
  loadingList: boolean;
  filteredList: ChatConversationSummary[];
  selectedConversationId: number | null;
  conversationKeyword: string;
  onKeywordChange: (value: string) => void;
  onSelectConversation: (conversationId: number) => void;
  isUserRole: boolean;
  buildPersonAvatarUrl: (userId: number) => string;
  conversationOwnerAvatarMap: Record<number, string | null>;
  formatListTime: (value?: string | null) => string;
  normalizeCandidateDisplayName: (item: ChatConversationSummary) => string;
};

export function ChatConversationListPanel({
  mobileMode,
  loadingList,
  filteredList,
  selectedConversationId,
  conversationKeyword,
  onKeywordChange,
  onSelectConversation,
  isUserRole,
  buildPersonAvatarUrl,
  conversationOwnerAvatarMap,
  formatListTime,
  normalizeCandidateDisplayName,
}: ChatConversationListPanelProps) {
  return (
    <aside
      data-testid="chat-conversation-list-panel"
      className={`chat-frosted-list-panel rounded-none md:rounded-3xl bg-white/72 backdrop-blur-xl ring-1 ring-white/70 shadow-[0_18px_45px_rgba(15,23,42,0.10)] overflow-hidden dark:bg-surface-container-low/80 dark:ring-white/10 dark:shadow-[0_18px_45px_rgba(0,0,0,0.35)] ${mobileMode === 'detail' ? 'hidden md:block' : ''}`}
    >
      <div className="h-12 px-3 border-b border-white/70 flex items-center bg-white/50 dark:border-white/10 dark:bg-white/5">
        <input
          value={conversationKeyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="搜索会话..."
          className="h-9 w-full rounded-xl bg-white/75 px-3 text-sm text-on-surface outline-none ring-1 ring-white/80 focus:ring-2 focus:ring-primary/30 dark:bg-surface-container-high/60 dark:ring-white/10 dark:placeholder:text-on-surface-variant"
        />
      </div>
      <div className="h-full overflow-y-auto p-2.5 space-y-2.5">
        {loadingList ? <div className="px-3 py-4 text-sm text-on-surface-variant dark:text-on-surface-variant">会话加载中...</div> : null}
        {!loadingList && filteredList.length === 0 ? (
          <div className="rounded-2xl bg-white/60 px-4 py-10 text-center text-sm text-on-surface-variant ring-1 ring-white/80 dark:bg-surface-container-high/50 dark:ring-white/10">暂无会话</div>
        ) : null}

        {filteredList.map((item) => {
          const selected = item.conversationId === selectedConversationId;
          const ownerAvatarUrl = conversationOwnerAvatarMap[item.conversationId]
            ?? (isUserRole ? null : (item.candidateUserId ? buildPersonAvatarUrl(item.candidateUserId) : null));
          const candidateDisplay = normalizeCandidateDisplayName(item);
          return (
            <button
              key={item.conversationId}
              type="button"
              onClick={() => onSelectConversation(item.conversationId)}
              className={`group relative w-full overflow-hidden rounded-2xl px-3 py-3 text-left transition-all duration-150 ${selected ? 'bg-white/92 shadow-[0_12px_30px_rgba(37,99,235,0.18)] dark:bg-surface-container-high/70 dark:shadow-[0_12px_30px_rgba(0,0,0,0.32)]' : 'bg-white/62 hover:bg-white/84 hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] dark:bg-surface-container-low/40 dark:hover:bg-surface-container-high/55 dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]'}`}
            >
              <span className={`absolute inset-y-2 left-0 w-1 rounded-full transition-colors ${selected ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/35'}`} />
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex items-start gap-2">
                  <ChatAvatar
                    name={isUserRole ? (item.recruiterName || '负责人') : candidateDisplay}
                    imageUrl={ownerAvatarUrl}
                    testId="chat-conversation-owner-avatar"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface line-clamp-2">{item.jobTitle || `岗位 #${item.jobId}`}</p>
                    <p className="text-xs text-on-surface-variant line-clamp-2">{isUserRole ? item.companyName || '未知企业' : candidateDisplay}</p>
                    <p className="mt-1 text-xs text-on-surface-variant line-clamp-1">{item.lastMessagePreview || '暂无消息'}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] text-outline dark:text-outline">{formatListTime(item.lastMessageTime)}</p>
                  {item.unreadCount > 0 ? (
                    <span className="inline-flex mt-1 min-w-5 h-5 px-1 items-center justify-center rounded-full bg-primary text-on-primary text-[10px] font-bold shadow-[0_4px_12px_rgba(37,99,235,0.4)]">
                      {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
