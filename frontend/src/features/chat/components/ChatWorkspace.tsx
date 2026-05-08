'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chatApi } from '@/lib/api/chat';
import { companyApi } from '@/lib/api/company';
import { publicApi } from '@/lib/api/public';
import { resumeApi, type Resume } from '@/lib/api/resume';
import { enterpriseAuthStore, userAuthStore } from '@/lib/stores/auth-store';
import type { ChatConversationSummary, ChatMessage } from '@/lib/types/chat';
import { getApiBaseUrl } from '@/lib/api/base-url';
import type { ChatJobMeta, ChatWorkspaceProps } from './ChatTypes';
import { ChatPreviewModal } from './ChatPreviewModal';
import { ChatConversationListPanel } from './ChatConversationListPanel';
import { ChatDetailHeader } from './ChatDetailHeader';
import { ChatMessageStream } from './ChatMessageStream';
import { ChatComposerDock } from './ChatComposerDock';

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

function uniqueConversationTargets(list: ChatConversationSummary[]): Array<{ jobId: number; companyId: number | null }> {
  const targetMap = new Map<number, number | null>();
  for (const item of list) {
    if (!targetMap.has(item.jobId)) {
      targetMap.set(item.jobId, item.companyId ?? null);
    }
  }
  return Array.from(targetMap.entries()).map(([jobId, companyId]) => ({ jobId, companyId }));
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
      const targetList = uniqueConversationTargets(list);
      const avatarByJobId = new Map<number, string | null>();
      await Promise.all(
        targetList.map(async ({ jobId, companyId }) => {
          try {
            const job = await publicApi.jobs.getById(jobId);
            const fromJob = toAbsoluteAssetUrl(job.companyAvatarUrl);
            if (fromJob) {
              avatarByJobId.set(jobId, fromJob);
              return;
            }
            if (companyId) {
              try {
                const company = await publicApi.companies.getById(companyId);
                avatarByJobId.set(jobId, toAbsoluteAssetUrl(company.avatarUrl));
              } catch {
                avatarByJobId.set(jobId, null);
              }
              return;
            }
            avatarByJobId.set(jobId, null);
          } catch {
            avatarByJobId.set(jobId, null);
          }
        }),
      );
      const entries = list.map((item): [number, string | null] => [item.conversationId, avatarByJobId.get(item.jobId) ?? null]);
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

  const handleSendInterview = async ({
    interviewTime,
    location,
    remark,
  }: {
    interviewTime: string;
    location: string;
    remark: string;
  }) => {
    if (isUserRole || !selectedConversationId || inviteSending) return;
    setInviteSending(true);
    setError(null);
    try {
      await chatApi.sendInterviewInvite({
        conversationId: selectedConversationId,
        interviewTime,
        location,
        remark,
      });
      await refreshMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送面试通知失败');
      throw err;
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

  return (
    <section data-testid="chat-workspace" className="chat-frosted-shell mx-auto w-full max-w-6xl px-0 py-0 md:px-6 md:py-4 md:rounded-[28px] md:bg-gradient-to-br md:from-surface-container-lowest md:to-surface-container-low md:shadow-[0_24px_70px_rgba(15,23,42,0.12)] md:ring-1 md:ring-outline-variant/55 dark:md:from-surface-container-lowest dark:md:to-surface-container-low dark:md:shadow-[0_24px_70px_rgba(0,0,0,0.38)] dark:md:ring-outline-variant/70">
      <ChatPreviewModal
        previewUrl={previewUrl}
        previewFileName={previewFileName}
        previewKind={previewKind}
        onClose={closePreview}
      />
      {title ? <h1 className="text-2xl font-black text-on-surface mb-4">{title}</h1> : null}
      {error ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

      <div
        data-testid="chat-desktop-layout"
        className="chat-frosted-layout grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-4 md:h-[calc(100vh-96px)] md:min-h-[560px]"
      >
        {(mobileMode === 'list' || mobileMode === 'detail') ? (
          <ChatConversationListPanel
            mobileMode={mobileMode}
            loadingList={loadingList}
            filteredList={filteredList}
            selectedConversationId={selectedConversationId}
            conversationKeyword={conversationKeyword}
            onKeywordChange={setConversationKeyword}
            onSelectConversation={handleSelectConversation}
            isUserRole={isUserRole}
            buildPersonAvatarUrl={buildPersonAvatarUrl}
            conversationOwnerAvatarMap={conversationOwnerAvatarMap}
            formatListTime={formatListTime}
            normalizeCandidateDisplayName={normalizeCandidateDisplayName}
          />
        ) : null}

        <div
          data-testid="chat-conversation-detail-panel"
          className={`chat-frosted-detail-panel ${mobileMode === 'list' ? 'hidden md:flex' : ''} ${mobileMode === 'detail' && !shouldShowDetail ? 'hidden md:flex' : mobileMode === 'detail' ? 'flex' : ''} min-h-0 flex-col rounded-none md:rounded-3xl bg-surface-container-low/85 backdrop-blur-xl ring-1 ring-outline-variant/55 shadow-[0_18px_45px_rgba(15,23,42,0.10)] overflow-hidden dark:bg-surface-container-low/80 dark:ring-outline-variant/70 dark:shadow-[0_18px_45px_rgba(0,0,0,0.35)] ${mobileMode === 'detail' ? 'h-[100dvh] md:h-auto' : ''}`}
        >
          {selectedConversation ? (
            <>
              <ChatDetailHeader
                mobileMode={mobileMode}
                isUserRole={isUserRole}
                selectedConversation={selectedConversation}
                conversationPathPrefix={conversationPathPrefix}
                peerAvatarUrl={peerAvatarUrl}
                conversationOwnerAvatarMap={conversationOwnerAvatarMap}
                buildPersonAvatarUrl={buildPersonAvatarUrl}
                normalizeCandidateDisplayName={normalizeCandidateDisplayName}
                formatGender={formatGender}
                jobMeta={jobMeta}
                jobHref={jobHref}
              />

              <ChatMessageStream
                messages={messages}
                loadingMessages={loadingMessages}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                role={role}
                selectedConversation={selectedConversation}
                peerAvatarUrl={peerAvatarUrl}
                currentAvatar={currentAvatar}
                parseExt={parseExt}
                getDateKey={getDateKey}
                formatDateTag={formatDateTag}
                getUserDisplay={getUserDisplay}
                canDownloadResume={canDownloadResume}
                resumeFileLoading={resumeFileLoading}
                inlineImageUrls={inlineImageUrls}
                inlineImageErrors={inlineImageErrors}
                onPreviewResume={handlePreviewResume}
                onDownloadResume={handleDownloadResume}
                onPreviewImage={handlePreviewImage}
                onLoadInlineImage={loadInlineImage}
                messageEndRef={messageEndRef}
              />

              <ChatComposerDock
                isUserRole={isUserRole}
                showEmojiPanel={showEmojiPanel}
                onToggleEmoji={() => setShowEmojiPanel((prev) => !prev)}
                onSelectEmoji={(emoji) => {
                  setInput((prev) => `${prev}${emoji}`);
                  setShowEmojiPanel(false);
                }}
                onPickImage={(file) => {
                  void handleSendImage(file);
                }}
                hasDefaultResume={hasDefaultResume}
                resumeSending={resumeSending}
                onSendResume={handleSendResume}
                inviteSending={inviteSending}
                onInviteError={(message) => setError(message)}
                onSendInterview={handleSendInterview}
                input={input}
                onInputChange={setInput}
                sending={sending}
                onSendText={handleSendText}
              />
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
