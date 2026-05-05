'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Images } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { chatApi } from '@/lib/api/chat';
import { companyApi } from '@/lib/api/company';
import { publicApi } from '@/lib/api/public';
import { resumeApi, type Resume } from '@/lib/api/resume';
import { enterpriseAuthStore, userAuthStore } from '@/lib/stores/auth-store';
import type { ChatConversationSummary, ChatMessage } from '@/lib/types/chat';
import { getApiBaseUrl } from '@/lib/api/base-url';
import { CHAT_EMOJI_CATEGORIES } from './emoji';
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

const API_BASE_URL = getApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

function buildPersonAvatarUrl(userId: number): string {
  return `${API_BASE_URL}/person/avatar/public/${userId}`;
}

function toAbsoluteAssetUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `${window.location.protocol}${url}`;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function getUserDisplay(role: ChatWorkspaceProps['role'], item: ChatConversationSummary): string {
  if (role === 'enterprise') {
    return item.candidateName || `用户#${item.candidateUserId}`;
  }
  return item.recruiterName || `用户#${item.recruiterUserId}`;
}

function normalizeCandidateDisplayName(item: ChatConversationSummary): string {
  const raw = (item.candidateName || '').trim();
  if (!raw) return `用户#${item.candidateUserId}`;
  return raw;
}

function formatGender(gender?: number | null): string {
  if (gender === 1) return '男';
  if (gender === 2) return '女';
  return '未填写';
}

