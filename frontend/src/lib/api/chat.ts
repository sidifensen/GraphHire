import apiClient from '@/lib/api/client';
import type {
  ChatConversationSummary,
  ChatMessage,
  MarkReadRequest,
  SendInterviewInviteRequest,
  SendResumeMessageRequest,
  SendTextMessageRequest,
  StartConversationRequest,
} from '@/lib/types/chat';

function decodeContentDispositionFileName(contentDisposition?: string): string | null {
  if (!contentDisposition) return null;

  const encodedMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1]);
    } catch {
      return encodedMatch[1];
    }
  }

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1];
  }

  return null;
}

export const chatApi = {
  listConversations: async (): Promise<ChatConversationSummary[]> => {
    const response = await apiClient.get<ChatConversationSummary[]>('/chat/conversations');
    return response.data;
  },

  listMessages: async (conversationId: number, params?: { beforeMessageId?: number; pageSize?: number }): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`, { params });
    return response.data;
  },

  startConversation: async (data: StartConversationRequest): Promise<{ conversationId: number }> => {
    const response = await apiClient.post<{ conversationId: number }>('/chat/conversations/start', data);
    return response.data;
  },

  sendText: async (data: SendTextMessageRequest): Promise<{ messageId: number }> => {
    const response = await apiClient.post<{ messageId: number }>('/chat/messages/text', data);
    return response.data;
  },

  sendResume: async (data: SendResumeMessageRequest): Promise<{ messageId: number }> => {
    const response = await apiClient.post<{ messageId: number }>('/chat/messages/resume', data);
    return response.data;
  },

  sendImage: async (conversationId: number, file: File): Promise<{ messageId: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', String(conversationId));
    const response = await apiClient.post<{ messageId: number }>('/chat/messages/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  sendInterviewInvite: async (data: SendInterviewInviteRequest): Promise<{ messageId: number }> => {
    const response = await apiClient.post<{ messageId: number }>('/chat/messages/interview-invite', data);
    return response.data;
  },

  downloadResume: async (conversationId: number, resumeId: number): Promise<{ blob: Blob; fileName: string | null }> => {
    const response = await apiClient.get<Blob>(`/chat/conversations/${conversationId}/resume/${resumeId}/download`, {
      responseType: 'blob',
    });
    const contentDisposition = response.headers?.['content-disposition'] as string | undefined;
    return {
      blob: response.data,
      fileName: decodeContentDispositionFileName(contentDisposition),
    };
  },

  getResumeDownloadUrl: (conversationId: number, resumeId: number): string => {
    const baseURL = (apiClient.defaults.baseURL ?? '').replace(/\/$/, '');
    return `${baseURL}/chat/conversations/${conversationId}/resume/${resumeId}/download`;
  },

  markRead: async (data: MarkReadRequest): Promise<void> => {
    await apiClient.post('/chat/messages/read', data);
  },
};
