import apiClient from './client';

// ==================== Types ====================

export interface MatchResult {
  matchId: number;
  jobId: number;
  resumeId: number;
  personId: number;
  overall: number;
  skill: number;
  experience: number;
  salary: number;
  location: number;
  education: number;
  potential: number;
  matchReasons: string[];
  skillComparison: SkillComparison[];
  createdAt: string;
  updatedAt: string;
}

export interface SkillComparison {
  skill: string;
  required: string;
  actual: string;
  match: boolean;
}

export interface GraphScore {
  personId: number;
  jobId: number;
  graphScore: number;
  skillScore: number;
  experienceScore: number;
  potentialScore: number;
  analysis: string;
}

export interface MatchTriggerRequest {
  resumeId?: number;
  jobId?: number;
}

export interface MatchTriggerResponse {
  matchId: number;
  status: string;
}

export interface MatchListResponse {
  matches: MatchResult[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== API ====================

export const matchApi = {
  /**
   * POST /match/trigger — 触发匹配
   */
  triggerMatch: async (data: MatchTriggerRequest): Promise<MatchTriggerResponse> => {
    const response = await apiClient.post('/match/trigger', data);
    return response.data;
  },

  /**
   * GET /match/{matchId}/detail — 获取匹配详情
   */
  getMatchDetail: async (matchId: number): Promise<MatchResult> => {
    const response = await apiClient.get(`/match/${matchId}/detail`);
    return response.data;
  },

  /**
   * GET /match/resume/{resumeId}/list — 获取简历的匹配列表
   */
  getMatchListByResume: async (resumeId: number): Promise<MatchListResponse> => {
    const response = await apiClient.get(`/match/resume/${resumeId}/list`);
    return response.data;
  },

  /**
   * GET /match/job/{jobId}/list — 获取职位的匹配列表
   */
  getMatchListByJob: async (jobId: number): Promise<MatchListResponse> => {
    const response = await apiClient.get(`/match/job/${jobId}/list`);
    return response.data;
  },

  /**
   * GET /match/person/{personId}/job/{jobId}/graph-score — 图谱匹配评分
   */
  getGraphScore: async (personId: number, jobId: number): Promise<GraphScore> => {
    const response = await apiClient.get(`/match/person/${personId}/job/${jobId}/graph-score`);
    return response.data;
  },
};
