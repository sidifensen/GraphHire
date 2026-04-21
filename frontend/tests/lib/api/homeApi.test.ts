/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGet } = vi.hoisted(() => {
  return {
    mockGet: vi.fn(),
  };
});

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      defaults: { timeout: 10000 },
    })),
  },
}));

import { fetchPublicJobs, fetchRecommendJobs, fetchMatchScore } from '@/lib/api/homeApi';

describe('homeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchPublicJobs', () => {
    it('should call GET /public/jobs with params', async () => {
      mockGet.mockResolvedValue({
        data: {
          code: 200,
          data: { records: [], total: 0, page: 1, pageSize: 10 },
        },
      });

      await fetchPublicJobs({ page: 1, pageSize: 10 });

      expect(mockGet).toHaveBeenCalledWith('/public/jobs', {
        params: { page: 1, pageSize: 10 },
      });
    });

    it('should return formatted response', async () => {
      mockGet.mockResolvedValue({
        data: {
          code: 200,
          data: {
            records: [{ id: 1, title: 'Engineer' }],
            total: 100,
            page: 2,
            pageSize: 10,
          },
        },
      });

      const result = await fetchPublicJobs({ page: 2 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(100);
      expect(result.page).toBe(2);
      expect(result.size).toBe(10);
    });

    it('should work without params', async () => {
      mockGet.mockResolvedValue({
        data: {
          code: 200,
          data: { records: [], total: 0, page: 1, pageSize: 10 },
        },
      });

      const result = await fetchPublicJobs();

      expect(mockGet).toHaveBeenCalledWith('/public/jobs', { params: {} });
      expect(result.items).toEqual([]);
    });

    it('should handle undefined records', async () => {
      mockGet.mockResolvedValue({
        data: {
          code: 200,
          data: { records: undefined, total: 0, page: 1, pageSize: 10 },
        },
      });

      const result = await fetchPublicJobs();

      expect(result.items).toEqual([]);
    });
  });

  describe('fetchRecommendJobs', () => {
    it('should call GET /person/recommend/jobs', async () => {
      mockGet.mockResolvedValue({
        data: {
          code: 200,
          data: [{ id: 1, title: 'Recommended' }],
        },
      });

      await fetchRecommendJobs();

      expect(mockGet).toHaveBeenCalledWith('/person/recommend/jobs');
    });

    it('should return job cards array', async () => {
      mockGet.mockResolvedValue({
        data: {
          code: 200,
          data: [{ id: 1 }, { id: 2 }],
        },
      });

      const result = await fetchRecommendJobs();

      expect(result).toHaveLength(2);
    });

    it('should return empty array when data is undefined', async () => {
      mockGet.mockResolvedValue({
        data: {
          code: 200,
          data: undefined,
        },
      });

      const result = await fetchRecommendJobs();

      expect(result).toEqual([]);
    });
  });

  describe('fetchMatchScore', () => {
    it('should call GET /person/match/{jobId}', async () => {
      mockGet.mockResolvedValue({
        data: {
          code: 200,
          data: { matchScore: 85 },
        },
      });

      await fetchMatchScore(123);

      expect(mockGet).toHaveBeenCalledWith('/person/match/123');
    });

    it('should return match score data', async () => {
      mockGet.mockResolvedValue({
        data: {
          code: 200,
          data: { matchScore: 85, level: 'STRONG' },
        },
      });

      const result = await fetchMatchScore(123);

      expect(result).toEqual({ matchScore: 85, level: 'STRONG' });
    });

    it('should return undefined when data is undefined', async () => {
      mockGet.mockResolvedValue({
        data: {
          code: 200,
          data: undefined,
        },
      });

      const result = await fetchMatchScore(999);

      expect(result).toBeUndefined();
    });
  });
});
