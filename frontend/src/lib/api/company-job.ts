import apiClient from './client';

export interface Job {
  id: number;
  title: string;
  companyId: number;
  companyName: string;
  companyLogo?: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  city: string;
  district?: string;
  requiredSkills: string[];
  experience: string;
  education: string;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  status: 'DRAFT' | 'PUBLISHED' | 'OFFLINE';
  viewCount: number;
  applyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  city: string;
  district?: string;
  requiredSkills: string[];
  experience: string;
  education: string;
  jobType: string;
}

export const companyJobApi = {
  create: async (data: CreateJobRequest): Promise<{ jobId: number }> => {
    const response = await apiClient.post('/company/job', data);
    return response.data;
  },

  update: async (jobId: number, data: Partial<CreateJobRequest>): Promise<void> => {
    await apiClient.put(`/company/job/${jobId}`, data);
  },

  getList: async (companyId: number, status?: string): Promise<Job[]> => {
    const response = await apiClient.get(`/company/${companyId}/jobs`, { params: { status } });
    return response.data;
  },

  getById: async (jobId: number): Promise<Job> => {
    const response = await apiClient.get(`/company/job/${jobId}`);
    return response.data;
  },

  publish: async (jobId: number): Promise<void> => {
    await apiClient.put(`/company/job/${jobId}/publish`);
  },

  offline: async (jobId: number): Promise<void> => {
    await apiClient.put(`/company/job/${jobId}/offline`);
  },

  delete: async (jobId: number): Promise<void> => {
    await apiClient.delete(`/company/job/${jobId}`);
  },
};
