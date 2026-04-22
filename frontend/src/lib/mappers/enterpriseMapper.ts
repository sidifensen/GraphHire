import type {
  EnterpriseDashboardJobItem,
  EnterpriseJobListItem,
  EnterpriseRecommendation,
  EnterpriseStaffListItem,
} from '@/lib/types/enterprise';

export function formatJobStatus(status?: string | null) {
  switch (status) {
    case 'PUBLISHED':
      return '已发布';
    case 'DRAFT':
      return '草稿';
    case 'CLOSED':
      return '已关闭';
    default:
      return status || '未知';
  }
}

export function formatStaffPost(post?: string | null) {
  switch (post) {
    case 'OWNER':
      return '企业主';
    case 'HR':
      return '管理员';
    case 'RECRUITER':
      return '招聘专员';
    default:
      return post || '未知';
  }
}

export function formatSalary(job: Pick<EnterpriseJobListItem, 'salaryMin' | 'salaryMax'>) {
  if (job.salaryMin == null || job.salaryMax == null) {
    return '薪资待定';
  }
  return `${Math.round(job.salaryMin / 1000)}k-${Math.round(job.salaryMax / 1000)}k`;
}

export function recommendationName(item: EnterpriseRecommendation) {
  return item.resume?.userName || item.resume?.fileName || `候选人 #${item.resumeId}`;
}

export function recommendationScore(item: EnterpriseRecommendation) {
  return Math.round(item.score?.total ?? 0);
}

export function staffName(item: EnterpriseStaffListItem) {
  return item.displayName || item.username || `员工 #${item.userId}`;
}

export function dashboardStatusText(item: EnterpriseDashboardJobItem) {
  return formatJobStatus(item.status);
}
