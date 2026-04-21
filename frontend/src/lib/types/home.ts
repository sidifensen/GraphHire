export interface HomeJobCard {
  id: number;
  title: string;
  companyName: string;
  city: string;
  district?: string;
  salaryText: string;
  requiredSkills: string[];
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
