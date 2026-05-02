import apiClient from './client';

export interface Company {
  id: number;
  name: string;
  city?: string | null;
  jobCount?: number;
  summary?: string;
  authStatus?: string;
}

export interface Job {
  id: number;
  companyId: number;
  companyName?: string;
  title: string;
  city?: string | null;
  district?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryUnit?: string | null;
  requiredSkills?: string[];
  description?: string | null;
  experience?: string | null;
  educationCode?: number | null;
  positionTypeId?: number | null;
  jobType?: number | null;
  publishedAt?: string | null;
}

export interface PublicTreeNode {
  id: number;
  name: string;
  parentId?: number | null;
  level?: number | null;
  children: PublicTreeNode[];
}

export interface BackendPageResult<T> {
  records: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface HomeOverviewResponse {
  featuredJobs: Job[];
  popularCompanies: Company[];
  hotCities: string[];
}

export const publicApi = {
  home: {
    getOverview: async (): Promise<HomeOverviewResponse> => {
      const response = await apiClient.get<HomeOverviewResponse>('/public/home');
      return response.data;
    },
  },

  companies: {
    search: async (params?: {
      keyword?: string;
      page?: number;
      size?: number;
    }): Promise<BackendPageResult<Company>> => {
      const response = await apiClient.get<BackendPageResult<Company>>('/public/companies', { params });
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
      companyId?: number;
      city?: string;
      cityList?: string[];
      salaryMin?: number;
      salaryMax?: number;
      skills?: string[];
      positionTypeLeafIds?: number[];
      industryLeafIds?: number[];
      jobType?: number;
      educationCode?: number;
      companyScaleCode?: string;
      sortBy?: 'createTime' | 'salary';
      page?: number;
      size?: number;
    }): Promise<BackendPageResult<Job>> => {
      const response = await apiClient.get<BackendPageResult<Job>>('/public/jobs', { params });
      return response.data;
    },

    getPositionTypeTree: async (): Promise<PublicTreeNode[]> => {
      const response = await apiClient.get<PublicTreeNode[]>('/public/position-types/tree');
      return response.data;
    },

    getIndustryTree: async (): Promise<PublicTreeNode[]> => {
      const response = await apiClient.get<PublicTreeNode[]>('/public/industries/tree');
      return response.data;
    },

    getById: async (id: number): Promise<Job> => {
      const response = await apiClient.get<Job>(`/public/jobs/${id}`);
      return response.data;
    },
  },
};
