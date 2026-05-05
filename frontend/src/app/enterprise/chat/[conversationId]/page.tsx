'use client';

import { useParams } from 'next/navigation';
import ChatWorkspace from '@/features/chat/components/ChatWorkspace';

export default function EnterpriseChatDetailPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = Number(params?.conversationId);

  return (
    <ChatWorkspace
      role="enterprise"
      conversationPathPrefix="/enterprise/chat"
      mobileMode="detail"
      initialConversationId={Number.isFinite(conversationId) ? conversationId : null}
      jobPathBuilder={(jobId) => `/enterprise/jobs/${jobId}`}
    />
  );
}
