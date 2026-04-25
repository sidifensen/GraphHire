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

type ResumeStatus = Resume['status'];

type BackendResume = Omit<Partial<Resume>, 'status' | 'createdAt' | 'updatedAt' | 'fileUrl'> & {
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  filePath?: string;
  createTime?: string;
  updateTime?: string;
  status?: string;
  parseStatus?: number;
};

function normalizeStatus(raw: BackendResume): ResumeStatus {
  const status = raw.status;
  if (status === 'COMPLETED' || status === 'PROCESSING' || status === 'PENDING' || status === 'FAILED') {
    return status;
  }
  if (status === 'SUCCESS') {
    return 'COMPLETED';
  }
  if (status === 'PARSING' || status === 'RUNNING') {
    return 'PROCESSING';
  }
  switch (raw.parseStatus) {
    case 1:
      return 'PROCESSING';
    case 2:
      return 'COMPLETED';
    case 3:
      return 'FAILED';
    default:
      return 'PENDING';
  }
}

function inferCreatedAt(raw: BackendResume): string {
  if (raw.createdAt) {
    return raw.createdAt;
  }
  if (raw.createTime) {
    return raw.createTime;
  }
  const path = raw.filePath ?? raw.fileUrl ?? '';
  const match = path.match(/(\d{13})_/);
  if (match) {
    const ts = Number(match[1]);
    if (!Number.isNaN(ts)) {
      return new Date(ts).toISOString();
    }
  }
  return '';
}

function normalizeResume(raw: BackendResume): Resume {
  const createdAt = inferCreatedAt(raw);
  const updatedAt = raw.updatedAt ?? raw.updateTime ?? createdAt;
  return {
    id: Number(raw.id ?? 0),
    fileName: raw.fileName ?? '',
    fileUrl: raw.fileUrl ?? raw.filePath ?? '',
    status: normalizeStatus(raw),
    skillTags: raw.skillTags,
    isDefault: Boolean(raw.isDefault),
    createdAt,
    updatedAt,
  };
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

export interface ResumePreviewData {
  blob: Blob;
  contentType: string;
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
    return (response.data as BackendResume[]).map((item) => normalizeResume(item));
  },

  /**
   * GET /resume/{id}/detail - 获取简历详情（含解析状态）
   */
  getDetail: async (id: number): Promise<Resume> => {
    const response = await apiClient.get(`/resume/${id}/detail`);
    return normalizeResume(response.data as BackendResume);
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
  setDefault: async (id: number, syncPersonInfo = false): Promise<void> => {
    await apiClient.put(`/resume/${id}/default`, null, {
      params: { syncPersonInfo },
    });
  },

  /**
   * POST /resume/{id}/parse - 触发简历解析
   */
  parse: async (id: number): Promise<{ status: string }> => {
    const response = await apiClient.post(`/resume/${id}/parse`);
    return response.data;
  },

  /**
   * GET /resume/{id}/preview - 预览简历原文件
   */
  preview: async (id: number): Promise<ResumePreviewData> => {
    const response = await apiClient.get(`/resume/${id}/preview`, {
      responseType: 'blob',
    });
    return {
      blob: response.data as Blob,
      contentType: response.headers['content-type'] || 'application/octet-stream',
    };
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
    const response = await apiClient.post('/person/application/apply', data);
    return response.data;
  },
};
