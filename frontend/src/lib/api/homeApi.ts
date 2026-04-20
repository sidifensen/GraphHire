import axios from 'axios'
import type {
  BackendResponse,
  BackendPageResult,
  BackendJob,
  BackendMatchDetail,
  JobSearchParams,
} from '@/lib/types/home'
import { mapBackendJobToCard, mapBackendMatchToCard } from '@/lib/mappers/homeMapper'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7777'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

// 公开职位列表
export async function fetchPublicJobs(params: JobSearchParams = {}) {
  const resp = await client.get<BackendResponse<BackendPageResult<BackendJob>>>('/public/jobs', { params })
  const data = resp.data.data
  return {
    items: (data.records ?? []).map(mapBackendJobToCard),
    total: data.total,
    page: data.page,
    size: data.pageSize,
  }
}

// 推荐职位（需登录）
export async function fetchRecommendJobs() {
  const resp = await client.get<BackendResponse<BackendMatchDetail[]>>('/person/recommend/jobs')
  return (resp.data.data ?? []).map(mapBackendMatchToCard)
}

// 单个匹配分（需登录）
export async function fetchMatchScore(jobId: number) {
  const resp = await client.get<BackendResponse<BackendMatchDetail>>(`/person/match/${jobId}`)
  return resp.data.data
}
