'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { chatApi } from '@/lib/api/chat';
import { userAuthStore } from '@/lib/stores/auth-store';
import { resumeApi, type Resume } from '@/lib/api/resume';
import type { ChatMessage } from '@/lib/types/chat';

function parseExt(ext?: string | null): Record<string, unknown> | null {
  if (!ext) return null;
  try {
    return JSON.parse(ext) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function formatTime(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}

export default function UserChatDetailPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = Number(params?.conversationId);
  const currentUserId = userAuthStore((state) => state.user?.id ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [resumeSending, setResumeSending] = useState(false);
  const [imageSending, setImageSending] = useState(false);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  const lastInboundMessageId = useMemo(() => {
    if (!currentUserId) return null;
    const inbound = messages.filter((item) => item.receiverUserId === currentUserId);
    if (inbound.length === 0) return null;
    return inbound[0].id;
  }, [messages, currentUserId]);

  useEffect(() => {
    if (!Number.isFinite(conversationId)) {
      setError('无效会话ID');
      setLoading(false);
      return;
    }
    let active = true;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [messageData, resumeData] = await Promise.all([
          chatApi.listMessages(conversationId, { pageSize: 100 }),
          resumeApi.getMyResumes(),
        ]);
        if (!active) return;
        setMessages((messageData ?? []).slice().reverse());
        setResumes(resumeData ?? []);
        if ((resumeData ?? []).length > 0) {
          setSelectedResumeId((resumeData ?? [])[0].id ?? null);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : '会话加载失败');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [conversationId]);

  useEffect(() => {
    if (lastInboundMessageId == null) return;
    void chatApi.markRead({ conversationId, readUpToMessageId: lastInboundMessageId });
  }, [conversationId, lastInboundMessageId]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendText = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setError(null);
    try {
      await chatApi.sendText({ conversationId, content });
      const messageData = await chatApi.listMessages(conversationId, { pageSize: 100 });
      setMessages((messageData ?? []).slice().reverse());
      setInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败');
    } finally {
      setSending(false);
    }
  };

  const sendResumeCard = async () => {
    if (!selectedResumeId || resumeSending) return;
    setResumeSending(true);
    setError(null);
    try {
      await chatApi.sendResume({ conversationId, resumeId: selectedResumeId });
      const messageData = await chatApi.listMessages(conversationId, { pageSize: 100 });
      setMessages((messageData ?? []).slice().reverse());
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送简历失败');
    } finally {
      setResumeSending(false);
    }
  };

  const sendImage = async (file: File | null) => {
    if (!file || imageSending) return;
    setImageSending(true);
    setError(null);
    try {
      await chatApi.sendImage(conversationId, file);
      const messageData = await chatApi.listMessages(conversationId, { pageSize: 100 });
      setMessages((messageData ?? []).slice().reverse());
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送图片失败');
    } finally {
      setImageSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-4 min-h-[70vh]">
      <h1 className="text-2xl font-black text-on-surface">聊天详情</h1>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
      <div className="rounded-2xl border border-surface-mid bg-surface-lowest p-4 flex-1 overflow-y-auto">
        {loading ? <div className="text-sm text-on-surface-variant">消息加载中...</div> : null}
        {!loading && messages.length === 0 ? <div className="text-sm text-on-surface-variant">暂无消息</div> : null}
        <div className="space-y-3">
          {messages.map((message) => {
            const self = currentUserId != null && message.senderUserId === currentUserId;
            const ext = parseExt(message.ext);
            return (
              <div key={message.id} className={`flex ${self ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 ${self ? 'bg-primary text-white' : 'bg-surface-low text-on-surface'}`}>
                  {message.messageType === 3 && ext ? (
                    <div className="text-sm">
                      <p className="font-bold">简历卡片</p>
                      <p className="opacity-90">{String(ext.fileName ?? '未命名简历')}</p>
                    </div>
                  ) : message.messageType === 2 && ext ? (
                    <div className="text-sm">
                      <p className="font-bold">图片消息</p>
                      <p className="opacity-90">{String(ext.fileName ?? '图片')}</p>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content || ''}</p>
                  )}
                  <p className={`text-[11px] mt-1 ${self ? 'text-white/80' : 'text-outline'}`}>{formatTime(message.createTime)}</p>
                </div>
              </div>
            );
          })}
          <div ref={listEndRef} />
        </div>
      </div>

      <div className="rounded-2xl border border-surface-mid bg-surface-lowest p-4 space-y-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="输入消息，支持表情 😀"
            className="flex-1 h-10 rounded-xl border border-surface-mid px-3 text-sm bg-transparent"
          />
          <button
            onClick={() => void sendText()}
            disabled={sending}
            className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-60"
          >
            {sending ? '发送中...' : '发送'}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedResumeId ?? ''}
            onChange={(event) => setSelectedResumeId(Number(event.target.value))}
            className="h-10 rounded-xl border border-surface-mid px-3 text-sm bg-transparent min-w-[200px]"
          >
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.fileName}
              </option>
            ))}
          </select>
          <button
            onClick={() => void sendResumeCard()}
            disabled={resumeSending || !selectedResumeId}
            className="h-10 px-4 rounded-xl border border-primary text-primary text-sm font-bold disabled:opacity-60"
          >
            {resumeSending ? '发送中...' : '发送简历'}
          </button>
          <label className="h-10 px-4 rounded-xl border border-primary text-primary text-sm font-bold inline-flex items-center cursor-pointer">
            {imageSending ? '上传中...' : '发送图片'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                void sendImage(file);
                event.currentTarget.value = '';
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
