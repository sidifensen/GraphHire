// 首页展示用类型
export interface HomeJobCard {
  id: number
  title: string
  companyName: string
  city: string
  district?: string
  salaryText: string
  requiredSkills: string[]
  hrName: string
  hrTitle: string
  hrAvatar?: string
  matchScore?: number
}

// 后端原始 Job（来自 /public/jobs）
export interface BackendJob {
  id: number
  title: string
  companyId: number
  department?: string
  headcount: number
  location: {
    city: string
    district?: string
    address?: string
  }
  salaryRange: {
    min: number
    max: number
    currency?: string
  }
  requiredSkills: string[]
  preferredSkills: string[]
  status: string
  description: string
}

// 后端分页结果
export interface BackendPageResult<T> {
  records: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 后端统一响应
export interface BackendResponse<T> {
  code: number
  message: string
  data: T
}

// 后端推荐响应
export interface BackendMatchDetail {
  matchId: number
  resumeId: number
  jobId: number
  score: { value: number } | null
  level: string | null
  matchReason: string | null
  isRead: boolean
  job: {
    id: number
    title: string
    companyName: string
  } | null
}

// 搜索参数
export interface JobSearchParams {
  keyword?: string
  city?: string
  salaryMin?: number
  salaryMax?: number
  skills?: string[]
  sortBy?: 'createTime' | 'salary'
  page?: number
  size?: number
}
