import apiClient from './client';
import type {
  EnterpriseCreateStaffRequest,
  EnterpriseCreateJobRequest,
  EnterpriseUpdateJobRequest,
  EnterpriseDashboard,
  EnterpriseJobDetail,
  EnterpriseJobListItem,
  EnterpriseRecommendation,
  EnterpriseStaffListItem,
  EnterpriseStaffStats,
} from '@/lib/types/enterprise';

export interface Company {
  id: number;
  name: string;
  logo?: string;
  avatarUrl?: string;
  unifiedSocialCreditCode?: string;
  description?: string;
  website?: string;
  city?: string;
  industryId?: number;
  industryName?: string;
  employeeCount?: string;
  scale?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  authStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt?: string;
}

export interface CompanyProfileUpdateRequest {
  name?: string;
  contactName?: string;
  contactPhone?: string;
  description?: string;
  website?: string;
  industryId: number;
  scale?: string;
  address?: string;
}

export interface IndustryOption {
  id: number;
  name: string;
  parentId?: number | null;
  level?: number;
  enabled: number;
  sort: number;
  children?: IndustryOption[];
}

export const companyApi = {
  getInfo: async (): Promise<Company> => {
    const response = await apiClient.get<Company>('/company/info');
    return response.data;
  },

  listIndustryOptions: async (): Promise<IndustryOption[]> => {
    const response = await apiClient.get<IndustryOption[]>('/company/industry/options');
    return response.data;
  },

  updateProfile: async (data: CompanyProfileUpdateRequest): Promise<void> => {
    await apiClient.put('/company/profile', data);
  },

  getDashboard: async (): Promise<EnterpriseDashboard> => {
    const response = await apiClient.get<EnterpriseDashboard>('/company/dashboard');
    return response.data;
  },

  getJobList: async (params?: { status?: string; keyword?: string }): Promise<EnterpriseJobListItem[]> => {
    const response = await apiClient.get<EnterpriseJobListItem[]>('/company/job/list', { params });
    return response.data;
  },

  getJobDetail: async (jobId: number): Promise<EnterpriseJobDetail> => {
    const response = await apiClient.get<EnterpriseJobDetail>(`/company/job/${jobId}`);
    return response.data;
  },

  createJob: async (data: EnterpriseCreateJobRequest): Promise<number> => {
    const response = await apiClient.post<number>('/company/job', data);
    return response.data;
  },

  publishJob: async (jobId: number): Promise<void> => {
    await apiClient.post(`/company/job/${jobId}/publish`);
  },

  closeJob: async (jobId: number): Promise<void> => {
    await apiClient.post(`/company/job/${jobId}/close`);
  },

  updateJobStatus: async (jobId: number, publish: boolean): Promise<void> => {
    await apiClient.put(`/company/job/${jobId}/status`, { publish });
  },

  getRecommendedResumes: async (params?: { jobId?: number }): Promise<EnterpriseRecommendation[]> => {
    const response = await apiClient.get<EnterpriseRecommendation[]>('/company/recommend/resumes', { params });
    return response.data;
  },

  triggerJobMatch: async (jobId: number): Promise<void> => {
    await apiClient.post(`/company/job/${jobId}/match/trigger`);
  },

  matchResume: async (resumeId: number, jobId: number): Promise<EnterpriseRecommendation> => {
    const response = await apiClient.get<EnterpriseRecommendation>(`/company/match/${resumeId}`, { params: { jobId } });
    return response.data;
  },

  getStaffList: async (): Promise<EnterpriseStaffListItem[]> => {
    const response = await apiClient.get<EnterpriseStaffListItem[]>('/company/staff/list');
    return response.data;
  },

  updateJob: async (jobId: number, data: EnterpriseUpdateJobRequest): Promise<void> => {
    await apiClient.put(`/company/job/${jobId}`, data);
  },

  getPendingStaffList: async (): Promise<EnterpriseStaffListItem[]> => {
    const response = await apiClient.get<EnterpriseStaffListItem[]>('/company/staff/pending');
    return response.data;
  },

  getStaffStats: async (): Promise<EnterpriseStaffStats> => {
    const response = await apiClient.get<EnterpriseStaffStats>('/company/staff/stats');
    return response.data;
  },

  createStaff: async (data: EnterpriseCreateStaffRequest): Promise<void> => {
    await apiClient.post('/company/staff/create', data);
  },

  resetStaffPassword: async (staffId: number): Promise<{ newPassword: string }> => {
    const response = await apiClient.post<{ newPassword: string }>(`/company/staff/${staffId}/reset-password`);
    return response.data;
  },

  updateStaffStatus: async (staffId: number, disabled: boolean): Promise<void> => {
    await apiClient.put(`/company/staff/${staffId}/status`, null, { params: { disabled } });
  },

  approveJoinRequest: async (staffId: number): Promise<void> => {
    await apiClient.post(`/company/staff/${staffId}/approve-join`);
  },

  rejectJoinRequest: async (staffId: number): Promise<void> => {
    await apiClient.post(`/company/staff/${staffId}/reject-join`);
  },
};
