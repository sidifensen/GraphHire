import apiClient from './client';
import type {
  EnterpriseCreateStaffRequest,
  EnterpriseCreateJobRequest,
  EnterpriseDashboard,
  EnterpriseJobListItem,
  EnterpriseRecommendation,
  EnterpriseStaffListItem,
  EnterpriseStaffStats,
} from '@/lib/types/enterprise';

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
  createdAt?: string;
}

export interface JobGraph {
  nodes: Array<{
    id: string;
    type: string;
    name: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    type: string;
  }>;
}

export const companyApi = {
  getInfo: async (): Promise<Company> => {
    const response = await apiClient.get<Company>('/company/info');
    return response.data;
  },

  getDashboard: async (): Promise<EnterpriseDashboard> => {
    const response = await apiClient.get<EnterpriseDashboard>('/company/dashboard');
    return response.data;
  },

  getJobList: async (params?: { status?: string; keyword?: string }): Promise<EnterpriseJobListItem[]> => {
    const response = await apiClient.get<EnterpriseJobListItem[]>('/company/job/list', { params });
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

  parseJob: async (jobId: number): Promise<void> => {
    await apiClient.post(`/company/job/${jobId}/parse`);
  },

  getJobGraph: async (jobId: number): Promise<JobGraph> => {
    const response = await apiClient.get<JobGraph>(`/company/job/${jobId}/graph`);
    return response.data;
  },

  getRecommendedResumes: async (params?: { jobId?: number }): Promise<EnterpriseRecommendation[]> => {
    const response = await apiClient.get<EnterpriseRecommendation[]>('/company/recommend/resumes', { params });
    return response.data;
  },

  matchResume: async (resumeId: number, jobId: number): Promise<EnterpriseRecommendation> => {
    const response = await apiClient.get<EnterpriseRecommendation>(`/company/match/${resumeId}`, { params: { jobId } });
    return response.data;
  },

  getStaffList: async (): Promise<EnterpriseStaffListItem[]> => {
    const response = await apiClient.get<EnterpriseStaffListItem[]>('/company/staff/list');
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

  inviteInterview: async (data: { resumeId: number; jobId: number; interviewTime?: string; location?: string; remark?: string }): Promise<void> => {
    await apiClient.post('/company/applications/interview-invite', data);
  },
};