function getConversationOwnerAvatarUrl(item: ChatConversationSummary): string | null {
  if (!item.recruiterUserId) return null;
  return buildPersonAvatarUrl(item.recruiterUserId);
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
        className="h-9 w-9 rounded-full object-cover border border-outline/20 shrink-0"
      />
    );
  }
  return (
    <div
      data-testid={testId}
      className="h-9 w-9 rounded-full shrink-0 border border-outline/20 bg-surface-low text-on-surface font-bold text-sm flex items-center justify-center"
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
      className="absolute bottom-14 left-0 z-20 w-[430px] rounded-xl border border-outline/20 bg-surface-lowest p-3 shadow-lg"
    >
      <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-1" data-testid="chat-emoji-category-tabs">
        {CHAT_EMOJI_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-pressed={activeCategory?.id === category.id}
            onClick={() => setActiveCategoryId(category.id)}
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${
              activeCategory?.id === category.id
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-outline/20 text-on-surface-variant hover:bg-surface-low'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div
        data-testid="chat-emoji-scroll-region"
        className="h-64 overflow-y-auto rounded-lg border border-outline/10 bg-surface-low p-2"
      >
        <div className="grid grid-cols-10 gap-2">
          {pageEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
              className="h-7 w-7 rounded-lg hover:bg-surface-lowest text-base leading-none"
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
            className="rounded-md border border-outline/20 px-2 py-0.5 font-bold disabled:opacity-40"
          >
            上一页
          </button>
          <button
            type="button"
            aria-label="下一页表情"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-outline/20 px-2 py-0.5 font-bold disabled:opacity-40"
          >
            下一页
          </button>
        </div>
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
  const router = useRouter();
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
  const [conversationKeyword, setConversationKeyword] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [resumeSending, setResumeSending] = useState(false);
  const [resumeFileLoading, setResumeFileLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>('');
  const [previewKind, setPreviewKind] = useState<'pdf' | 'image'>('pdf');
  const [inlineImageUrls, setInlineImageUrls] = useState<Record<number, string>>({});
  const [inlineImageErrors, setInlineImageErrors] = useState<Record<number, string>>({});
  const [imageSending, setImageSending] = useState(false);
  const [inviteSending, setInviteSending] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobMeta, setJobMeta] = useState<ChatJobMeta | null>(null);
  const [peerAvatarUrl, setPeerAvatarUrl] = useState<string | null>(null);
  const [conversationOwnerAvatarMap, setConversationOwnerAvatarMap] = useState<Record<number, string | null>>({});

  const [inviteTime, setInviteTime] = useState('');
  const [inviteLocation, setInviteLocation] = useState('');
  const [inviteRemark, setInviteRemark] = useState('');
  const [showInviteEditor, setShowInviteEditor] = useState(false);
  const [lastReadRefreshKey, setLastReadRefreshKey] = useState(0);

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const conversationListLoadedRef = useRef(false);

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
  const normalizedConversationKeyword = conversationKeyword.trim().toLowerCase();
  const filteredList = useMemo(() => {
    if (!normalizedConversationKeyword) {
      return list;
    }
    return list.filter((item) => {
      const fields = [
        item.jobTitle,
        item.companyName,
        item.recruiterName,
        item.candidateName,
        item.lastMessagePreview,
      ];
      return fields.some((field) => field?.toLowerCase().includes(normalizedConversationKeyword));
    });
  }, [list, normalizedConversationKeyword]);

  const shouldShowDetail = useMemo(() => {
    if (mobileMode === 'detail') {
      return selectedConversationId != null;
    }
    return true;
  }, [mobileMode, selectedConversationId]);

  useEffect(() => {
    let active = true;
    const shouldShowBlockingLoading = !conversationListLoadedRef.current;
    void (async () => {
      if (shouldShowBlockingLoading) {
        setLoadingList(true);
      }
      setError(null);
      try {
        const conversations = await chatApi.listConversations();
        if (!active) return;
        const items = conversations ?? [];
        setList(items);
        conversationListLoadedRef.current = true;
        setSelectedConversationId((prev) => prev ?? resolveInitialConversationId(items, initialConversationId));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : '会话加载失败');
      } finally {
        if (active && shouldShowBlockingLoading) {
          setLoadingList(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [initialConversationId, lastReadRefreshKey]);

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
    if (!selectedConversation) {
      setPeerAvatarUrl(null);
      return;
    }
    if (isUserRole) {
      // 用户端优先展示企业头像；头像地址在职位/公司信息中获取，先清空避免误打 person 头像地址。
      setPeerAvatarUrl(null);
      return;
    }
    const peerUserId = selectedConversation.candidateUserId;
    if (!peerUserId) {
      setPeerAvatarUrl(null);
      return;
    }
    setPeerAvatarUrl(buildPersonAvatarUrl(peerUserId));
  }, [selectedConversation, isUserRole]);

  useEffect(() => {
    if (!isUserRole) {
      return;
    }
    let cancelled = false;
    if (list.length === 0) {
      setConversationOwnerAvatarMap((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    void (async () => {
      const entries = await Promise.all(
        list.map(async (item): Promise<[number, string | null]> => {
          try {
            const job = await publicApi.jobs.getById(item.jobId);
            const fromJob = toAbsoluteAssetUrl(job.companyAvatarUrl);
            if (fromJob) return [item.conversationId, fromJob];
            if (item.companyId) {
              try {
                const company = await publicApi.companies.getById(item.companyId);
                return [item.conversationId, toAbsoluteAssetUrl(company.avatarUrl)];
              } catch {
                return [item.conversationId, null];
              }
            }
            return [item.conversationId, null];
          } catch {
            return [item.conversationId, null];
          }
        }),
      );
      if (cancelled) return;
      setConversationOwnerAvatarMap((prev) => {
        const next = Object.fromEntries(entries) as Record<number, string | null>;
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);
        if (prevKeys.length !== nextKeys.length) {
          return next;
        }
        for (const key of nextKeys) {
          const conversationId = Number(key);
          if (prev[conversationId] !== next[conversationId]) {
            return next;
          }
        }
        return prev;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [list, isUserRole]);

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
          const jobAvatarUrl = toAbsoluteAssetUrl(job.companyAvatarUrl);
          if (jobAvatarUrl) {
            setPeerAvatarUrl(jobAvatarUrl);
          } else if (selectedConversation.companyId) {
            try {
              const company = await publicApi.companies.getById(selectedConversation.companyId);
              if (!active) return;
              setPeerAvatarUrl(toAbsoluteAssetUrl(company.avatarUrl));
            } catch {
              if (!active) return;
              setPeerAvatarUrl(null);
            }
          }
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
    const latestInboundMessageId = messages.reduce((maxId, item) => {
      if (item.receiverUserId !== currentUserId) {
        return maxId;
      }
      return item.id > maxId ? item.id : maxId;
    }, 0);
    if (latestInboundMessageId <= 0) return;
    void (async () => {
      await chatApi.markRead({ conversationId: selectedConversationId, readUpToMessageId: latestInboundMessageId });
      setList((prev) =>
        prev.map((item) =>
          item.conversationId === selectedConversationId ? { ...item, unreadCount: 0 } : item,
        ),
      );
      setLastReadRefreshKey((prev) => prev + 1);
    })();
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

  const fetchResumeBlob = async (conversationId: number, ext: Record<string, unknown> | null) => {
    const resumeId = Number(ext?.resumeId);
    if (!Number.isFinite(resumeId) || resumeId <= 0) {
      throw new Error('简历信息异常，无法获取文件');
    }
    return chatApi.downloadResume(conversationId, resumeId);
  };

  const handlePreviewResume = async (conversationId: number, ext: Record<string, unknown> | null) => {
    if (resumeFileLoading) return;
    setResumeFileLoading(true);
    setError(null);
    try {
      const { blob, fileName } = await fetchResumeBlob(conversationId, ext);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
      setPreviewFileName(fileName || String(ext?.fileName ?? '简历预览'));
      setPreviewKind('pdf');
    } catch (err) {
      setError(err instanceof Error ? err.message : '预览简历失败');
    } finally {
      setResumeFileLoading(false);
    }
  };

  const handlePreviewImage = async (conversationId: number, messageId: number, ext: Record<string, unknown> | null) => {
    if (resumeFileLoading) return;
    setResumeFileLoading(true);
    setError(null);
    try {
      const { blob } = await chatApi.previewImage(conversationId, messageId);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
      setPreviewFileName(String(ext?.fileName ?? '图片预览'));
      setPreviewKind('image');
    } catch (err) {
      setError(err instanceof Error ? err.message : '预览图片失败');
    } finally {
      setResumeFileLoading(false);
    }
  };

  const loadInlineImage = async (conversationId: number, messageId: number) => {
    const { blob } = await chatApi.previewImage(conversationId, messageId);
    const objectUrl = URL.createObjectURL(blob);
    setInlineImageUrls((prev) => {
      if (prev[messageId]) {
        URL.revokeObjectURL(objectUrl);
        return prev;
      }
      return { ...prev, [messageId]: objectUrl };
    });
    setInlineImageErrors((prev) => {
      if (!prev[messageId]) return prev;
      const next = { ...prev };
      delete next[messageId];
      return next;
    });
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewFileName('');
    setPreviewKind('pdf');
  };

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  useEffect(() => {
    let cancelled = false;
    const imageMessages = messages.filter((item) => item.messageType === 2);
    if (imageMessages.length === 0) {
      return;
    }

    void (async () => {
      for (const message of imageMessages) {
        if (inlineImageUrls[message.id]) {
          continue;
        }
        try {
          if (cancelled) return;
          await loadInlineImage(message.conversationId, message.id);
        } catch (err) {
          if (cancelled) return;
          setInlineImageErrors((prev) => ({
            ...prev,
            [message.id]: err instanceof Error ? err.message : '图片加载失败',
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [messages, inlineImageUrls]);

  useEffect(() => {
    const validIds = new Set(messages.filter((item) => item.messageType === 2).map((item) => item.id));
    setInlineImageUrls((prev) => {
      let changed = false;
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([idText, url]) => {
        const id = Number(idText);
        if (validIds.has(id)) {
          next[id] = url;
        } else {
          changed = true;
          URL.revokeObjectURL(url);
        }
      });
      return changed ? next : prev;
    });
  }, [messages]);

  useEffect(() => () => {
    Object.values(inlineImageUrls).forEach((url) => URL.revokeObjectURL(url));
  }, [inlineImageUrls]);

  const handleDownloadResume = async (conversationId: number, ext: Record<string, unknown> | null) => {
    if (resumeFileLoading) return;
    setResumeFileLoading(true);
    setError(null);
    try {
      const resumeId = Number(ext?.resumeId);
      const { blob, fileName } = await fetchResumeBlob(conversationId, ext);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = fileName || String(ext?.fileName ?? `resume-${Number.isFinite(resumeId) ? resumeId : 'file'}.pdf`);
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : '下载简历失败');
    } finally {
      setResumeFileLoading(false);
    }
  };

  const jobHref = selectedConversation ? jobPathBuilder(selectedConversation.jobId) : '#';

  const hasDefaultResume = useMemo(() => {
    if (!isUserRole) return false;
    return resumes.length > 0;
  }, [isUserRole, resumes]);

  const canDownloadResume = (ext: Record<string, unknown> | null): boolean => {
    if (!ext) return false;
    const resumeId = Number(ext.resumeId);
    return Number.isFinite(resumeId) && resumeId > 0;
  };

  const handleSelectConversation = (conversationId: number) => {
    setSelectedConversationId(conversationId);
    if (mobileMode !== 'list' || typeof window === 'undefined') {
      return;
    }
    if (window.matchMedia('(max-width: 767px)').matches) {
      router.push(`${conversationPathPrefix}/${conversationId}`);
    }
  };

  const previewModal = previewUrl && typeof window !== 'undefined'
    ? createPortal(
      <div data-testid="chat-resume-preview-modal" className="fixed inset-0 z-[9999] bg-black/70 p-2 md:p-6">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-outline/20 bg-white px-4 py-3">
            <p className="truncate text-sm font-bold text-on-surface">{previewFileName || '简历预览'}</p>
            <button
              type="button"
              onClick={closePreview}
              className="rounded-lg border border-outline/20 px-3 py-1 text-sm text-on-surface hover:bg-surface-low"
            >
              关闭预览
            </button>
          </div>
          {previewKind === 'image' ? (
            <div className="flex h-full w-full flex-1 items-center justify-center bg-black/80 p-3">
              <img title="图片预览" src={previewUrl} alt={previewFileName || '图片预览'} className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <iframe title="简历预览" src={previewUrl} className="h-full w-full flex-1 bg-white" />
          )}
        </div>
      </div>,
      document.body,
    )
    : null;

  return (
      <section data-testid="chat-workspace" className="mx-auto w-full max-w-6xl px-0 py-0 md:px-6 md:py-0">
        {previewModal}
      {title ? <h1 className="text-2xl font-black text-on-surface mb-4">{title}</h1> : null}
      {error ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

      <div
        data-testid="chat-desktop-layout"
        className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-4 md:h-[calc(100vh-64px)] min-h-[560px]"
      >
        {(mobileMode === 'list' || mobileMode === 'detail') ? (
          <aside
            data-testid="chat-conversation-list-panel"
            className={`rounded-none md:rounded-2xl border border-outline/20 bg-surface-lowest overflow-hidden ${mobileMode === 'detail' ? 'hidden md:block' : ''}`}
          >
            <div className="h-12 px-3 border-b border-outline/20 flex items-center">
              <input
                value={conversationKeyword}
                onChange={(event) => setConversationKeyword(event.target.value)}
                placeholder="搜索会话..."
                className="h-9 w-full rounded-lg border border-outline/20 bg-surface-low px-3 text-sm text-on-surface outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="h-full overflow-y-auto p-2 space-y-2">
              {loadingList ? <div className="px-3 py-4 text-sm text-on-surface-variant">会话加载中...</div> : null}
              {!loadingList && filteredList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-outline/20 px-4 py-10 text-center text-sm text-on-surface-variant">暂无会话</div>
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
                    onClick={() => handleSelectConversation(item.conversationId)}
                    className={`w-full text-left rounded-xl border px-3 py-3 transition-colors ${selected ? 'border-primary/40 bg-primary/5' : 'border-outline/20 bg-surface-lowest hover:border-primary/20'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex items-start gap-2">
                        <Avatar
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

        <div
          data-testid="chat-conversation-detail-panel"
          className={`${mobileMode === 'list' ? 'hidden md:flex' : ''} ${mobileMode === 'detail' && !shouldShowDetail ? 'hidden md:flex' : mobileMode === 'detail' ? 'flex' : ''} min-h-0 flex-col rounded-none md:rounded-2xl border border-outline/20 bg-surface-lowest overflow-hidden ${mobileMode === 'detail' ? 'h-[100dvh] md:h-auto' : ''}`}
        >
          {selectedConversation ? (
            <>
              <header data-testid="chat-detail-header" className="shrink-0 border-b border-outline/20 px-4 py-3 bg-surface-low">
                {mobileMode === 'detail' ? (
                  <div className="mb-2 md:hidden">
                    <Link
                      data-testid="chat-mobile-back-button"
                      href={conversationPathPrefix}
                      className="inline-flex items-center gap-1 rounded-lg border border-outline/20 px-2.5 py-1 text-xs font-bold text-on-surface-variant hover:bg-surface-lowest"
                    >
                      返回会话列表
                    </Link>
                  </div>
                ) : null}
                <div className="flex items-start justify-between gap-3">
                  {(() => {
                    const candidateDisplayName = normalizeCandidateDisplayName(selectedConversation);
                    const headerOwnerAvatarUrl = isUserRole
                      ? (peerAvatarUrl ?? conversationOwnerAvatarMap[selectedConversation.conversationId] ?? null)
                      : (selectedConversation.candidateUserId ? buildPersonAvatarUrl(selectedConversation.candidateUserId) : null);
                    return (
                  <div className="min-w-0 flex items-start gap-2">
                    <Avatar
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
                    );
                  })()}
                  <Link href={jobHref} className="shrink-0 rounded-lg border border-primary/40 px-3 py-1.5 text-sm font-bold text-primary hover:bg-primary/5">查看职位</Link>
                </div>
                <div className="mt-2 rounded-xl bg-surface-lowest border border-outline/20 px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-semibold text-on-surface">{jobMeta?.jobTitle || selectedConversation.jobTitle || `岗位 #${selectedConversation.jobId}`}</span>
                  <span className="text-primary font-bold">{jobMeta?.salaryText || '薪资面议'}</span>
                  <span className="text-on-surface-variant">{jobMeta?.locationText || '地点待补充'}</span>
                </div>
              </header>

              <div data-testid="chat-message-scroll-container" className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
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
                          <span className="rounded-full bg-surface-low px-3 py-1 text-[11px] text-on-surface-variant">{formatDateTag(message.createTime)}</span>
                        </div>
                      ) : null}
                      <div className={`flex items-end gap-2 ${self ? 'justify-end' : 'justify-start'}`}>
                        {!self ? <Avatar name={senderName} imageUrl={peerAvatarUrl} testId="chat-message-avatar" /> : null}
                        <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${self ? 'bg-primary text-white' : 'bg-surface-low text-on-surface'}`}>
                          {message.messageType === 3 && ext ? (
                            <div className={`rounded-xl border px-3 py-2 ${self ? 'border-white/40 bg-white/10' : 'border-outline/20 bg-surface-lowest'}`}>
                              <div className="flex items-start gap-2">
                                <span className="text-xl leading-none">📄</span>
                                <div className="min-w-0">
                                  <p className="font-bold">PDF简历</p>
                                  <p className={`truncate ${self ? 'text-white/90' : 'text-on-surface-variant'}`}>
                                    {String(ext.fileName ?? '未命名简历.pdf')}
                                  </p>
                                </div>
                              </div>
                              {resumeCanDownload ? (
                                <div className="mt-2 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => void handlePreviewResume(message.conversationId, ext)}
                                    disabled={resumeFileLoading}
                                    className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold disabled:opacity-60 ${self ? 'bg-white/90 text-primary' : 'bg-surface-low text-on-surface'}`}
                                  >
                                    {resumeFileLoading ? '处理中...' : '预览PDF'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleDownloadResume(message.conversationId, ext)}
                                    disabled={resumeFileLoading}
                                    className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold disabled:opacity-60 ${self ? 'bg-white text-primary' : 'bg-primary text-white'}`}
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
                                  onClick={() => void handlePreviewImage(message.conversationId, message.id, ext)}
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
                                    onClick={() => void loadInlineImage(message.conversationId, message.id)}
                                    className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${self ? 'bg-white text-primary' : 'bg-primary text-white'}`}
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
                        {self ? <Avatar name={senderName} imageUrl={currentAvatar} testId="chat-message-avatar" /> : null}
                      </div>
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>

              <footer data-testid="chat-detail-composer" className="shrink-0 border-t border-outline/20 px-4 py-3">
                <div className="flex items-center gap-2 mb-2 relative">
                  <button
                    type="button"
                    data-testid="chat-emoji-button"
                    onClick={() => setShowEmojiPanel((prev) => !prev)}
                    className="h-9 w-9 rounded-lg border border-outline/20 text-on-surface-variant hover:bg-surface-low"
                    aria-label="表情"
                  >
                    😀
                  </button>
                  {showEmojiPanel ? <EmojiPanel onSelect={(emoji) => { setInput((prev) => `${prev}${emoji}`); setShowEmojiPanel(false); }} /> : null}

                  <label className="h-9 w-9 rounded-lg border border-outline/20 text-on-surface-variant hover:bg-surface-low inline-flex items-center justify-center cursor-pointer" aria-label="相册">
                    <Images className="h-5 w-5" />
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
                    <button
                      type="button"
                      onClick={() => setShowInviteEditor((prev) => !prev)}
                      className="h-9 px-3 rounded-lg border border-primary text-primary text-sm font-bold"
                    >
                      {inviteSending ? '发送中...' : showInviteEditor ? '发送面试通知' : '面试通知'}
                    </button>
                  )}
                </div>

                {!isUserRole && showInviteEditor ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <input value={inviteTime} onChange={(event) => setInviteTime(event.target.value)} placeholder="面试时间（必填） 2026-05-10T15:00:00" className="h-9 rounded-lg border border-outline/20 px-3 text-sm bg-transparent" />
                    <input value={inviteLocation} onChange={(event) => setInviteLocation(event.target.value)} placeholder="面试地点" className="h-9 rounded-lg border border-outline/20 px-3 text-sm bg-transparent" />
                    <input value={inviteRemark} onChange={(event) => setInviteRemark(event.target.value)} placeholder="面试备注" className="h-9 rounded-lg border border-outline/20 px-3 text-sm bg-transparent" />
                    <button
                      type="button"
                      onClick={() => void handleSendInterview()}
                      disabled={inviteSending}
                      className="h-9 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-60 md:col-span-3"
                    >
                      {inviteSending ? '发送中...' : '确认发送面试通知'}
                    </button>
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="输入消息..."
                    className="flex-1 h-10 rounded-xl border border-outline/20 px-3 text-sm bg-transparent"
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
