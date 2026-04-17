# 前端假数据对接真实 API 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将前端 13 个页面的硬编码假数据替换为调用后端真实 API

**Architecture:**
- 已完成首页、企业网格的 API 对接
- 需要修改 13 个页面，将 `const mockXXX` 数据替换为 API 调用
- 使用 `useEffect` + `useState` 管理异步数据加载状态
- 添加 loading skeleton 和 empty state 处理

**Tech Stack:** Next.js App Router, React hooks (useEffect/useState), axios (apiClient), Zustand (auth-store)

---

## 已完成工作（无需修改）

- `frontend/src/lib/api/jobs.ts` - Job 类型已更新
- `frontend/src/lib/api/company.ts` - 已添加 publicCompanyApi
- `frontend/src/components/home/job-card.tsx` - 已适配新 Job 类型
- `frontend/src/components/home/company-grid.tsx` - 已使用 publicCompanyApi
- `frontend/src/app/(user)/home/page.tsx` - 已使用 jobApi

---

## 文件映射：页面 → API

| 页面 | 对应 API 文件 | 后端 Endpoint |
|------|--------------|--------------|
| `(user)/jobs/page.tsx` | `jobs.ts` | GET `/public/jobs` |
| `(user)/notifications/page.tsx` | `notification.ts` | GET `/notifications/user/{userId}` |
| `(user)/skill-graph/page.tsx` | `skill-graph.ts` | GET `/skill-graph/{userId}` |
| `(user)/resume/manage/page.tsx` | `resume.ts` | GET `/resume/user/{userId}` |
| `(user)/match/[id]/page.tsx` | `match.ts` + `jobs.ts` | GET `/public/jobs/{id}`, GET `/match/{matchId}/detail` |
| `company/jobs/page.tsx` | `company-job.ts` | GET `/company/job/list` |
| `company/notification/page.tsx` | `notification.ts` | GET `/notifications/user/{userId}` |
| `company/employee/page.tsx` | `company.ts` | (暂无 Staff API) |
| `company/resume/page.tsx` | `recommendation.ts` | GET `/company/recommend/resumes` |
| `company/job/manage/page.tsx` | `company-job.ts` | GET `/company/job/list` |
| `company/recommendations/page.tsx` | `recommendation.ts` | GET `/company/recommend/resumes` |
| `company/job/publish/page.tsx` | `company-job.ts` | POST `/company/job` |
| `company/info/page.tsx` | `company.ts` | GET `/company/info` |

---

## Task 1: 修复 `(user)/jobs/page.tsx` 职位列表页

**Files:**
- Modify: `frontend/src/app/(user)/jobs/page.tsx`

- [ ] **Step 1: 添加 useEffect 和 useState**

```tsx
const [jobs, setJobs] = useState<Job[]>([]);
const [loading, setLoading] = useState(true);
const [total, setTotal] = useState(0);

useEffect(() => {
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const result = await jobApi.getJobs({ page: 1, size: 10 });
      setJobs(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchJobs();
}, []);
```

- [ ] **Step 2: 替换 mockJobs 使用**

将 `mockJobs.map((job) => (` 替换为 `jobs.map((job) => (`

- [ ] **Step 3: 添加 loading skeleton**

在 jobs 列表位置添加：
```tsx
{loading ? (
  <div className="flex flex-col gap-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-32 bg-surface-container-low rounded-xl animate-pulse" />
    ))}
  </div>
) : jobs.length > 0 ? (
  jobs.map((job) => (...))
) : (
  <div className="text-center py-20">暂无职位</div>
)}
```

---

## Task 2: 修复 `(user)/notifications/page.tsx` 通知页

**Files:**
- Modify: `frontend/src/app/(user)/notifications/page.tsx`

- [ ] **Step 1: 添加 API 导入**

```tsx
import { notificationApi, type Notification } from '@/lib/api/notification';
import { authStore } from '@/lib/stores/auth-store';
```

