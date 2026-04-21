import apiClient from './client';
import type { Job } from './public';

export interface PersonProfile {
  id: number;
  userId: number;
  realName?: string | null;
  gender?: number | null;
  age?: number | null;
  phone?: string | null;
  education?: string | null;
  city?: string | null;
  targetCity?: string | null;
  expectedSalary?: number | null;
}

export interface SkillGraph {
  personId?: number;
  skills?: string[];
  success?: boolean;
  mock?: boolean;
}

export interface MatchScoreDetail {
  total: number;
  skillScore: number;
  expScore: number;
  cityScore: number;
  eduScore: number;
  salScore: number;
}

export interface PersonMatchDetail {
  matchId: number;
  resumeId: number;
  jobId: number;
  score?: MatchScoreDetail | null;
  level?: string | null;
  matchReason?: string | null;
  isRead?: boolean;
  job?: {
    id: number;
    title?: string | null;
    companyName?: string | null;
  } | null;
}

export interface Application {
  id: number;
  jobId: number;
  jobTitle?: string;
  companyName?: string;
  status: string;
  matchScore?: number;
  appliedAt: string;
  resumeId?: number;
}

export interface FavoriteJob extends Job {
  favoriteId: number;
  favoritedAt: string;
}

export const personApi = {
  getProfile: async (): Promise<PersonProfile | null> => {
    const response = await apiClient.get<PersonProfile | null>('/person/info');
    return response.data;
  },

  updateProfile: async (data: Partial<PersonProfile>): Promise<void> => {
    await apiClient.put('/person/info', data);
  },

  getGraph: async (): Promise<SkillGraph> => {
    const response = await apiClient.get<SkillGraph>('/person/graph');
    return response.data;
  },

  getRecommendJobs: async (params?: { page?: number; size?: number }): Promise<{ list: Job[]; total: number; page: number; size: number }> => {
    const response = await apiClient.get('/person/recommend/jobs', { params });
    return response.data;
  },

  getMatchDetail: async (jobId: number): Promise<PersonMatchDetail> => {
    const response = await apiClient.get<PersonMatchDetail>(`/person/match/${jobId}`);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/person/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAvatar: async (): Promise<{ avatarUrl: string }> => {
    const response = await apiClient.get('/person/avatar');
    return response.data;
  },

  apply: async (jobId: number): Promise<{ applicationId: number }> => {
    const response = await apiClient.post('/person/applications', { jobId });
    return response.data;
  },

  getApplications: async (params?: { page?: number; size?: number; status?: string }): Promise<{ list: Application[]; total: number; page: number; size: number }> => {
    const response = await apiClient.get('/person/applications', { params });
    return response.data;
  },

  getApplication: async (id: number): Promise<Application> => {
    const response = await apiClient.get<Application>(`/person/applications/${id}`);
    return response.data;
  },

  withdrawApplication: async (id: number): Promise<void> => {
    await apiClient.put(`/person/applications/${id}/withdraw`);
  },

  addFavorite: async (jobId: number): Promise<void> => {
    await apiClient.post('/person/favorites', { jobId });
  },

  removeFavorite: async (jobId: number): Promise<void> => {
    await apiClient.delete(`/person/favorites/${jobId}`);
  },

  getFavorites: async (params?: { page?: number; size?: number }): Promise<{ list: FavoriteJob[]; total: number; page: number; size: number }> => {
    const response = await apiClient.get('/person/favorites', { params });
    return response.data;
  },
};
