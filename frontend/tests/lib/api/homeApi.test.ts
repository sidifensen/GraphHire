/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockOverview = vi.fn();
const mockCompanySearch = vi.fn();
const mockJobSearch = vi.fn();
const mockApiGet = vi.fn();

vi.mock('@/lib/api/public', () => ({
  publicApi: {
    home: { getOverview: (...args: unknown[]) => mockOverview(...args) },
    companies: { search: (...args: unknown[]) => mockCompanySearch(...args) },
    jobs: { search: (...args: unknown[]) => mockJobSearch(...args) },
  },
}));

vi.mock('@/lib/api/client', () => ({
  default: {
    get: (...args: unknown[]) => mockApiGet(...args),
  },
}));

import { fetchHomeOverview, fetchPublicCompanies, fetchPublicJobs, fetchRecommendJobs, fetchMatchScore } from '@/lib/api/homeApi';

describe('homeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps home overview response', async () => {
    mockOverview.mockResolvedValue({
      featuredJobs: [{ id: 1, title: 'A', companyName: 'C', city: '杭州', salaryMin: 30000, salaryMax: 45000, requiredSkills: ['Java'] }],
      popularCompanies: [{ id: 2, name: '企业A', city: '杭州', jobCount: 3, summary: '说明' }],
      hotCities: ['杭州'],
    });

    const result = await fetchHomeOverview();

    expect(result.featuredJobs[0].salaryText).toBe('30k-45k');
    expect(result.popularCompanies[0].name).toBe('企业A');
    expect(result.hotCities).toEqual(['杭州']);
  });

  it('formats public jobs page result', async () => {
    mockJobSearch.mockResolvedValue({
      records: [{ id: 1, title: 'A', companyName: 'C', city: '上海', salaryMin: 20000, salaryMax: 30000, requiredSkills: [] }],
      total: 1,
      page: 2,
      pageSize: 10,
      totalPages: 1,
    });

    const result = await fetchPublicJobs({ page: 2, size: 10 });

    expect(mockJobSearch).toHaveBeenCalledWith({ page: 2, size: 10 });
    expect(result.items[0].salaryText).toBe('20k-30k');
    expect(result.page).toBe(2);
  });

  it('formats public companies page result', async () => {
    mockCompanySearch.mockResolvedValue({
      records: [{ id: 1, name: '企业A', city: '深圳', jobCount: 4, summary: '已认证企业' }],
      total: 1,
      page: 1,
      pageSize: 12,
      totalPages: 1,
    });

    const result = await fetchPublicCompanies({ keyword: '企业' });

    expect(mockCompanySearch).toHaveBeenCalledWith({ keyword: '企业' });
    expect(result.items[0].jobCount).toBe(4);
  });

  it('keeps recommend and match detail requests available', async () => {
    mockApiGet.mockResolvedValueOnce({ data: [{ id: 1 }] }).mockResolvedValueOnce({ data: { score: 80 } });

    const jobs = await fetchRecommendJobs();
    const detail = await fetchMatchScore(7);

    expect(mockApiGet).toHaveBeenNthCalledWith(1, '/person/recommend/jobs');
    expect(mockApiGet).toHaveBeenNthCalledWith(2, '/person/match/7');
    expect(jobs).toEqual([{ id: 1 }]);
    expect(detail).toEqual({ score: 80 });
  });
});
