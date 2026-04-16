import { apiRequest } from './request';

export interface CompanyInfo {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  scale: string;
  authStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Job {
  id: string;
  title: string;
  status: 'OPEN' | 'CLOSED';
  salaryMin: number;
  salaryMax: number;
  city: string;
  education: string;
  experience: string;
  skills: string[];
  resumeCount: number;
  matchCount: number;
}

export interface Candidate {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  experience: string;
  education: string;
  city: string;
  skills: string[];
  matchScore: number;
}

export interface MatchDetail {
  resumeId: string;
  jobId: string;
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  cityScore: number;
  skillDetails: { name: string; resumeLevel: number; required: number }[];
}

export const companyApi = {
  getInfo: () => apiRequest.get<CompanyInfo>('/company/info'),

  updateInfo: (data: Partial<CompanyInfo>) => apiRequest.put('/company/info', data),

  submitAuth: (data: FormData) =>
    apiRequest.post('/company/auth', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getJobList: (params?: { page?: number; size?: number; status?: string }) =>
    apiRequest.get<{ list: Job[]; total: number }>('/company/job/list', { params }),

  getJobDetail: (id: string) => apiRequest.get<Job>(`/company/job/${id}`),

  createJob: (data: Omit<Job, 'id' | 'resumeCount' | 'matchCount'>) =>
    apiRequest.post('/company/job', data),

  updateJob: (id: string, data: Partial<Job>) =>
    apiRequest.put(`/company/job/${id}`, data),

  publishJob: (id: string) => apiRequest.post(`/company/job/${id}/publish`),

  closeJob: (id: string) => apiRequest.post(`/company/job/${id}/close`),

  getRecommendResumes: (params?: { jobId?: string; page?: number; size?: number }) =>
    apiRequest.get<{ list: Candidate[]; total: number }>('/company/recommend/resumes', { params }),

  getMatchDetail: (resumeId: string) =>
    apiRequest.get<MatchDetail>(`/company/match/${resumeId}`),
};
