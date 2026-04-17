import apiClient from './client';

export interface MatchResult {
  jobId: number;
  resumeId: number;
  overall: number;
  skill: number;
  experience: number;
  salary: number;
  location: number;
  education: number;
  potential: number;
  matchReasons: string[];
  skillComparison: {
    skill: string;
    required: string;
    actual: string;
    match: boolean;
  }[];
}

export const matchApi = {
  getMatchDetail: async (jobId: number, resumeId: number): Promise<MatchResult> => {
    const response = await apiClient.get(`/match/${jobId}/${resumeId}`);
    return response.data;
  },

  apply: async (jobId: number, resumeId: number): Promise<{ applicationId: number }> => {
    const response = await apiClient.post('/match/apply', { jobId, resumeId });
    return response.data;
  },
};
