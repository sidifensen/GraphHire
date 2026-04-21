import type { Company, HomeOverviewResponse, Job } from '@/lib/api/public';
import type { BackendJob, BackendMatchDetail, HomeCompanyCard, HomeJobCard, HomeOverview } from '@/lib/types/home';

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

export function mapBackendJobToCard(job: BackendJob): HomeJobCard {
  const location = job.location ?? {};
  return {
    id: job.id,
    title: job.title ?? '未知职位',
    companyName: location.city ?? '未知企业',
    city: location.city ?? '',
    district: location.district,
    salaryText: formatSalary(job.salaryRange?.min, job.salaryRange?.max),
    requiredSkills: job.requiredSkills ?? [],
    hrName: '',
    hrTitle: '',
  };
}

export function mapBackendMatchToCard(match: BackendMatchDetail): HomeJobCard {
  const job = match.job;
  return {
    id: job?.id ?? match.jobId,
    title: job?.title ?? '未知职位',
    companyName: job?.companyName ?? '未知公司',
    city: '',
    salaryText: '薪资面议',
    requiredSkills: [],
    matchScore: match.score ? Math.round(match.score.value) : 0,
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
