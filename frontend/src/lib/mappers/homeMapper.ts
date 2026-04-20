import type { BackendJob, BackendMatchDetail, HomeJobCard } from '@/lib/types/home'

function formatSalary(min: number, max: number): string {
  if (!min && !max) return '薪资面议'
  const minStr = min ? `${min / 1000}k` : ''
  const maxStr = max ? `${max / 1000}k` : ''
  return minStr && maxStr ? `${minStr}-${maxStr}` : minStr || `${maxStr}以下`
}

export function mapBackendJobToCard(job: BackendJob): HomeJobCard {
  const loc = job.location ?? {}
  const sal = job.salaryRange ?? {}
  return {
    id: job.id,
    title: job.title ?? '未知职位',
    companyName: loc.city ?? '未知公司',
    city: loc.city ?? '',
    district: loc.district,
    salaryText: formatSalary(sal.min, sal.max),
    requiredSkills: job.requiredSkills ?? [],
    hrName: '',
    hrTitle: '',
    hrAvatar: undefined,
    matchScore: undefined,
  }
}

export function mapBackendMatchToCard(m: BackendMatchDetail): HomeJobCard {
  const score = m.score?.value ?? 0
  return {
    id: m.jobId,
    title: m.job?.title ?? '未知职位',
    companyName: m.job?.companyName ?? '未知公司',
    city: '',
    district: undefined,
    salaryText: '薪资面议',
    requiredSkills: [],
    hrName: '',
    hrTitle: '',
    hrAvatar: undefined,
    matchScore: Math.round(score),
  }
}
