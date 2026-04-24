export interface EnterpriseDashboardJobItem {
  id: number;
  title: string;
  department?: string | null;
  applyCount: number;
  matchCount: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | string;
  publishedAt?: string | null;
}

export interface EnterpriseDashboard {
  pendingApplicationCount: number;
  newMatchCandidateCount: number;
  activeJobCount: number;
  recentJobs: EnterpriseDashboardJobItem[];
}

export interface EnterpriseJobListItem {
  id: number;
  title: string;
  department?: string | null;
  city?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryUnit?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | string;
  parseStatus?: string | null;
  viewCount: number;
  applyCount: number;
  matchCount: number;
  publishedAt?: string | null;
}

export interface EnterpriseRecommendation {
  matchId?: number;
  resumeId: number;
  jobId: number;
  score?: {
    total?: number;
    skillScore?: number;
    expScore?: number;
    cityScore?: number;
    eduScore?: number;
    salScore?: number;
  } | null;
  matchReason?: string | null;
  resume?: {
    id: number;
    fileName?: string | null;
    userName?: string | null;
  } | null;
  job?: {
    id: number;
    title?: string | null;
    companyName?: string | null;
  } | null;
}

export interface EnterpriseStaffListItem {
  id: number;
  userId: number;
  username?: string | null;
  displayName?: string | null;
  post: 'OWNER' | 'HR' | 'RECRUITER' | string;
  status: 'ACTIVE' | 'DISABLED' | string;
  lastLoginTime?: string | null;
}

export interface EnterpriseStaffStats {
  totalCount: number;
  ownerCount: number;
  hrCount: number;
  recruiterCount: number;
}

export interface EnterpriseCreateStaffRequest {
  username: string;
  password: string;
  post: 'HR' | 'RECRUITER';
}

export interface EnterpriseCreateJobRequest {
  title: string;
  location: {
    city: string;
  };
  salaryRange: {
    min: number;
    max: number;
    unit: string;
  };
  description: string;
}
