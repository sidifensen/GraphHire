import { apiRequest } from './request';

export interface PersonInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  gender?: string;
  age?: number;
  city?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  type: 'skill' | 'experience' | 'education';
  level?: number;
  years?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface PersonGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Job {
  id: string;
  title: string;
  companyName: string;
  city: string;
  salaryMin: number;
  salaryMax: number;
  education: string;
  experience: string;
  skills: string[];
  matchScore?: number;
}

export const personApi = {
  getInfo: () => apiRequest.get<PersonInfo>('/person/info'),

  updateInfo: (data: Partial<PersonInfo>) => apiRequest.put('/person/info', data),

  getGraph: () => apiRequest.get<PersonGraph>('/person/graph'),

  getRecommendJobs: (params?: { page?: number; size?: number }) =>
    apiRequest.get<{ list: Job[]; total: number }>('/person/recommend/jobs', { params }),

  getMatchDetail: (jobId: string) =>
    apiRequest.get<{ matchScore: number; skillMatch: number; details: unknown }>(`/person/match/${jobId}`),
};
