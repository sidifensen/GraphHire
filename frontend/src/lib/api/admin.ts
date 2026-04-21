import apiClient from './client';

// ============ Admin Login ============
export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  userType: 'PERSON' | 'COMPANY' | 'ADMIN';
  userId: number;
}

// ============ Dashboard & Statistics ============
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

export interface AdminStatistics {
  userCount: number;
  companyCount: number;
  jobCount: number;
  applicationCount: number;
  resumeCount: number;
  activeUserCount: number;
  activeCompanyCount: number;
  newUsersToday: number;
  newCompaniesToday: number;
  newJobsToday: number;
  newApplicationsToday: number;
}

// ============ Company Auth ============
export interface CompanyAuthItem {
  id: number;
  companyId: number;
  companyName: string;
  unifiedSocialCreditCode: string;
  legalPerson: string;
  phone: string;
  businessLicenseUrl?: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
  reviewerId?: number;
  rejectReason?: string;
}

// ============ User Management ============
export interface UserItem {
  id: number;
  username: string;
  email: string;
  phone?: string;
  type: 'PERSON' | 'COMPANY' | 'ADMIN';
  status: 'ACTIVE' | 'DISABLED' | 'LOCKED';
  createdAt: string;
  lastLoginAt?: string;
  avatarUrl?: string;
}

export interface UserListResponse {
  list: UserItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ============ Resume Management ============
export interface ResumeListItem {
  id: number;
  userId: number;
  userName: string;
  fileName: string;
  parseStatus: 'PENDING' | 'PARSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  parsedAt?: string;
}

// ============ Job Management ============
export interface JobListItem {
  id: number;
  companyId: number;
  companyName: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  viewCount: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobListResponse {
  list: JobListItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ============ Task Management ============
export interface TaskListItem {
  id: number;
  type: 'RESUME_PARSE' | 'JOB_MATCH' | 'IMPORT';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  total: number;
  successCount: number;
  failCount: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface TaskListResponse {
  list: TaskListItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ============ Batch Operations ============
export interface BatchApproveRequest {
  ids: number[];
}

export interface BatchRejectRequest {
  ids: number[];
  reason: string;
}

export interface BatchDisableRequest {
  userIds: number[];
}

export interface BatchRetryRequest {
  taskIds: number[];
}

// ============ API ============
export const adminApi = {
  // ---- Admin Login ----
  login: async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await apiClient.post('/admin/login', data);
    return response.data;
  },

  // ---- Dashboard & Statistics ----
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  getStatistics: async (): Promise<AdminStatistics> => {
    const response = await apiClient.get('/admin/statistics');
    return response.data;
  },

  // ---- Company Auth ----
  getCompanyAuthList: async (params?: { status?: string; page?: number }): Promise<{ list: CompanyAuthItem[]; total: number }> => {
    const response = await apiClient.get('/admin/company/auth-list', { params });
    return response.data;
  },

  getCompanyAuth: async (id: number): Promise<CompanyAuthItem> => {
    const response = await apiClient.get(`/admin/company/auth/${id}`);
    return response.data;
  },

  updateCompanyAuth: async (id: number, data: { status: 'APPROVED' | 'REJECTED'; rejectReason?: string }): Promise<void> => {
    await apiClient.put(`/admin/company/auth/${id}`, data);
  },

  getPendingCompanies: async (): Promise<CompanyAuthItem[]> => {
    const response = await apiClient.get('/admin/company/pending');
    return response.data;
  },

  approveCompany: async (companyId: number): Promise<void> => {
    await apiClient.post(`/admin/company/${companyId}/approve`);
  },

  rejectCompany: async (companyId: number, reason: string): Promise<void> => {
    await apiClient.post(`/admin/company/${companyId}/reject`, { reason });
  },

  // ---- User Management ----
  getUserList: async (params?: { type?: string; status?: string; page?: number; pageSize?: number }): Promise<UserListResponse> => {
    const response = await apiClient.get('/admin/user/list', { params });
    return response.data;
  },

  updateUserStatus: async (userId: number, status: 'ACTIVE' | 'DISABLED' | 'LOCKED'): Promise<void> => {
    await apiClient.put(`/admin/user/${userId}/status`, { status });
  },

  disableUser: async (userId: number): Promise<void> => {
    await apiClient.post(`/admin/user/disable`, { userId });
  },

  // ---- Resume Management ----
  getResumeList: async (params?: { parseStatus?: string; page?: number; pageSize?: number }): Promise<{ list: ResumeListItem[]; total: number }> => {
    const response = await apiClient.get('/admin/resume/list', { params });
    return response.data;
  },

  // ---- Job Management ----
  getJobList: async (params?: { status?: string; page?: number; pageSize?: number }): Promise<JobListResponse> => {
    const response = await apiClient.get('/admin/job/list', { params });
    return response.data;
  },

  // ---- Skill Management ----
  getSkillList: async (params?: { category?: string; page?: number; pageSize?: number }): Promise<{ list: SkillTagItem[]; total: number }> => {
    const response = await apiClient.get('/admin/skill/list', { params });
    return response.data;
  },

  // ---- Task Management ----
  getTaskList: async (params?: { type?: string; status?: string; page?: number; pageSize?: number }): Promise<TaskListResponse> => {
    const response = await apiClient.get('/admin/task/list', { params });
    return response.data;
  },

  retryTask: async (taskId: number): Promise<void> => {
    await apiClient.post(`/admin/task/${taskId}/retry`);
  },

  // ---- Batch Operations ----
  batchApproveCompanies: async (data: BatchApproveRequest): Promise<void> => {
    await apiClient.post('/admin/company/batch/approve', data);
  },

  batchRejectCompanies: async (data: BatchRejectRequest): Promise<void> => {
    await apiClient.post('/admin/company/batch/reject', data);
  },

  batchDisableUsers: async (data: BatchDisableRequest): Promise<void> => {
    await apiClient.post('/admin/user/batch/disable', data);
  },

  batchRetryTasks: async (data: BatchRetryRequest): Promise<void> => {
    await apiClient.post('/admin/task/batch/retry', data);
  },
};

// ============ Skill Tags (deprecated - use skillTag.ts) ============
export interface SkillTagItem {
  id: number;
  name: string;
  category: string;
  synonyms: string[];
  jobCount: number;
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
