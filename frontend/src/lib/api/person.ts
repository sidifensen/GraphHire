import apiClient from './client';
import type { Job } from './public';
import { getApiBaseUrl } from './base-url';

const API_BASE_URL = getApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

function toAbsoluteAvatarUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export interface PersonProfile {
  id: number;
  userId: number;
  realName?: string | null;
  gender?: number | null;
  age?: number | null;
  phone?: string | null;
  email?: string | null;
  education?: string | null;
  school?: string | null;
  city?: string | null;
  targetCity?: string | null;
  expectedSalary?: number | null;
  avatarUrl?: string | null;
}

export interface SkillGraph {
  personId?: number;
  realName?: string | null;
  avatarUrl?: string | null;
  skills?: string[];
  success?: boolean;
  mock?: boolean;
}

export interface AbilityAssessment {
  totalScore: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  skillCount: number;
  dimensions: {
    breadth: number;
    depth: number;
    structure: number;
    freshness: number;
    rarity: number;
  };
  evaluatedAt?: string;
}

export interface MatchScoreDetail {
  total: number;
  skillScore: number;
  requirementScore: number;
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

export interface Favorite {
  id: number;
  userId: number;
  jobId: number;
  createdAt: string;
}

export const personApi = {
  getProfile: async (): Promise<PersonProfile | null> => {
    const response = await apiClient.get<PersonProfile | null>('/person/info');
    if (!response.data) {
      return response.data;
    }
    return {
      ...response.data,
      avatarUrl: toAbsoluteAvatarUrl(response.data.avatarUrl),
    };
  },

  updateProfile: async (data: Partial<PersonProfile>): Promise<void> => {
    await apiClient.put('/person/info', data);
  },

  getGraph: async (): Promise<SkillGraph> => {
    const response = await apiClient.get<SkillGraph>('/person/graph');
    return response.data;
  },

  getAbilityAssessment: async (): Promise<AbilityAssessment> => {
    const response = await apiClient.get<AbilityAssessment>('/person/ability-assessment');
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

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<string>('/person/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return toAbsoluteAvatarUrl(response.data) ?? '';
  },

  getAvatar: async (): Promise<string | null> => {
    const response = await apiClient.get<string | null>('/person/avatar');
    return toAbsoluteAvatarUrl(response.data);
  },

  getFavorites: async (): Promise<Favorite[]> => [],
};

