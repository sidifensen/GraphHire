import apiClient from './client';

export interface Company {
  id: number;
  name: string;
  city?: string | null;
  address?: string | null;
  unifiedSocialCreditCode?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  website?: string | null;
  jobCount?: number;
  summary?: string;
  description?: string | null;
  authStatus?: string;
  avatarUrl?: string | null;
  industryId?: number | null;
  industryName?: string | null;
  scale?: string | null;
}

export interface Job {
  id: number;
  companyId: number;
  companyName?: string;
  companyIndustryName?: string | null;
  companyScale?: string | null;
  companyAuthStatus?: string | null;
  companyAvatarUrl?: string | null;
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

export interface ProvinceCityItem {
  province: string;
  cities: string[];
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

export interface HotSearchItem {
  keyword: string;
  score: number;
}

const inFlightRequests = new Map<string, Promise<unknown>>();

function withInFlightDedupe<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const request = factory().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, request);
  return request;
}

function buildStableParamsKey(params?: Record<string, unknown>): string {
  if (!params) return '';
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(entries);
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
      industryLeafIds?: number[];
      companyScaleCode?: string;
      cityList?: string[];
      page?: number;
      size?: number;
    }): Promise<BackendPageResult<Company>> => {
      const response = await apiClient.get<BackendPageResult<Company>>('/public/companies', { params });
      return response.data;
    },

    getHotSearches: async (limit?: number): Promise<HotSearchItem[]> => {
      const response = await apiClient.get<HotSearchItem[]>('/public/companies/hot-searches', {
        params: { limit },
      });
      return response.data ?? [];
    },

    getById: async (id: number): Promise<Company> =>
      withInFlightDedupe(`GET:/public/companies/${id}`, async () => {
        const response = await apiClient.get<Company>(`/public/companies/${id}`);
        return response.data;
      }),
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
      const key = `GET:/public/jobs?${buildStableParamsKey(params as Record<string, unknown> | undefined)}`;
      return withInFlightDedupe(key, async () => {
        const response = await apiClient.get<BackendPageResult<Job>>('/public/jobs', { params });
        return response.data;
      });
    },

    getHotSearches: async (limit?: number): Promise<HotSearchItem[]> => {
      const response = await apiClient.get<HotSearchItem[]>('/public/jobs/hot-searches', {
        params: { limit },
      });
      return response.data ?? [];
    },

    getPositionTypeTree: async (): Promise<PublicTreeNode[]> => {
      return withInFlightDedupe('GET:/public/position-types/tree', async () => {
        const response = await apiClient.get<PublicTreeNode[]>('/public/position-types/tree');
        return response.data;
      });
    },

    getIndustryTree: async (): Promise<PublicTreeNode[]> => {
      return withInFlightDedupe('GET:/public/industries/tree', async () => {
        const response = await apiClient.get<PublicTreeNode[]>('/public/industries/tree');
        return response.data;
      });
    },

    getProvinceCities: async (): Promise<ProvinceCityItem[]> => {
      return withInFlightDedupe('GET:/public/geo/province-cities', async () => {
        const response = await apiClient.get<ProvinceCityItem[]>('/public/geo/province-cities');
        return response.data;
      });
    },

    getById: async (id: number): Promise<Job> => {
      const response = await apiClient.get<Job>(`/public/jobs/${id}`);
      return response.data;
    },
  },
};
