'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { chatApi } from '@/lib/api/chat';
import type { ChatConversationSummary } from '@/lib/types/chat';

function formatTime(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}

export default function EnterpriseChatListPage() {
  const [list, setList] = useState<ChatConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await chatApi.listConversations();
        if (!active) return;
        setList(data ?? []);
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
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-black text-on-surface mb-6">沟通列表</h1>
      {error ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
      {loading ? <div className="text-sm text-on-surface-variant">会话加载中...</div> : null}
      <div className="space-y-3">
        {list.map((item) => (
          <Link
            key={item.conversationId}
            href={`/enterprise/chat/${item.conversationId}`}
            className="block rounded-2xl border border-surface-mid bg-surface-lowest px-4 py-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-on-surface truncate">{item.jobTitle || `岗位 #${item.jobId}`}</p>
                <p className="text-sm text-on-surface-variant truncate">候选人：{item.candidateName || `用户#${item.candidateUserId}`}</p>
                <p className="text-sm text-on-surface-variant mt-1 line-clamp-1">{item.lastMessagePreview || '暂无消息'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-outline">{formatTime(item.lastMessageTime)}</p>
                {item.unreadCount > 0 ? (
                  <span className="inline-flex mt-2 min-w-6 h-6 px-2 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                    {item.unreadCount > 99 ? '99+' : item.unreadCount}
                  </span>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
        {!loading && list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-mid px-4 py-10 text-center text-sm text-on-surface-variant">
            暂无会话
          </div>
        ) : null}
      </div>
    </div>
  );
}
