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

// ============ Dashboard ============
export interface DashboardTrendPoint {
  date: string;
  activeUsers: number;
  newData: number;
}
export type DashboardTrendDimension = 'DAY' | 'WEEK' | 'MONTH';

export interface AdminActiveOverview {
  activeUserCount: number;
  taskSuccessRate: number;
  matchCount: number;
}

export interface AdminTodoItem {
  type: string;
  title: string;
  description: string;
  actionText: string;
  actionPath: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  count: number;
  updatedAt: string;
}

export interface AdminHotSkillItem {
  name: string;
  heat: number;
  count: number;
}

export interface AdminSystemActivityItem {
  type: string;
  actor?: string;
  action: string;
  target?: string;
  detail?: string;
  createdAt: string;
  level: 'INFO' | 'MEDIUM' | 'HIGH' | string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalResumes: number;
  totalJobs: number;
  dailyActiveUsers: number;
  todayNewUsers: number;
  todayNewJobs: number;
  pendingCompanyAudit: number;
  pendingTaskCount: number;
  failedTaskCount: number;
  matchCount: number;
  taskSuccessRate: number;
  userGrowthRate: number;
  companyGrowthRate: number;
  resumeGrowthRate: number;
  jobGrowthRate: number;
  matchGrowthRate: number;
  matchConversionRate: number;
  weeklyNewCompanies: number;
  pendingSkillSuggestions: number;
  updatedAt: string;
  trend: DashboardTrendPoint[];
  activeOverview?: AdminActiveOverview;
  todos?: AdminTodoItem[];
  hotSkills?: AdminHotSkillItem[];
  systemActivities?: AdminSystemActivityItem[];
}

// ============ Company Auth ============
export interface CompanyAuthItem {
  id: number;
  companyId: number;
  companyName: string;
  unifiedSocialCreditCode: string;
  industry?: string;
  scale?: string;
  address?: string;
  contact?: string;
  legalPerson: string;
  phone: string;
  businessLicenseUrl?: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
  reviewerId?: number;
  rejectReason?: string;
}

export interface CompanyAuthListResponse {
  list: CompanyAuthItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ============ User Management ============
export interface UserItem {
  id: number;
  username: string;
  realName?: string;
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

// ============ User Detail ============
export interface PersonInfoDetail {
  id: number;
  userId: number;
  realName: string;
  gender: number; // 0=未知, 1=男, 2=女
  age: number;
  phone: string;
  email: string;
  education: string;
  city: string;
  targetCity: string;
  expectedSalary: number | null;
}

export interface UserDetailResponse {
  user: UserItem;
  personInfo: PersonInfoDetail | null;
}

// ============ Skill ============
export interface SkillTagItem {
  id: number;
  name: string;
  category: string | null;
  synonyms: string[] | null;
  jobCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillListResponse {
  list: SkillTagItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ============ Task ============
export interface TaskListItem {
  id: number;
  sourceId: number;
  type: 'RESUME_PARSE';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  total: number;
  successCount: number;
  failCount: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt?: string;
  errorMessage?: string;
}

export interface TaskSummary {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface TaskListResponse {
  summary: TaskSummary;
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

export interface AdminSkillTagUpsertRequest {
  name: string;
  description?: string;
  category?: string;
  synonyms?: string[];
}

export interface AdminSettings {
  allowRegister: boolean;
  maintenanceMode: boolean;
  maxUploadSizeMb: number;
}

export const adminApi = {
  login: async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await apiClient.post('/admin/login', data);
    return response.data;
  },

  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  getDashboardTrend: async (dimension: DashboardTrendDimension): Promise<DashboardTrendPoint[]> => {
    const response = await apiClient.get('/admin/dashboard/trend', { params: { dimension } });
    return response.data;
  },

  getCompanyAuthList: async (params?: { status?: string; keyword?: string; page?: number; pageSize?: number }): Promise<CompanyAuthListResponse> => {
    const response = await apiClient.get('/admin/company/auth-list', { params });
    return response.data;
  },

  updateCompanyAuth: async (id: number, data: { status: 'APPROVED' | 'REJECTED'; rejectReason?: string }): Promise<void> => {
    await apiClient.put(`/admin/company/auth/${id}`, data);
  },

  getUserList: async (params?: { type?: string; status?: string; keyword?: string; page?: number; pageSize?: number }): Promise<UserListResponse> => {
    const response = await apiClient.get('/admin/user/list', { params });
    return response.data;
  },

  updateUserStatus: async (userId: number, status: 'ACTIVE' | 'DISABLED' | 'LOCKED'): Promise<void> => {
    await apiClient.put(`/admin/user/${userId}/status`, { status });
  },

  getUserDetail: async (userId: number): Promise<UserDetailResponse> => {
    const response = await apiClient.get(`/admin/user/${userId}/detail`);
    return response.data;
  },

  getSkillList: async (params?: { category?: string; keyword?: string; page?: number; pageSize?: number }): Promise<SkillListResponse> => {
    const response = await apiClient.get('/admin/skill/list', { params });
    return response.data;
  },

  createSkillTag: async (data: AdminSkillTagUpsertRequest): Promise<SkillTagItem> => {
    const response = await apiClient.post('/admin/skill-tags', data);
    return response.data;
  },

  updateSkillTag: async (id: number, data: AdminSkillTagUpsertRequest): Promise<SkillTagItem> => {
    const response = await apiClient.put(`/admin/skill-tags/${id}`, data);
    return response.data;
  },

  deleteSkillTag: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/skill-tags/${id}`);
  },

  addSkillTagSynonym: async (id: number, synonym: string): Promise<SkillTagItem> => {
    const response = await apiClient.post(`/admin/skill-tags/${id}/synonyms`, null, { params: { synonym } });
    return response.data;
  },

  removeSkillTagSynonym: async (id: number, synonym: string): Promise<void> => {
    await apiClient.delete(`/admin/skill-tags/${id}/synonyms/${encodeURIComponent(synonym)}`);
  },

  getTaskList: async (params?: { type?: string; status?: string; page?: number; pageSize?: number }): Promise<TaskListResponse> => {
    const response = await apiClient.get('/admin/task/list', { params });
    return response.data;
  },

  retryTask: async (taskId: number): Promise<void> => {
    await apiClient.post(`/admin/task/${taskId}/retry`);
  },

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

  getSettings: async (): Promise<AdminSettings> => {
    const response = await apiClient.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (data: Partial<AdminSettings>): Promise<AdminSettings> => {
    const response = await apiClient.put('/admin/settings', data);
    return response.data;
  },
};
