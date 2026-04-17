import apiClient from './client';

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

export interface SkillDetail {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  yearsOfExperience: number;
  projectCount: number;
  relatedConcepts: string[];
  relatedJobs: number;
}

export const skillGraphApi = {
  getGraph: async (userId: string): Promise<SkillGraph> => {
    const response = await apiClient.get(`/skill-graph/${userId}`);
    return response.data;
  },

  getSkillDetail: async (skillId: string): Promise<SkillDetail> => {
    const response = await apiClient.get(`/skill/${skillId}`);
    return response.data;
  },

  analyzeResume: async (resumeId: number): Promise<SkillGraph> => {
    const response = await apiClient.post('/skill-graph/analyze', { resumeId });
    return response.data;
  },
};
