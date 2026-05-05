'use client';

import ChatWorkspace from '@/features/chat/components/ChatWorkspace';

export default function EnterpriseChatListPage() {
  return (
    <ChatWorkspace
      role="enterprise"
      conversationPathPrefix="/enterprise/chat"
      mobileMode="list"
      jobPathBuilder={(jobId) => `/enterprise/jobs/${jobId}`}
    />
  );
}