- [ ] **Step 2: 添加状态和 API 调用**

```tsx
const [notifications, setNotifications] = useState<Notification[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const userId = authStore.getState().user?.id;
  if (!userId) return;

  const fetchNotifications = async () => {
    try {
      const result = await notificationApi.getList(userId);
      setNotifications(result.list || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchNotifications();
}, []);
```

- [ ] **Step 3: 替换 mockNotifications 为真实数据**

- [ ] **Step 4: 替换 markAllAsRead 和 markAsRead 为 API 调用**

```tsx
const markAllAsRead = async () => {
  const userId = authStore.getState().user?.id;
  if (!userId) return;
  await notificationApi.markAllAsRead(userId);
  setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
};

const markAsRead = async (id: number) => {
  await notificationApi.markAsRead(id);
  setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
};
```

---

## Task 3: 修复 `(user)/skill-graph/page.tsx` 技能图谱页

**Files:**
- Modify: `frontend/src/app/(user)/skill-graph/page.tsx`

- [ ] **Step 1: 添加 API 导入和状态**

```tsx
import { skillGraphApi, type SkillGraph } from '@/lib/api/skill-graph';
import { authStore } from '@/lib/stores/auth-store';

const [skillGraph, setSkillGraph] = useState<SkillGraph | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const userId = authStore.getState().user?.id;
  if (!userId) return;

  const fetchSkillGraph = async () => {
    try {
      const result = await skillGraphApi.getGraph(String(userId));
      setSkillGraph(result);
    } catch (error) {
      console.error('Failed to fetch skill graph:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchSkillGraph();
}, []);
```

---

## Task 4: 修复 `(user)/resume/manage/page.tsx` 简历管理页

**Files:**
- Modify: `frontend/src/app/(user)/resume/manage/page.tsx`

- [ ] **Step 1: 添加 API 导入和状态**

```tsx
import { resumeApi, type Resume } from '@/lib/api/resume';
import { authStore } from '@/lib/stores/auth-store';

const [resumes, setResumes] = useState<Resume[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const userId = authStore.getState().user?.id;
  if (!userId) return;

  const fetchResumes = async () => {
    try {
      const result = await resumeApi.getList(userId);
      setResumes(result);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchResumes();
}, []);
```

---

## Task 5: 修复 `(user)/match/[id]/page.tsx` 匹配详情页

**Files:**
- Modify: `frontend/src/app/(user)/match/[id]/page.tsx`

- [ ] **Step 1: 添加 API 导入和状态**

```tsx
import { jobApi, type Job } from '@/lib/api/jobs';
import { matchApi, type MatchResult } from '@/lib/api/match';

const [job, setJob] = useState<Job | null>(null);
const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const jobId = Number(params.id);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobData, matchData] = await Promise.all([
        jobApi.getJob(jobId),
        // 需要 resumeId，实际使用时从 URL 参数或上下文获取
      ]);
      setJob(jobData);
    } catch (error) {
      console.error('Failed to fetch match data:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [params.id]);
```

---

## Task 6: 修复 `company/jobs/page.tsx` 企业职位页

**Files:**
- Modify: `frontend/src/app/company/jobs/page.tsx`

- [ ] **Step 1: 添加 API 导入和状态**

```tsx
import { companyJobApi, type Job } from '@/lib/api/company-job';
import { authStore } from '@/lib/stores/auth-store';

const [jobs, setJobs] = useState<Job[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchJobs = async () => {
    try {
      const companyId = authStore.getState().user?.id; // 需要根据实际调整
      const result = await companyJobApi.getList(companyId);
      setJobs(result);
    } catch (error) {
      console.error('Failed to fetch company jobs:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchJobs();
}, []);
```

---

## Task 7: 修复 `company/notification/page.tsx` 企业通知页

**Files:**
- Modify: `frontend/src/app/company/notification/page.tsx`

- [ ] **Step 1: 复用 notification.ts API**

