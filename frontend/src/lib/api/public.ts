import apiClient from './client';

export interface Company {
  id: number;
  name: string;
  logo?: string;
  unifiedSocialCreditCode?: string;
  description?: string;
  website?: string;
  city?: string;
  industry?: string;
  employeeCount?: string;
  authStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
}

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

export const publicApi = {
  companies: {
    search: async (params?: {
      keyword?: string;
      page?: number;
      size?: number;
    }): Promise<PageResult<Company>> => {
      const response = await apiClient.get<PageResult<Company>>('/public/companies', { params });
      return response.data;
    },

    getById: async (id: number): Promise<Company> => {
      const response = await apiClient.get<Company>(`/public/companies/${id}`);
      return response.data;
    },
  },

  jobs: {
    search: async (params?: {
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

    getById: async (id: number): Promise<Job> => {
      const response = await apiClient.get<Job>(`/public/jobs/${id}`);
      return response.data;
    },
  },
};
