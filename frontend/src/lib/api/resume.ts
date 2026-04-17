import apiClient from './client';

export interface Resume {
  id: number;
  fileName: string;
  fileUrl: string;
  parseStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  skillTags?: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const resumeApi = {
  upload: async (formData: FormData): Promise<{ resumeId: number }> => {
    const response = await apiClient.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getList: async (userId: number): Promise<Resume[]> => {
    const response = await apiClient.get(`/resume/user/${userId}`);
    return response.data;
  },

  getById: async (id: number): Promise<Resume> => {
    const response = await apiClient.get(`/resume/${id}`);
    return response.data;
  },

  setDefault: async (id: number, isDefault: boolean): Promise<void> => {
    await apiClient.put(`/resume/${id}/default`, { isDefault });
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/resume/${id}`);
  },

  getParseStatus: async (id: number): Promise<{ status: string; result?: any }> => {
    const response = await apiClient.get(`/resume/${id}/status`);
    return response.data;
  },
};
