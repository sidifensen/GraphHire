export type ChatMessageTypeCode = 1 | 2 | 3 | 4 | 5;

export interface ChatConversationSummary {
  conversationId: number;
  jobId: number;
  jobTitle?: string | null;
  companyId?: number | null;
  companyName?: string | null;
  recruiterUserId: number;
  candidateUserId: number;
  candidateName?: string | null;
  recruiterName?: string | null;
  lastMessageId?: number | null;
  lastMessagePreview?: string | null;
  lastMessageTime?: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderUserId: number;
  receiverUserId: number;
  messageType: ChatMessageTypeCode;
  content?: string | null;
  ext?: string | null;
  recalled: number;
  createTime?: string | null;
}

export interface StartConversationRequest {
  jobId: number;
}

export interface SendTextMessageRequest {
  conversationId: number;
  content: string;
}

export interface SendResumeMessageRequest {
  conversationId: number;
  resumeId: number;
}

export interface SendInterviewInviteRequest {
  conversationId: number;
  interviewTime: string;
  location: string;
  remark?: string;
}

export interface MarkReadRequest {
  conversationId: number;
  readUpToMessageId: number;
}

export interface ChatDisplayMessage {
  id: number;
  conversationId: number;
  senderUserId: number;
  receiverUserId: number;
  messageType: ChatMessageTypeCode;
  content?: string | null;
  ext?: string | null;
  recalled: number;
  createTime?: string | null;
}
