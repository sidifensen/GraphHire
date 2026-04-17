import apiClient from './client';

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

export const recommendationApi = {
  getCandidates: async (jobId: number, minMatchScore?: number): Promise<Candidate[]> => {
    const response = await apiClient.get(`/company/recommendations/${jobId}`, {
      params: { minMatchScore },
    });
    return response.data;
  },

  getCandidateDetail: async (candidateId: number): Promise<CandidateDetail> => {
    const response = await apiClient.get(`/company/candidate/${candidateId}`);
    return response.data;
  },

  addToTalentPool: async (resumeId: number): Promise<void> => {
    await apiClient.post('/company/talent-pool', { resumeId });
  },

  removeFromTalentPool: async (resumeId: number): Promise<void> => {
    await apiClient.delete(`/company/talent-pool/${resumeId}`);
  },
};
