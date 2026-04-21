import apiClient from './client';

export interface Notification {
  id: number;
  userId: number;
  type: 'RESUME_PARSED' | 'JOB_RECOMMENDATION' | 'CANDIDATE_RECOMMENDATION' | 'COMPANY_AUTH_RESULT' | 'RESUME_VIEWED' | 'RESUME_SUBMITTED' | 'INTERVIEW_INVITED' | 'SYSTEM_NOTIFICATION';
  title: string;
  content: string;
  isRead: boolean;
  createdAt?: string;
  referenceId?: number;
  metadata?: string;
}

export const notificationApi = {
  getById: async (id: number): Promise<Notification> => {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },

  getList: async (userId: number): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications/user/${userId}`);
    return response.data;
  },

  getUnread: async (userId: number): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications/user/${userId}/unread`);
    return response.data;
  },

  getByType: async (userId: number, type: string): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications/user/${userId}/type/${type}`);
    return response.data;
  },

  getUnreadCount: async (userId: number): Promise<number> => {
    const response = await apiClient.get(`/notifications/user/${userId}/unread-count`);
    return response.data;
  },

  getMyList: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications/me');
    return response.data;
  },

  getMyUnread: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications/me/unread');
    return response.data;
  },

  getMyByType: async (type: string): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications/me/type/${type}`);
    return response.data;
  },

  getMyUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/notifications/me/unread-count');
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  markAsUnread: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/unread`);
  },

  markAllAsRead: async (userId: number): Promise<void> => {
    await apiClient.put(`/notifications/user/${userId}/read-all`);
  },

  markAllMyAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/me/read-all');
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
