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
  /**
   * POST /resume/my/upload - 上传简历
   */
  upload: async (formData: FormData): Promise<{ resumeId: number }> => {
    const response = await apiClient.post('/resume/my/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * GET /resume/my - 获取当前用户简历列表
   */
  getMyResumes: async (): Promise<Resume[]> => {
    const response = await apiClient.get('/resume/my');
    return response.data;
  },

  /**
   * GET /resume/{id}/detail - 获取简历详情（含解析状态）
   */
  getDetail: async (id: number): Promise<Resume> => {
    const response = await apiClient.get(`/resume/${id}/detail`);
    return response.data;
  },

  /**
   * DELETE /resume/{id} - 删除简历
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/resume/${id}`);
  },

  /**
   * PUT /resume/{id}/default - 设置默认简历
   */
  setDefault: async (id: number): Promise<void> => {
    await apiClient.put(`/resume/${id}/default`);
  },

  /**
   * POST /resume/{id}/parse - 触发简历解析
   */
  parse: async (id: number): Promise<{ status: string }> => {
    const response = await apiClient.post(`/resume/${id}/parse`);
    return response.data;
  },

  /**
   * GET /resume/list - 获取简历列表（管理员/全局）
   */
  getList: async (): Promise<Resume[]> => {
    const response = await apiClient.get('/resume/list');
    return response.data;
  },
};