参照 Task 2 的实现方式

---

## Task 8: 修复 `company/employee/page.tsx` 员工管理页

**Files:**
- Modify: `frontend/src/app/company/employee/page.tsx`

**注意:** 后端 CompanyController 有 `/company/staff/create` 但前端 company.ts 缺少 Staff 相关类型和 API，需要：

- [ ] **Step 1: 在 company.ts 添加 Staff 类型和 API**

```tsx
export interface CompanyStaff {
  id: number;
  userId: number;
  companyId: number;
  post: 'OWNER' | 'HR' | 'RECRUITER';
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
}

export const companyStaffApi = {
  create: async (data: { username: string; password: string; post: string }): Promise<void> => {
    await apiClient.post('/company/staff/create', data);
  },
  resetPassword: async (staffId: number): Promise<void> => {
    await apiClient.post(`/company/staff/${staffId}/reset-password`);
  },
};
```

---

## Task 9: 修复 `company/resume/page.tsx` 简历页

**Files:**
- Modify: `frontend/src/app/company/resume/page.tsx`

- [ ] **Step 1: 添加 API 导入和状态**

```tsx
import { recommendationApi, type Candidate } from '@/lib/api/recommendation';

const [candidates, setCandidates] = useState<Candidate[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchCandidates = async () => {
    try {
      const result = await recommendationApi.getCandidates();
      setCandidates(result);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchCandidates();
}, []);
```

---

## Task 10: 修复 `company/job/manage/page.tsx` 职位管理页

**Files:**
- Modify: `frontend/src/app/company/job/manage/page.tsx`

- [ ] **Step 1: 复用 company-job.ts API**

参照 Task 6 的实现方式

---

## Task 11: 修复 `company/recommendations/page.tsx` 推荐页

**Files:**
- Modify: `frontend/src/app/company/recommendations/page.tsx`

- [ ] **Step 1: 复用 recommendation.ts API**

参照 Task 9 的实现方式

---

## Task 12: 修复 `company/job/publish/page.tsx` 发布职位页

**Files:**
- Modify: `frontend/src/app/company/job/publish/page.tsx`

- [ ] **Step 1: 添加表单提交 API 调用**

```tsx
import { companyJobApi } from '@/lib/api/company-job';

const handleSubmit = async (data: CreateJobRequest) => {
  try {
    await companyJobApi.create(data);
    // 成功后跳转或提示
  } catch (error) {
    console.error('Failed to create job:', error);
  }
};
```

---

## Task 13: 修复 `company/info/page.tsx` 企业信息页

**Files:**
- Modify: `frontend/src/app/company/info/page.tsx`

- [ ] **Step 1: 添加 API 导入和状态**

```tsx
import { companyApi, type Company } from '@/lib/api/company';

const [company, setCompany] = useState<Company | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchCompany = async () => {
    try {
      const result = await companyApi.getInfo(); // 需要 companyId
      setCompany(result);
    } catch (error) {
      console.error('Failed to fetch company info:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchCompany();
}, []);
```

---

## API 类型修复

需要同步修复前端类型以匹配后端：

- [ ] **Fix: company.ts 中的 CompanyStaff.post 类型**

将 `'ADMIN' | 'HR' | 'VIEWER'` 改为 `'OWNER' | 'HR' | 'RECRUITER'`

- [ ] **Fix: notification.ts 中的 Notification.type 类型**

后端是 `NotificationType` (JOB/SYSTEM/MESSAGE)，前端需要同步

---

## 验证清单

- [ ] 所有页面 loading 状态正常显示
- [ ] 所有页面 empty state 正常显示
- [ ] 所有页面 error 处理正常（console.error）
- [ ] 所有需要认证的 API 正确携带 token
- [ ] 页面在 API 返回空数据时不崩溃

---

## 执行顺序建议

1. Tasks 1-5: 用户端页面（优先级高）
2. Tasks 6-13: 企业端页面
3. 最后验证所有页面
