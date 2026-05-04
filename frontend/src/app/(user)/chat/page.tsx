'use client';

import ChatWorkspace from '@/features/chat/components/ChatWorkspace';

export default function UserChatListPage() {
  return (
    <ChatWorkspace
      role="user"
      title="沟通消息"
      conversationPathPrefix="/chat"
      mobileMode="list"
      jobPathBuilder={(jobId) => `/jobs/${jobId}`}
    />
  );
}
