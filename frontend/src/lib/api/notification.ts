import apiClient from './client';

export interface Notification {
  id: number;
  type: 'JOB' | 'SYSTEM' | 'MESSAGE';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  linkUrl?: string;
}

export const notificationApi = {
  getList: async (userId: number, type?: string, page = 1): Promise<{ list: Notification[]; total: number }> => {
    const response = await apiClient.get(`/notifications/${userId}`, { params: { type, page } });
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (userId: number): Promise<void> => {
    await apiClient.put(`/notifications/read-all?userId=${userId}`);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  getUnreadCount: async (userId: number): Promise<number> => {
    const response = await apiClient.get(`/notifications/${userId}/unread-count`);
    return response.data;
  },
};
