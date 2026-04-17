import apiClient from './client';

export interface Job {
  id: number;
  title: string;
  description: string;
  salaryRange?: { min: number; max: number };
  location?: { city: string; district?: string };
  requiredSkills?: string[];
  status: string;
  createTime: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

export const jobApi = {
  getJobs: async (params?: {
    keyword?: string;
    city?: string;
    salaryMin?: number;
    salaryMax?: number;
    skills?: string[];
    page?: number;
    size?: number;
  }): Promise<PageResult<Job>> => {
    const response = await apiClient.get<PageResult<Job>>('/public/jobs', { params });
    return response.data;
  },

  getJob: async (id: number): Promise<Job> => {
    const response = await apiClient.get<Job>(`/public/jobs/${id}`);
    return response.data;
  },
};