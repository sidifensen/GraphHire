import apiClient from './client';

export interface AdminDashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  todayNewUsers: number;
  todayNewJobs: number;
  pendingCompanyAudit: number;
  pendingResumeParse: number;
}

export interface CompanyAuditItem {
  id: number;
  companyName: string;
  unifiedSocialCreditCode: string;
  legalPerson: string;
  phone: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface UserItem {
  id: number;
  username: string;
  email: string;
  type: 'PERSON' | 'COMPANY' | 'ADMIN';
  status: 'ACTIVE' | 'DISABLED' | 'LOCKED';
  createdAt: string;
  lastLoginAt?: string;
}

export interface SkillTag {
  id: number;
  name: string;
  category: string;
  synonyms: string[];
  jobCount: number;
}

export interface ParseTask {
  id: number;
  resumeId: number;
  fileName: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export const adminApi = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  // Company Audit
  getPendingCompanies: async (): Promise<CompanyAuditItem[]> => {
    const response = await apiClient.get('/admin/company/audit/pending');
    return response.data;
  },

  approveCompany: async (companyId: number): Promise<void> => {
    await apiClient.put(`/admin/company/${companyId}/approve`);
  },

  rejectCompany: async (companyId: number, reason: string): Promise<void> => {
    await apiClient.put(`/admin/company/${companyId}/reject`, { reason });
  },

  // User Management
  getUsers: async (params?: { type?: string; status?: string; page?: number }): Promise<{ list: UserItem[]; total: number }> => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  disableUser: async (userId: number): Promise<void> => {
    await apiClient.put(`/admin/user/${userId}/disable`);
  },

  enableUser: async (userId: number): Promise<void> => {
    await apiClient.put(`/admin/user/${userId}/enable`);
  },

  // Skill Tags
  getSkillTags: async (): Promise<SkillTag[]> => {
    const response = await apiClient.get('/skill-tags');
    return response.data;
  },

  createSkillTag: async (data: { name: string; category: string }): Promise<{ id: number }> => {
    const response = await apiClient.post('/skill-tags', data);
    return response.data;
  },

  updateSkillTag: async (id: number, data: { name?: string; category?: string }): Promise<void> => {
    await apiClient.put(`/skill-tags/${id}`, data);
  },

  deleteSkillTag: async (id: number): Promise<void> => {
    await apiClient.delete(`/skill-tags/${id}`);
  },

  // Task Monitoring
  getParseTasks: async (params?: { status?: string; page?: number }): Promise<{ list: ParseTask[]; total: number }> => {
    const response = await apiClient.get('/admin/tasks/parse', { params });
    return response.data;
  },
};
