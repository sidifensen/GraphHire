import { apiRequest } from './request';

export interface MyResume {
  id: string;
  fileName: string;
  parseStatus: 'PENDING' | 'PARSING' | 'SUCCESS' | 'FAILED';
  isDefault: boolean;
  updateTime: string;
}

export const resumeApi = {
  upload: (formData: FormData) =>
    apiRequest.post('/resume/my/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getMyResumes: () => apiRequest.get<{ list: MyResume[]; total: number }>('/resume/my'),

  getResumeDetail: (id: string) => apiRequest.get(`/resume/${id}/detail`),

  deleteResume: (id: string) => apiRequest.delete(`/resume/${id}`),

  setDefaultResume: (id: string) => apiRequest.put(`/resume/${id}/default`),

  reparseResume: (id: string) => apiRequest.post(`/resume/${id}/parse`),
};
