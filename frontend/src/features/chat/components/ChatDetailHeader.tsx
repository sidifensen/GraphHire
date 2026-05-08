import Link from 'next/link';
import type { ChatConversationSummary } from '@/lib/types/chat';
import type { ChatJobMeta } from './ChatTypes';
import { ChatAvatar } from './ChatAvatar';

type ChatDetailHeaderProps = {
  mobileMode: 'list' | 'detail';
  isUserRole: boolean;
  selectedConversation: ChatConversationSummary;
  conversationPathPrefix: string;
  peerAvatarUrl: string | null;
  conversationOwnerAvatarMap: Record<number, string | null>;
  buildPersonAvatarUrl: (userId: number) => string;
  normalizeCandidateDisplayName: (item: ChatConversationSummary) => string;
  formatGender: (gender?: number | null) => string;
  jobMeta: ChatJobMeta | null;
  jobHref: string;
};

export function ChatDetailHeader({
  mobileMode,
  isUserRole,
  selectedConversation,
  conversationPathPrefix,
  peerAvatarUrl,
  conversationOwnerAvatarMap,
  buildPersonAvatarUrl,
  normalizeCandidateDisplayName,
  formatGender,
  jobMeta,
  jobHref,
}: ChatDetailHeaderProps) {
  const candidateDisplayName = normalizeCandidateDisplayName(selectedConversation);
  const headerOwnerAvatarUrl = isUserRole
    ? (peerAvatarUrl ?? conversationOwnerAvatarMap[selectedConversation.conversationId] ?? null)
    : (selectedConversation.candidateUserId ? buildPersonAvatarUrl(selectedConversation.candidateUserId) : null);

  return (
    <header data-testid="chat-detail-header" className="shrink-0 border-b border-surface-container-highest px-4 py-3 bg-surface-container-low/80 backdrop-blur-xl dark:border-outline-variant/70 dark:bg-surface-container-low/75">
      {mobileMode === 'detail' ? (
        <div className="mb-2 md:hidden">
          <Link
            data-testid="chat-mobile-back-button"
            href={conversationPathPrefix}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary shadow-sm transition-colors hover:bg-primary/15 dark:border-primary/55 dark:bg-primary/20 dark:text-on-surface dark:hover:bg-primary/30"
          >
            <span aria-hidden="true" className="text-sm leading-none">←</span>
            <span>返回会话列表</span>
          </Link>
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-start gap-2">
          <ChatAvatar
            name={isUserRole ? (selectedConversation.recruiterName || '负责人') : candidateDisplayName}
            imageUrl={headerOwnerAvatarUrl}
            testId="chat-header-owner-avatar"
          />
          <div className="min-w-0">
            {isUserRole ? (
              <>
                <p className="text-sm text-on-surface-variant">岗位负责人</p>
                <p className="text-base font-bold text-on-surface truncate">{jobMeta?.ownerName || selectedConversation.recruiterName || '招聘负责人'}</p>
                <p className="text-sm text-on-surface-variant truncate">{jobMeta?.companyName || selectedConversation.companyName || '未知企业'}</p>
              </>
            ) : (
              <>
                <p className="text-base font-bold text-on-surface line-clamp-2">{candidateDisplayName}</p>
                <p className="text-sm text-on-surface-variant truncate">{selectedConversation.candidateEmail || '邮箱未填写'}</p>
                <p className="text-xs text-on-surface-variant">
                  {`年龄：${selectedConversation.candidateAge ?? '未填写'} · 性别：${formatGender(selectedConversation.candidateGender)} · 学历：${selectedConversation.candidateEducation || '未填写'}`}
                </p>
              </>
            )}
          </div>
        </div>
        <Link href={jobHref} className="shrink-0 rounded-xl bg-surface-container px-3 py-1.5 text-sm font-bold text-primary shadow-sm ring-1 ring-primary/20 transition-colors hover:bg-surface-container-high dark:bg-surface-container-high/70 dark:text-on-surface dark:ring-outline-variant/55 dark:hover:bg-surface-container-high">
          查看职位
        </Link>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-surface-container-high/70 px-3 py-2 text-sm ring-1 ring-surface-container-highest dark:bg-surface-container-high/55 dark:ring-outline-variant/55">
        <span className="font-semibold text-on-surface">{jobMeta?.jobTitle || selectedConversation.jobTitle || `岗位 #${selectedConversation.jobId}`}</span>
        <span className="text-primary font-bold">{jobMeta?.salaryText || '薪资面议'}</span>
        <span className="text-on-surface-variant">{jobMeta?.locationText || '地点待补充'}</span>
      </div>
    </header>
  );
}
