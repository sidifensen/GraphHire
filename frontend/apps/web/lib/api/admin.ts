import { apiRequest } from './request';

export interface DashboardStats {
  personUsers: number;
  companyUsers: number;
  resumes: number;
  jobs: number;
  pendingCompanies: number;
  userGrowth: { date: string; count: number }[];
}

export interface PersonUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'ACTIVE' | 'DISABLED';
  createTime: string;
}

export interface CompanyUser {
  id: string;
  name: string;
  industry: string;
  scale: string;
  authStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  jobCount: number;
  createTime: string;
}

export interface Resume {
  id: string;
  personName: string;
  jobTitle: string;
  parseStatus: 'PENDING' | 'PARSING' | 'SUCCESS' | 'FAILED';
  matchScore?: number;
  createTime: string;
}

export interface Job {
  id: string;
  title: string;
  companyName: string;
  salaryRange: string;
  status: 'OPEN' | 'CLOSED';
  candidateCount: number;
  createTime: string;
}

export interface SkillTag {
  id: string;
  name: string;
  category: string;
  useCount: number;
  isHot: boolean;
  status: 'ACTIVE' | 'DISABLED';
}

export interface ParseTask {
  id: string;
  type: string;
  fileName: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  progress: number;
  startTime: string;
  duration?: string;
}

export const adminApi = {
  getDashboardStats: () => apiRequest.get<DashboardStats>('/admin/dashboard/stats'),

  approveCompany: (id: string) => apiRequest.post(`/admin/company/${id}/approve`),

  rejectCompany: (id: string) => apiRequest.post(`/admin/company/${id}/reject`),

  getPendingCompanies: () =>
    apiRequest.get<{ list: CompanyUser[]; total: number }>('/admin/company/pending'),

  getCompanyAuthList: (status?: string) =>
    apiRequest.get<{ list: CompanyUser[]; total: number }>('/admin/company/auth-list', {
      params: { status },
    }),

  getPersonUsers: (params?: { page?: number; size?: number; keyword?: string }) =>
    apiRequest.get<{ list: PersonUser[]; total: number }>('/admin/user/list', {
      params: { ...params, type: 'PERSON' },
    }),

  getCompanyUsers: (params?: { page?: number; size?: number; keyword?: string }) =>
    apiRequest.get<{ list: CompanyUser[]; total: number }>('/admin/user/list', {
      params: { ...params, type: 'COMPANY' },
    }),

  disableUser: (id: string) => apiRequest.post('/admin/user/disable', { id }),

  updateUserStatus: (id: string, status: string) =>
    apiRequest.put(`/admin/user/${id}/status`, { status }),

  getResumes: (params?: { page?: number; size?: number; keyword?: string; parseStatus?: string }) =>
    apiRequest.get<{ list: Resume[]; total: number }>('/admin/resume/list', { params }),

  getJobs: (params?: { page?: number; size?: number; keyword?: string }) =>
    apiRequest.get<{ list: Job[]; total: number }>('/admin/job/list', { params }),

  getSkillTags: (params?: { page?: number; size?: number; keyword?: string }) =>
    apiRequest.get<{ list: SkillTag[]; total: number }>('/admin/skill/list', { params }),

  createSkillTag: (data: { name: string; category: string; isHot?: boolean }) =>
    apiRequest.post('/skill-tags', data),

  updateSkillTag: (id: string, data: Partial<SkillTag>) =>
    apiRequest.put(`/skill-tags/${id}`, data),

  deleteSkillTag: (id: string) => apiRequest.delete(`/skill-tags/${id}`),

  getTasks: (params?: { page?: number; size?: number }) =>
    apiRequest.get<{ list: ParseTask[]; total: number }>('/admin/task/list', { params }),

  retryTask: (id: string) => apiRequest.post(`/admin/task/${id}/retry`),
};
