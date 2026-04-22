export interface HomeJobCard {
  id: number;
  title: string;
  companyName: string;
  city: string;
  district?: string;
  salaryText: string;
  requiredSkills: string[];
  hrName?: string;
  hrTitle?: string;
  hrAvatar?: string;
  matchScore?: number;
}

export interface BackendJob {
  id: number;
  title: string;
  companyId: number;
  headcount: number;
  location: {
    city?: string;
    district?: string;
    address?: string;
  };
  salaryRange: {
    min?: number;
    max?: number;
    currency?: string;
  };
  requiredSkills: string[];
  preferredSkills: string[];
  status: string;
  description: string;
}

export interface BackendMatchDetail {
  matchId: number;
  resumeId: number;
  jobId: number;
  score: { value: number } | null;
  level: string | null;
  matchReason: string | null;
  isRead: boolean;
  job: {
    id: number;
    title: string;
    companyName: string;
  } | null;
}

export interface HomeCompanyCard {
  id: number;
  name: string;
  city?: string;
  jobCount: number;
  summary: string;
}

export interface HomeOverview {
  featuredJobs: HomeJobCard[];
  popularCompanies: HomeCompanyCard[];
  hotCities: string[];
}

export interface JobSearchParams {
  keyword?: string;
  city?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  sortBy?: 'createTime' | 'salary';
  page?: number;
  size?: number;
}

export interface CompanySearchParams {
  keyword?: string;
  page?: number;
  size?: number;
}
