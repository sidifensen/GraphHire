import apiClient from './client';

// ============ Interfaces ============

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

export interface CompanyStaff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'HR' | 'VIEWER';
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
}

export interface Job {
  id: number;
  title: string;
  companyId: number;
  companyName: string;
  companyLogo?: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  city: string;
  district?: string;
  requiredSkills: string[];
  experience: string;
  education: string;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  status: 'DRAFT' | 'PUBLISHED' | 'OFFLINE';
  viewCount: number;
  applyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  city: string;
  district?: string;
  requiredSkills: string[];
  experience: string;
  education: string;
  jobType: string;
}

export interface Candidate {
  id: number;
  name: string;
  avatar?: string;
  city: string;
  education: string;
  workYears: number;
  matchScore: number;
  skillTags: string[];
  latestResumeId: number;
}

export interface CandidateDetail {
  id: number;
  name: string;
  avatar?: string;
  email: string;
  phone: string;
  city: string;
  education: string;
  school?: string;
  workYears: number;
  currentPosition?: string;
  currentCompany?: string;
  skillTags: string[];
  resumeUrl?: string;
  matchAnalysis: {
    overall: number;
    skill: number;
    experience: number;
    salary: number;
    location: number;
  };
  missingSkills: string[];
  interviewQuestions: string[];
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

export interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  applicantId: number;
  applicantName: string;
  applicantAvatar?: string;
  resumeId: number;
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
  applyTime: string;
  updateTime: string;
}

