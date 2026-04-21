import type { Company, HomeOverviewResponse, Job } from '@/lib/api/public';
import type { HomeCompanyCard, HomeJobCard, HomeOverview } from '@/lib/types/home';

function formatSalary(min?: number | null, max?: number | null): string {
  if (!min && !max) return '薪资面议';
  const minStr = min ? `${Math.round(min / 1000)}k` : '';
  const maxStr = max ? `${Math.round(max / 1000)}k` : '';
  return minStr && maxStr ? `${minStr}-${maxStr}` : minStr || `${maxStr}以下`;
}

export function mapPublicJobToCard(job: Job): HomeJobCard {
  return {
    id: job.id,
    title: job.title ?? '未知职位',
    companyName: job.companyName ?? '未知企业',
    city: job.city ?? '',
    district: job.district ?? undefined,
    salaryText: formatSalary(job.salaryMin, job.salaryMax),
    requiredSkills: job.requiredSkills ?? [],
  };
}

export function mapPublicCompanyToCard(company: Company): HomeCompanyCard {
  return {
    id: company.id,
    name: company.name,
    city: company.city ?? undefined,
    jobCount: company.jobCount ?? 0,
    summary: company.summary ?? '已认证企业',
  };
}

export function mapHomeOverview(response: HomeOverviewResponse): HomeOverview {
  return {
    featuredJobs: (response.featuredJobs ?? []).map(mapPublicJobToCard),
    popularCompanies: (response.popularCompanies ?? []).map(mapPublicCompanyToCard),
    hotCities: response.hotCities ?? [],
  };
}
