/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPost, mockGet } = vi.hoisted(() => {
  return {
    mockPost: vi.fn(),
    mockGet: vi.fn(),
  };
});

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn((cb) => cb({ headers: {} })) },
        response: { use: vi.fn() },
      },
      get: mockGet,
      post: mockPost,
      put: vi.fn(),
      delete: vi.fn(),
      defaults: { timeout: 30000, headers: { 'Content-Type': 'application/json' } },
    })),
  },
}));

import { matchApi } from '@/lib/api/match';

describe('matchApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('triggerMatch', () => {
    it('should call POST /match/trigger with data', async () => {
      mockPost.mockResolvedValue({ data: { matchId: 100, status: 'pending' } });
      const data = { resumeId: 1, jobId: 2 };

      await matchApi.triggerMatch(data);

      expect(mockPost).toHaveBeenCalledWith('/match/trigger', data);
    });

    it('should return match trigger response', async () => {
      mockPost.mockResolvedValue({ data: { matchId: 42, status: 'completed' } });

      const result = await matchApi.triggerMatch({ resumeId: 1 });

      expect(result.matchId).toBe(42);
      expect(result.status).toBe('completed');
    });
  });

  describe('getMatchDetail', () => {
    it('should call GET /match/{matchId}/detail', async () => {
      mockGet.mockResolvedValue({ data: { matchId: 1, overall: 85 } });

      await matchApi.getMatchDetail(1);

      expect(mockGet).toHaveBeenCalledWith('/match/1/detail');
    });

    it('should return match detail', async () => {
      const mockDetail = {
        matchId: 5,
        overall: 88,
        skill: 90,
        experience: 85,
        matchReasons: ['Strong skills'],
        skillComparison: [],
        createdAt: '2024-01-01',
      };
      mockGet.mockResolvedValue({ data: mockDetail });

      const result = await matchApi.getMatchDetail(5);

      expect(result.overall).toBe(88);
      expect(result.matchReasons).toContain('Strong skills');
    });
  });

  describe('getMatchListByResume', () => {
    it('should call GET /match/resume/{resumeId}/list', async () => {
      mockGet.mockResolvedValue({
        data: { matches: [], total: 0, page: 1, pageSize: 10 },
      });

      await matchApi.getMatchListByResume(1);

      expect(mockGet).toHaveBeenCalledWith('/match/resume/1/list');
    });

    it('should return paginated match list', async () => {
      mockGet.mockResolvedValue({
        data: {
          matches: [{ matchId: 1 }, { matchId: 2 }],
          total: 50,
          page: 2,
          pageSize: 10,
        },
      });

      const result = await matchApi.getMatchListByResume(1);

      expect(result.matches).toHaveLength(2);
      expect(result.total).toBe(50);
      expect(result.page).toBe(2);
    });
  });

  describe('getMatchListByJob', () => {
    it('should call GET /match/job/{jobId}/list', async () => {
      mockGet.mockResolvedValue({
        data: { matches: [], total: 0, page: 1, pageSize: 10 },
      });

      await matchApi.getMatchListByJob(5);

      expect(mockGet).toHaveBeenCalledWith('/match/job/5/list');
    });

    it('should return match list for job', async () => {
      mockGet.mockResolvedValue({
        data: {
          matches: [{ matchId: 10, jobId: 5 }],
          total: 25,
          page: 1,
          pageSize: 20,
        },
      });

      const result = await matchApi.getMatchListByJob(5);

      expect(result.matches[0].jobId).toBe(5);
      expect(result.total).toBe(25);
    });
  });

  describe('getGraphScore', () => {
    it('should call GET /match/person/{personId}/job/{jobId}/graph-score', async () => {
      mockGet.mockResolvedValue({ data: { graphScore: 92 } });

      await matchApi.getGraphScore(1, 2);

      expect(mockGet).toHaveBeenCalledWith('/match/person/1/job/2/graph-score');
    });

    it('should return graph score with components', async () => {
      const mockScore = {
        personId: 1,
        jobId: 2,
        graphScore: 88,
        skillScore: 90,
        experienceScore: 85,
        potentialScore: 89,
        analysis: 'Excellent match',
      };
      mockGet.mockResolvedValue({ data: mockScore });

      const result = await matchApi.getGraphScore(1, 2);

      expect(result.graphScore).toBe(88);
      expect(result.skillScore).toBe(90);
      expect(result.analysis).toBe('Excellent match');
    });
  });
});