export interface Interview {
  id: number;
  applicationId: number;
  interviewTime: string;
  interviewType: 'ONLINE' | 'OFFLINE' | 'PHONE';
  location?: string;
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface TalentPoolResume {
  resumeId: number;
  candidateName: string;
  candidateAvatar?: string;
  education: string;
  workYears: number;
  skillTags: string[];
  addedTime: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

export interface MatchResult {
  resumeId: number;
  jobId: number;
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  salaryScore: number;
  locationScore: number;
  missingSkills: string[];
  matchAnalysis: string;
}

// ============ Public APIs ============

export const publicCompanyApi = {
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
};

// ============ Authenticated Company APIs ============

export const companyApi = {
  // --- Company Info (current session) ---
  getInfo: async (): Promise<Company> => {
    const response = await apiClient.get<Company>('/company/info');
    return response.data;
  },

  updateInfo: async (data: Partial<Company>): Promise<void> => {
    await apiClient.put('/company/info', data);
  },

  // --- Company Auth ---
  auth: async (data: { authCode: string }): Promise<void> => {
    await apiClient.post('/company/auth', data);
  },

  // --- Job Management ---
  createJob: async (data: CreateJobRequest): Promise<{ jobId: number }> => {
    const response = await apiClient.post<{ jobId: number }>('/company/job', data);
    return response.data;
  },

  getJobList: async (params?: { status?: string }): Promise<Job[]> => {
    const response = await apiClient.get<Job[]>('/company/job/list', { params });
    return response.data;
  },

  getJobById: async (jobId: number): Promise<Job> => {
    const response = await apiClient.get<Job>(`/company/job/${jobId}`);
    return response.data;
  },

  updateJob: async (jobId: number, data: Partial<CreateJobRequest>): Promise<void> => {
    await apiClient.put(`/company/job/${jobId}`, data);
  },

  updateJobStatus: async (jobId: number, status: string): Promise<void> => {
    await apiClient.put(`/company/job/${jobId}/status`, { status });
  },

  publishJob: async (jobId: number): Promise<void> => {
    await apiClient.post(`/company/job/${jobId}/publish`);
  },

  closeJob: async (jobId: number): Promise<void> => {
    await apiClient.post(`/company/job/${jobId}/close`);
  },

  updateJobSalary: async (jobId: number, data: { salaryMin: number; salaryMax: number }): Promise<void> => {
    await apiClient.put(`/company/job/${jobId}/salary`, data);
  },

  deleteJob: async (jobId: number): Promise<void> => {
    await apiClient.delete(`/company/job/${jobId}`);
  },

  parseJob: async (jobId: number): Promise<void> => {
    await apiClient.post(`/company/job/${jobId}/parse`);
  },

  getJobGraph: async (jobId: number): Promise<JobGraph> => {
    const response = await apiClient.get<JobGraph>(`/company/job/${jobId}/graph`);
    return response.data;
  },

  // --- Match & Recommend ---
  matchResume: async (resumeId: number, jobId: number): Promise<MatchResult> => {
    const response = await apiClient.get<MatchResult>(`/company/match/${resumeId}`, {
      params: { jobId },
    });
    return response.data;
  },

  getRecommendedResumes: async (params?: { minMatchScore?: number }): Promise<Candidate[]> => {
    const response = await apiClient.get<Candidate[]>('/company/recommend/resumes', { params });
    return response.data;
  },

  getCandidateDetail: async (candidateId: number): Promise<CandidateDetail> => {
    const response = await apiClient.get<CandidateDetail>(`/company/candidate/${candidateId}`);
    return response.data;
  },

  // --- Company CRUD (admin) ---
  createCompany: async (data: Partial<Company>): Promise<{ companyId: number }> => {
    const response = await apiClient.post<{ companyId: number }>('/company/create', data);
    return response.data;
  },

  updateCompany: async (companyId: number, data: Partial<Company>): Promise<void> => {
    await apiClient.put(`/company/${companyId}`, data);
  },

  getCompanyById: async (companyId: number): Promise<Company> => {
    const response = await apiClient.get<Company>(`/company/${companyId}`);
    return response.data;
  },

  // --- Staff Management ---
  getStaffList: async (companyId: number): Promise<CompanyStaff[]> => {
    const response = await apiClient.get<CompanyStaff[]>(`/company/${companyId}/staff`);
    return response.data;
  },

  addStaff: async (companyId: number, data: { name: string; email: string; role: string }): Promise<void> => {
    await apiClient.post(`/company/${companyId}/staff`, data);
  },

  updateStaffRole: async (staffId: number, role: string): Promise<void> => {
    await apiClient.put(`/company/staff/${staffId}/role`, { role });
  },

  disableStaff: async (staffId: number): Promise<void> => {
    await apiClient.put(`/company/staff/${staffId}/disable`);
  },

  createStaff: async (data: { name: string; email: string; role: string }): Promise<void> => {
    await apiClient.post('/company/staff/create', data);
  },

  resetStaffPassword: async (staffId: number): Promise<{ newPassword: string }> => {
    const response = await apiClient.post<{ newPassword: string }>(`/company/staff/${staffId}/reset-password`);
    return response.data;
  },

  // --- Applications ---
  getApplications: async (params?: {
    jobId?: number;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PageResult<Application>> => {
    const response = await apiClient.get<PageResult<Application>>('/company/applications', { params });
    return response.data;
  },

  getApplicationById: async (applicationId: number): Promise<Application> => {
    const response = await apiClient.get<Application>(`/company/applications/${applicationId}`);
    return response.data;
  },

  updateApplicationStatus: async (applicationId: number, status: string): Promise<void> => {
    await apiClient.put(`/company/applications/${applicationId}/status`, { status });
  },

  scheduleInterview: async (
    applicationId: number,
    data: { interviewTime: string; interviewType: string; location?: string; notes?: string }
  ): Promise<Interview> => {
    const response = await apiClient.post<Interview>(`/company/applications/${applicationId}/interview`, data);
    return response.data;
  },

  rejectApplication: async (applicationId: number, reason?: string): Promise<void> => {
    await apiClient.post(`/company/applications/${applicationId}/reject`, { reason });
  },

  acceptApplication: async (applicationId: number): Promise<void> => {
    await apiClient.post(`/company/applications/${applicationId}/accept`);
  },

  // --- Talent Pool ---
  addToTalentPool: async (resumeId: number): Promise<void> => {
    await apiClient.post('/company/talent-pool', { resumeId });
  },

  getTalentPool: async (): Promise<TalentPoolResume[]> => {
    const response = await apiClient.get<TalentPoolResume[]>('/company/talent-pool');
    return response.data;
  },

  removeFromTalentPool: async (resumeId: number): Promise<void> => {
    await apiClient.delete(`/company/talent-pool/${resumeId}`);
  },
};
