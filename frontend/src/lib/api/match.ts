import apiClient from './client';

export interface GraphScore {
  personId: number;
  jobId: number;
  totalScore: number;
  skillScore: number;
  requirementScore: number;
  cityScore: number;
  salaryScore: number;
  educationScore: number;
  matchLevel: string;
  matchedSkills: string[];
  missingSkills: string[];
  matchRate: number;
  reason: string;
}

export interface MatchTriggerRequest {
  resumeId?: number;
  jobId?: number;
}

export interface MatchTriggerResponse {
  matchId: number;
  status: string;
}

export interface MatchListItem {
  matchId: number;
  resumeId: number;
  jobId: number;
  level?: string;
}

export const matchApi = {
  triggerMatch: async (data: MatchTriggerRequest): Promise<MatchTriggerResponse> => {
    const response = await apiClient.post('/match/trigger', data);
    return response.data;
  },

  getMatchDetail: async (matchId: number) => {
    const response = await apiClient.get(`/match/${matchId}/detail`);
    return response.data;
  },

  getMatchListByResume: async (resumeId: number): Promise<MatchListItem[]> => {
    const response = await apiClient.get(`/match/resume/${resumeId}/list`);
    return response.data;
  },

  getMatchListByJob: async (jobId: number): Promise<MatchListItem[]> => {
    const response = await apiClient.get(`/match/job/${jobId}/list`);
    return response.data;
  },

  getGraphScore: async (personId: number, jobId: number): Promise<GraphScore> => {
    const response = await apiClient.get(`/match/person/${personId}/job/${jobId}/graph-score`);
    return response.data;
  },
};
