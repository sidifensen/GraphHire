'use client';

import { useParams } from 'next/navigation';
import ChatWorkspace from '@/features/chat/components/ChatWorkspace';

export default function UserChatDetailPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = Number(params?.conversationId);

  return (
    <ChatWorkspace
      role="user"
      title="沟通消息"
      conversationPathPrefix="/chat"
      mobileMode="detail"
      initialConversationId={Number.isFinite(conversationId) ? conversationId : null}
      jobPathBuilder={(jobId) => `/jobs/${jobId}`}
    />
  );
}
