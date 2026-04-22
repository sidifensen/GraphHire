import apiClient from './client';

export interface Resume {
  id: number;
  fileName: string;
  fileUrl: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  skillTags?: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParseProgress {
  resumeId: number;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  progress: number;
  step: string;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
}

export const resumeApi = {
  /**
   * POST /resume/my/upload - 上传简历（带进度回调）
   */
  uploadWithProgress: async (formData: FormData, onProgress: (percent: number) => void): Promise<Resume> => {
    const response = await apiClient.post('/resume/my/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return response.data;
  },

  /**
   * POST /resume/my/upload - 上传简历
   */
  upload: async (formData: FormData): Promise<Resume> => {
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
   * GET /resume/{id}/progress - 获取简历解析进度
   */
  getParseProgress: async (id: number): Promise<ParseProgress> => {
    const response = await apiClient.get(`/resume/${id}/progress`);
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

  /**
   * POST /person/applications - 投递简历（需先选择简历）
   */
  apply: async (data: { jobId: number; resumeId: number }): Promise<{ applicationId: number }> => {
    const response = await apiClient.post('/person/applications', data);
    return response.data;
  },
};
