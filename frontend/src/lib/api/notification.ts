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
  /** GET /notifications/{id} */
  getById: async (id: number): Promise<Notification> => {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },

  /** GET /notifications/user/{userId} */
  getList: async (userId: number, type?: string, page = 1): Promise<{ list: Notification[]; total: number }> => {
    const response = await apiClient.get(`/notifications/user/${userId}`, { params: { type, page } });
    return response.data;
  },

  /** GET /notifications/user/{userId}/unread */
  getUnread: async (userId: number): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications/user/${userId}/unread`);
    return response.data;
  },

  /** GET /notifications/user/{userId}/type/{type} */
  getByType: async (userId: number, type: string): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications/user/${userId}/type/${type}`);
    return response.data;
  },

  /** GET /notifications/user/{userId}/unread-count */
  getUnreadCount: async (userId: number): Promise<number> => {
    const response = await apiClient.get(`/notifications/user/${userId}/unread-count`);
    return response.data;
  },

  /** PUT /notifications/{id}/read */
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  /** PUT /notifications/{id}/unread */
  markAsUnread: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/unread`);
  },

  /** PUT /notifications/user/{userId}/read-all */
  markAllAsRead: async (userId: number): Promise<void> => {
    await apiClient.put(`/notifications/user/${userId}/read-all`);
  },

  /** DELETE /notifications/{id} */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
