'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { chatApi } from '@/lib/api/chat';
import { companyApi } from '@/lib/api/company';
import { publicApi } from '@/lib/api/public';
import { resumeApi, type Resume } from '@/lib/api/resume';
import { enterpriseAuthStore, userAuthStore } from '@/lib/stores/auth-store';
import type { ChatConversationSummary, ChatMessage } from '@/lib/types/chat';
import { CHAT_EMOJIS } from './emoji';
import type { ChatJobMeta, ChatWorkspaceProps } from './ChatTypes';

function parseExt(ext?: string | null): Record<string, unknown> | null {
  if (!ext) return null;
  try {
    return JSON.parse(ext) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function formatListTime(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}

function formatDateTag(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatSalaryByRange(min?: number | null, max?: number | null): string {
  if (min == null && max == null) {
    return '薪资面议';
  }
  const minK = min == null ? null : Math.round(min / 1000);
  const maxK = max == null ? null : Math.round(max / 1000);
  if (minK != null && maxK != null) {
    return `${minK}k-${maxK}k`;
  }
  if (minK != null) {
    return `${minK}k+`;
  }
  return `${maxK}k`;
}

function getDateKey(value?: string | null): string {
  if (!value) return '__unknown__';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function getUserDisplay(role: ChatWorkspaceProps['role'], item: ChatConversationSummary): string {
  if (role === 'enterprise') {
    return item.candidateName || `用户#${item.candidateUserId}`;
  }
  return item.recruiterName || `用户#${item.recruiterUserId}`;
}

type AuthStoreState = {
  user?: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string | null;
  } | null;
};

type AuthStoreLike = {
  getState?: () => AuthStoreState;
  subscribe?: (listener: (nextState: AuthStoreState) => void) => () => void;
} | ((selector?: (state: AuthStoreState) => unknown) => unknown);

function readAuthUser(store: AuthStoreLike): AuthStoreState['user'] {
  if (store && typeof store === 'object' && typeof store.getState === 'function') {
    return store.getState().user ?? null;
  }
  if (typeof store === 'function') {
    const anyStore = store as unknown as {
      getState?: () => AuthStoreState;
      (selector?: (state: AuthStoreState) => unknown): unknown;
    };
    if (typeof anyStore.getState === 'function') {
      return anyStore.getState().user ?? null;
    }
    const selected = anyStore((state) => state.user);
    return (selected as AuthStoreState['user']) ?? null;
  }
  return null;
}

function resolveInitialConversationId(
  list: ChatConversationSummary[],
  initialConversationId?: number | null,
): number | null {
  if (initialConversationId && list.some((item) => item.conversationId === initialConversationId)) {
    return initialConversationId;
  }
  if (list.length === 0) return null;
  return list[0].conversationId;
}

function Avatar({
  name,
  imageUrl,
  testId,
}: {
  name: string;
  imageUrl?: string | null;
  testId?: string;
}) {
  const initial = name.trim().slice(0, 1).toUpperCase() || '?';
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${name}头像`}
        data-testid={testId}
        className="h-9 w-9 rounded-full object-cover border border-surface-mid shrink-0"
      />
    );
  }
  return (
    <div
      data-testid={testId}
      className="h-9 w-9 rounded-full shrink-0 border border-surface-mid bg-surface-low text-on-surface font-bold text-sm flex items-center justify-center"
    >
      {initial}
    </div>
  );
}

function EmojiPanel({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
  return (
    <div
      data-testid="chat-emoji-panel"
      className="absolute bottom-14 left-0 z-20 w-64 rounded-xl border border-surface-mid bg-surface-lowest p-3 shadow-lg"
    >
      <div className="grid grid-cols-8 gap-2">
        {CHAT_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className="h-7 w-7 rounded-lg hover:bg-surface-low text-base leading-none"
            aria-label={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatWorkspace({
  role,
  title,
  conversationPathPrefix,
  jobPathBuilder,
  mobileMode,
  initialConversationId,
}: ChatWorkspaceProps) {
  const isUserRole = role === 'user';
  const activeAuthStore = (isUserRole ? userAuthStore : enterpriseAuthStore) as AuthStoreLike;
  const [authUser, setAuthUser] = useState(() => readAuthUser(activeAuthStore));
  const currentUserId = authUser?.id ?? null;
  const currentUserName = authUser?.displayName || authUser?.username || (isUserRole ? '求职者' : '招聘方');
  const currentAvatar = authUser?.avatarUrl ?? null;

  const [list, setList] = useState<ChatConversationSummary[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(initialConversationId ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [resumeSending, setResumeSending] = useState(false);
  const [imageSending, setImageSending] = useState(false);
  const [inviteSending, setInviteSending] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobMeta, setJobMeta] = useState<ChatJobMeta | null>(null);

  const [inviteTime, setInviteTime] = useState('');
  const [inviteLocation, setInviteLocation] = useState('');
  const [inviteRemark, setInviteRemark] = useState('');
  const [showInviteEditor, setShowInviteEditor] = useState(false);

  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAuthUser(readAuthUser(activeAuthStore));
    if (!activeAuthStore || typeof activeAuthStore !== 'object' || typeof activeAuthStore.subscribe !== 'function') {
      return;
    }
    const unsubscribe = activeAuthStore.subscribe((nextState) => {
      setAuthUser(nextState.user ?? null);
    });
    return unsubscribe;
  }, [activeAuthStore]);

  const selectedConversation = useMemo(
    () => list.find((item) => item.conversationId === selectedConversationId) ?? null,
    [list, selectedConversationId],
  );

  const shouldShowDetail = useMemo(() => {
    if (mobileMode === 'detail') {
      return selectedConversationId != null;
    }
    return true;
  }, [mobileMode, selectedConversationId]);

  useEffect(() => {
    let active = true;
    void (async () => {
      setLoadingList(true);
      setError(null);
      try {
        const conversations = await chatApi.listConversations();
        if (!active) return;
        const items = conversations ?? [];
        setList(items);
        setSelectedConversationId((prev) => prev ?? resolveInitialConversationId(items, initialConversationId));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : '会话加载失败');
      } finally {
        if (active) {
          setLoadingList(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [initialConversationId]);

  useEffect(() => {
    if (!isUserRole) return;
    let active = true;
    void (async () => {
      try {
        const data = await resumeApi.getMyResumes();
        if (!active) return;
        setResumes(data ?? []);
      } catch {
        if (!active) return;
        setResumes([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [isUserRole]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    let active = true;
    void (async () => {
      setLoadingMessages(true);
      setError(null);
      try {
        const data = await chatApi.listMessages(selectedConversationId, { pageSize: 100 });
        if (!active) return;
        const next = (data ?? []).slice().reverse();
        setMessages(next);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : '消息加载失败');
      } finally {
        if (active) {
          setLoadingMessages(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedConversationId]);

  useEffect(() => {
    if (!selectedConversation) {
      setJobMeta(null);
      return;
    }

    const fallback: ChatJobMeta = {
      ownerName: selectedConversation.recruiterName || null,
      companyName: selectedConversation.companyName || null,
      jobTitle: selectedConversation.jobTitle || `岗位 #${selectedConversation.jobId}`,
      salaryText: null,
      locationText: null,
    };

    let active = true;
    setJobMeta(fallback);

    void (async () => {
      try {
        if (isUserRole) {
          const job = await publicApi.jobs.getById(selectedConversation.jobId);
          if (!active) return;
          setJobMeta({
            ownerName: selectedConversation.recruiterName || null,
            companyName: job.companyName || selectedConversation.companyName || null,
            jobTitle: job.title || selectedConversation.jobTitle || `岗位 #${selectedConversation.jobId}`,
            salaryText: formatSalaryByRange(job.salaryMin, job.salaryMax),
            locationText: [job.city, job.district].filter(Boolean).join(' · ') || null,
          });
          return;
        }

        const job = await companyApi.getJobDetail(selectedConversation.jobId);
        if (!active) return;
        setJobMeta({
          ownerName: selectedConversation.recruiterName || null,
          companyName: selectedConversation.companyName || null,
          jobTitle: job.title || selectedConversation.jobTitle || `岗位 #${selectedConversation.jobId}`,
          salaryText: formatSalaryByRange(job.salaryRange?.min, job.salaryRange?.max),
          locationText: [job.location?.city, job.location?.district].filter(Boolean).join(' · ') || null,
        });
      } catch {
        if (!active) return;
        setJobMeta(fallback);
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedConversation, isUserRole]);

  useEffect(() => {
    if (messages.length === 0 || !currentUserId || !selectedConversationId) return;
    const inbound = messages.find((item) => item.receiverUserId === currentUserId);
    if (!inbound) return;
    void chatApi.markRead({ conversationId: selectedConversationId, readUpToMessageId: inbound.id });
  }, [messages, currentUserId, selectedConversationId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const refreshMessages = async () => {
    if (!selectedConversationId) return;
    const data = await chatApi.listMessages(selectedConversationId, { pageSize: 100 });
    setMessages((data ?? []).slice().reverse());
  };

  const handleSendText = async () => {
    if (!selectedConversationId) return;
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setError(null);
    try {
      await chatApi.sendText({ conversationId: selectedConversationId, content });
      setInput('');
      await refreshMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败');
    } finally {
      setSending(false);
    }
  };

  const handleSendResume = async () => {
    if (!selectedConversationId || resumeSending || !isUserRole) return;
    const defaultResume = resumes.find((item) => item.isDefault) ?? resumes[0] ?? null;
    if (!defaultResume) {
      setError('暂无简历可发送');
      return;
    }

    setResumeSending(true);
    setError(null);
    try {
      await chatApi.sendResume({ conversationId: selectedConversationId, resumeId: defaultResume.id });
      await refreshMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送简历失败');
    } finally {
      setResumeSending(false);
    }
  };

  const handleSendImage = async (file: File | null) => {
    if (!file || !selectedConversationId || imageSending) return;
    setImageSending(true);
    setError(null);
    try {
      await chatApi.sendImage(selectedConversationId, file);
      await refreshMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送图片失败');
    } finally {
      setImageSending(false);
    }
  };

  const handleSendInterview = async () => {
    if (isUserRole || !selectedConversationId || inviteSending) return;
    if (!inviteTime.trim() || !inviteLocation.trim()) {
      setError('请填写面试时间和面试地点');
      return;
    }
    setInviteSending(true);
    setError(null);
    try {
      await chatApi.sendInterviewInvite({
        conversationId: selectedConversationId,
        interviewTime: inviteTime,
        location: inviteLocation,
        remark: inviteRemark,
      });
      setInviteTime('');
      setInviteLocation('');
      setInviteRemark('');
      setShowInviteEditor(false);
      await refreshMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送面试通知失败');
    } finally {
      setInviteSending(false);
    }
  };

  const jobHref = selectedConversation ? jobPathBuilder(selectedConversation.jobId) : '#';

  const hasDefaultResume = useMemo(() => {
    if (!isUserRole) return false;
    return resumes.length > 0;
  }, [isUserRole, resumes]);

  return (
    <section data-testid="chat-workspace" className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6 md:py-6">
      <h1 className="text-2xl font-black text-on-surface mb-4">{title}</h1>
      {error ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

      <div
        data-testid="chat-desktop-layout"
        className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-4 md:h-[calc(100vh-220px)] min-h-[560px]"
      >
        {(mobileMode === 'list' || mobileMode === 'detail') ? (
          <aside className={`rounded-2xl border border-surface-mid bg-surface-lowest overflow-hidden ${mobileMode === 'detail' ? 'hidden md:block' : ''}`}>
            <div className="h-12 px-4 border-b border-surface-mid flex items-center text-sm text-on-surface-variant">会话列表</div>
            <div className="h-full overflow-y-auto p-2 space-y-2">
              {loadingList ? <div className="px-3 py-4 text-sm text-on-surface-variant">会话加载中...</div> : null}
              {!loadingList && list.length === 0 ? (
                <div className="rounded-xl border border-dashed border-surface-mid px-4 py-10 text-center text-sm text-on-surface-variant">暂无会话</div>
              ) : null}

              {list.map((item) => {
                const selected = item.conversationId === selectedConversationId;
                return (
                  <button
                    key={item.conversationId}
                    type="button"
                    onClick={() => setSelectedConversationId(item.conversationId)}
                    className={`w-full text-left rounded-xl border px-3 py-3 transition-colors ${selected ? 'border-primary/40 bg-primary/5' : 'border-surface-mid bg-surface-lowest hover:border-primary/20'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">{item.jobTitle || `岗位 #${item.jobId}`}</p>
                        <p className="text-xs text-on-surface-variant truncate">{isUserRole ? item.companyName || '未知企业' : `候选人：${item.candidateName || `用户#${item.candidateUserId}`}`}</p>
                        <p className="mt-1 text-xs text-on-surface-variant line-clamp-1">{item.lastMessagePreview || '暂无消息'}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[11px] text-outline">{formatListTime(item.lastMessageTime)}</p>
                        {item.unreadCount > 0 ? (
                          <span className="inline-flex mt-1 min-w-5 h-5 px-1 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
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
        ) : null}

        <div className={`${mobileMode === 'detail' && !shouldShowDetail ? 'hidden md:flex' : 'flex'} min-h-0 flex-col rounded-2xl border border-surface-mid bg-surface-lowest overflow-hidden`}>
          {selectedConversation ? (
            <>
              <header className="border-b border-surface-mid px-4 py-3 bg-surface-low">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-on-surface-variant">岗位负责人</p>
                    <p className="text-base font-bold text-on-surface truncate">{jobMeta?.ownerName || selectedConversation.recruiterName || '招聘负责人'}</p>
                    <p className="text-sm text-on-surface-variant truncate">{jobMeta?.companyName || selectedConversation.companyName || '未知企业'}</p>
                  </div>
                  <Link href={jobHref} className="shrink-0 rounded-lg border border-primary/40 px-3 py-1.5 text-sm font-bold text-primary hover:bg-primary/5">查看职位</Link>
                </div>
                <div className="mt-2 rounded-xl bg-surface-lowest border border-surface-mid px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-semibold text-on-surface">{jobMeta?.jobTitle || selectedConversation.jobTitle || `岗位 #${selectedConversation.jobId}`}</span>
                  <span className="text-primary font-bold">{jobMeta?.salaryText || '薪资面议'}</span>
                  <span className="text-on-surface-variant">{jobMeta?.locationText || '地点待补充'}</span>
                </div>
              </header>

              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
                {loadingMessages ? <div className="text-sm text-on-surface-variant">消息加载中...</div> : null}
                {!loadingMessages && messages.length === 0 ? <div className="text-sm text-on-surface-variant">暂无消息</div> : null}

                {messages.map((message, index) => {
                  const self = currentUserId != null && message.senderUserId === currentUserId;
                  const ext = parseExt(message.ext);
                  const currentDateKey = getDateKey(message.createTime);
                  const prevDateKey = index > 0 ? getDateKey(messages[index - 1].createTime) : null;
                  const showDateTag = index === 0 || currentDateKey !== prevDateKey;
                  const senderName = self ? currentUserName : getUserDisplay(role, selectedConversation);

                  return (
                    <div key={message.id}>
                      {showDateTag ? (
                        <div data-testid="chat-date-separator" className="flex justify-center my-2">
                          <span className="rounded-full bg-surface-low px-3 py-1 text-[11px] text-on-surface-variant">{formatDateTag(message.createTime)}</span>
                        </div>
                      ) : null}
                      <div className={`flex items-end gap-2 ${self ? 'justify-end' : 'justify-start'}`}>
                        {!self ? <Avatar name={senderName} testId="chat-message-avatar" /> : null}
                        <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${self ? 'bg-primary text-white' : 'bg-surface-low text-on-surface'}`}>
                          {message.messageType === 3 && ext ? (
                            <div>
                              <p className="font-bold">简历卡片</p>
                              <p className="opacity-90">{String(ext.fileName ?? '未命名简历')}</p>
                            </div>
                          ) : null}
                          {message.messageType === 2 && ext ? (
                            <div>
                              <p className="font-bold">图片消息</p>
                              <p className="opacity-90">{String(ext.fileName ?? '图片')}</p>
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
                        {self ? <Avatar name={senderName} imageUrl={currentAvatar} testId="chat-message-avatar" /> : null}
                      </div>
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>

              <footer className="border-t border-surface-mid px-4 py-3">
                <div className="flex items-center gap-2 mb-2 relative">
                  <button
                    type="button"
                    data-testid="chat-emoji-button"
                    onClick={() => setShowEmojiPanel((prev) => !prev)}
                    className="h-9 w-9 rounded-lg border border-surface-mid text-on-surface-variant hover:bg-surface-low"
                    aria-label="表情"
                  >
                    😀
                  </button>
                  {showEmojiPanel ? <EmojiPanel onSelect={(emoji) => { setInput((prev) => `${prev}${emoji}`); setShowEmojiPanel(false); }} /> : null}

                  <label className="h-9 w-9 rounded-lg border border-surface-mid text-on-surface-variant hover:bg-surface-low inline-flex items-center justify-center cursor-pointer" aria-label="图片">
                    🖼
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        void handleSendImage(file);
                        event.currentTarget.value = '';
                      }}
                    />
                  </label>

                  {isUserRole ? (
                    <button
                      type="button"
                      onClick={() => void handleSendResume()}
                      disabled={!hasDefaultResume || resumeSending}
                      className="h-9 px-3 rounded-lg border border-primary text-primary text-sm font-bold disabled:opacity-60"
                    >
                      {resumeSending ? '发送中...' : '发送简历'}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowInviteEditor((prev) => !prev)}
                        className="h-9 px-3 rounded-lg border border-primary text-primary text-sm font-bold"
                      >
                        {showInviteEditor ? '收起通知' : '面试通知'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSendInterview()}
                        disabled={inviteSending}
                        className="h-9 px-3 rounded-lg border border-primary text-primary text-sm font-bold disabled:opacity-60"
                      >
                        {inviteSending ? '发送中...' : '发送通知'}
                      </button>
                    </>
                  )}
                </div>

                {!isUserRole && showInviteEditor ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <input value={inviteTime} onChange={(event) => setInviteTime(event.target.value)} placeholder="面试时间（必填） 2026-05-10T15:00:00" className="h-9 rounded-lg border border-surface-mid px-3 text-sm bg-transparent" />
                    <input value={inviteLocation} onChange={(event) => setInviteLocation(event.target.value)} placeholder="面试地点" className="h-9 rounded-lg border border-surface-mid px-3 text-sm bg-transparent" />
                    <input value={inviteRemark} onChange={(event) => setInviteRemark(event.target.value)} placeholder="面试备注" className="h-9 rounded-lg border border-surface-mid px-3 text-sm bg-transparent" />
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="输入消息..."
                    className="flex-1 h-10 rounded-xl border border-surface-mid px-3 text-sm bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSendText()}
                    disabled={sending}
                    className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-60"
                  >
                    {sending ? '发送中...' : '发送'}
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-on-surface-variant">请选择会话</div>
          )}
        </div>
      </div>

      <div className="hidden">
        {list.map((item) => (
          <Link key={item.conversationId} href={`${conversationPathPrefix}/${item.conversationId}`}>{item.jobTitle || '会话'}</Link>
        ))}
      </div>
    </section>
  );
}
