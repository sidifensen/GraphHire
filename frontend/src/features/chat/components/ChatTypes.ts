export type ChatWorkspaceRole = 'user' | 'enterprise';

export type ChatMobileMode = 'list' | 'detail';

export interface ChatWorkspaceProps {
  role: ChatWorkspaceRole;
  title?: string;
  conversationPathPrefix: string;
  jobPathBuilder: (jobId: number) => string;
  mobileMode: ChatMobileMode;
  initialConversationId?: number | null;
}

export interface ChatJobMeta {
  ownerName?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  salaryText?: string | null;
  locationText?: string | null;
}
