import { publicApi } from '@/lib/api/public';
import apiClient from '@/lib/api/client';
import { mapHomeOverview, mapPublicCompanyToCard, mapPublicJobToCard } from '@/lib/mappers/homeMapper';
import type { CompanySearchParams, HomeOverview, JobSearchParams } from '@/lib/types/home';

export async function fetchHomeOverview(): Promise<HomeOverview> {
  const response = await publicApi.home.getOverview();
  return mapHomeOverview(response);
}

export async function fetchPublicJobs(params: JobSearchParams = {}) {
  const data = await publicApi.jobs.search(params);
  return {
    items: (data.records ?? []).map(mapPublicJobToCard),
    total: data.total,
    page: data.page,
    size: data.pageSize,
    totalPages: data.totalPages,
  };
}

export async function fetchPublicCompanies(params: CompanySearchParams = {}) {
  const data = await publicApi.companies.search(params);
  return {
    items: (data.records ?? []).map(mapPublicCompanyToCard),
    total: data.total,
    page: data.page,
    size: data.pageSize,
    totalPages: data.totalPages,
  };
}

export async function fetchRecommendJobs() {
  const response = await apiClient.get('/person/recommend/jobs');
  return response.data;
}

export async function fetchMatchScore(jobId: number) {
  const response = await apiClient.get(`/person/match/${jobId}`);
  return response.data;
}
