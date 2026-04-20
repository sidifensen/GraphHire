import apiClient from './client';
import type { Job } from './public';

// ============ Interfaces ============

export interface PersonProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  birthday?: string;
  city?: string;
  education?: string;
  school?: string;
  workYears?: number;
  currentStatus?: string;
  expectedSalary?: number;
  expectedCity?: string;
  expectedPosition?: string;
  avatar?: string;
}

export interface SkillNode {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  x?: number;
  y?: number;
}

export interface SkillConnection {
  source: string;
  target: string;
  strength: number;
}

export interface SkillGraph {
  userId: string;
  skills: SkillNode[];
  connections: SkillConnection[];
}

export interface MatchScore {
  overall: number;
  skill: number;
  experience: number;
  salary: number;
  location: number;
  education: number;
  potential: number;
}

export interface MatchDetail {
  jobId: number;
  resumeId: number;
  matchScore: MatchScore;
  matchReasons: string[];
  skillComparison: {
    skill: string;
    required: string;
    actual: string;
    match: boolean;
  }[];
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

// ============ API ============

export const personApi = {
  // PersonController

  /** 获取当前用户信息（从 SESSION 获取，无需传 userId） */
  getProfile: async (): Promise<PersonProfile> => {
    const response = await apiClient.get<PersonProfile>('/person/info');
    return response.data;
  },

  /** 更新当前用户信息 */
  updateProfile: async (data: Partial<PersonProfile>): Promise<void> => {
    await apiClient.put('/person/info', data);
  },

  /** 获取当前用户的能力图谱 */
  getGraph: async (): Promise<SkillGraph> => {
    const response = await apiClient.get<SkillGraph>('/person/graph');
    return response.data;
  },

  /** 获取推荐职位列表 */
  getRecommendJobs: async (params?: {
    page?: number;
    size?: number;
  }): Promise<{ list: Job[]; total: number; page: number; size: number }> => {
    const response = await apiClient.get('/person/recommend/jobs', { params });
    return response.data;
  },

  /** 获取指定职位的匹配详情 */
  getMatchDetail: async (jobId: number): Promise<MatchDetail> => {
    const response = await apiClient.get<MatchDetail>(`/person/match/${jobId}`);
    return response.data;
  },

  // PersonAvatarController

  /** 上传头像 */
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/person/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** 获取头像 URL */
  getAvatar: async (): Promise<{ avatarUrl: string }> => {
    const response = await apiClient.get('/person/avatar');
    return response.data;
  },

  // PersonApplicationController

  /** 投递职位 */
  apply: async (jobId: number): Promise<{ applicationId: number }> => {
    const response = await apiClient.post('/person/applications', { jobId });
    return response.data;
  },

  /** 获取投递记录列表 */
  getApplications: async (params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<{ list: Application[]; total: number; page: number; size: number }> => {
    const response = await apiClient.get('/person/applications', { params });
    return response.data;
  },

  /** 获取单个投递详情 */
  getApplication: async (id: number): Promise<Application> => {
    const response = await apiClient.get<Application>(`/person/applications/${id}`);
    return response.data;
  },

  /** 撤回投递 */
  withdrawApplication: async (id: number): Promise<void> => {
    await apiClient.put(`/person/applications/${id}/withdraw`);
  },

  /** 收藏职位 */
  addFavorite: async (jobId: number): Promise<void> => {
    await apiClient.post('/person/favorites', { jobId });
  },

  /** 取消收藏职位 */
  removeFavorite: async (jobId: number): Promise<void> => {
    await apiClient.delete(`/person/favorites/${jobId}`);
  },

  /** 获取收藏职位列表 */
  getFavorites: async (params?: {
    page?: number;
    size?: number;
  }): Promise<{ list: FavoriteJob[]; total: number; page: number; size: number }> => {
    const response = await apiClient.get('/person/favorites', { params });
    return response.data;
  },
};
