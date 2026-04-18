import apiClient from './client';

export interface SalaryRange {
  min: number;
  max: number;
  unit?: string;
}

export interface Location {
  city: string;
  district?: string;
  address?: string;
}

export interface Job {
  id: number;
  companyId: number;
  title: string;
  department?: string;
  headcount?: number;
  location?: Location;
  salaryRange?: SalaryRange;
  requiredSkills?: string[];
  preferredSkills?: string[];
  description?: string;
  status: string;
  publishedAt?: string;
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