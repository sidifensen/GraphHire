# API 接口层补全实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将后端 118 个 REST API 全部补全到 `frontend/src/lib/api/`，修正现有路径错误并重组文件结构为 10 个模块文件。

**Architecture:**
- 保持现有 `client.ts` 不变（axios 实例 + 拦截器）
- 每个模块对应一个 `.ts` 文件，命名与后端 Controller 一致
- 删除 `recommendation.ts`、`skill-graph.ts`、`homeApi.ts`，接口拆分合并入对应模块
- 使用 TDD 模式：先写接口定义，跑 lint 验证，再写入实现

**Tech Stack:** TypeScript, axios, Next.js（前端）, Spring Boot（后端）

---

## 文件变更总览

| 操作 | 文件 |
|------|------|
| 修改 | `frontend/src/lib/api/auth.ts` |
| 修改 | `frontend/src/lib/api/admin.ts` |
| 创建 | `frontend/src/lib/api/category.ts` |
| 重写 | `frontend/src/lib/api/person.ts` |
| 重写 | `frontend/src/lib/api/resume.ts` |
| 重写 | `frontend/src/lib/api/company.ts` |
| 重写 | `frontend/src/lib/api/match.ts` |
| 重写 | `frontend/src/lib/api/notification.ts` |
| 创建 | `frontend/src/lib/api/skillTag.ts` |
| 创建 | `frontend/src/lib/api/public.ts` |
| 删除 | `frontend/src/lib/api/recommendation.ts` |
| 删除 | `frontend/src/lib/api/skill-graph.ts` |
| 删除 | `frontend/src/lib/api/homeApi.ts` |
| 删除 | `frontend/src/lib/api/company-job.ts` |
| 删除 | `frontend/src/lib/api/jobs.ts` |

**最终文件（10个）：** `auth.ts`、`admin.ts`、`category.ts`、`person.ts`、`resume.ts`、`company.ts`、`match.ts`、`notification.ts`、`skillTag.ts`、`public.ts`

---

## Task 1: 补全 auth.ts

**Files:** `frontend/src/lib/api/auth.ts`（修改）

```typescript
// 现有接口（6个）→ 目标接口（13个）
// 需新增：sendVerifyCode, forgotPassword, resetPassword, adminLogin, refreshToken, changePassword, sendResetCode
```

- [ ] **Step 1: 读取现有 auth.ts 内容确认现状**

```typescript
// 现有：
// POST /auth/login
// POST /auth/register/person
// POST /auth/register/company
// POST /auth/logout
// GET /auth/current
// GET /auth/validate
```

- [ ] **Step 2: 补全缺失接口（7个）**

```typescript
export const authApi = {
  // 现有 6 个...

  // 新增：
  adminLogin: async (data: { username: string; password: string }) => {
    const response = await apiClient.post('/auth/admin/login', data);
    return response.data;
  },

  sendVerifyCode: async (data: { phone: string }) => {
    const response = await apiClient.post('/auth/send-verify-code', data);
    return response.data;
  },

  forgotPassword: async (data: { phone: string }) => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: { phone: string; code: string; newPassword: string }) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh-token');
    return response.data;
  },

  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
  },

  sendResetCode: async (data: { phone: string }) => {
    const response = await apiClient.post('/auth/send-reset-code', data);
    return response.data;
  },
};
```

- [ ] **Step 3: 跑 TypeScript 检查**

```bash
cd frontend && npx tsc --noEmit src/lib/api/auth.ts
```
预期：无错误

---

## Task 2: 补全 admin.ts

**Files:** `frontend/src/lib/api/admin.ts`（修改）

- [ ] **Step 1: 读取现有 admin.ts 内容确认现状**

- [ ] **Step 2: 补全全部 AdminController + BatchOperationController 接口（25个）**

现有缺失重点：
- `GET /admin/statistics`
- `PUT /admin/company/auth/{id}`
- `PUT /admin/user/{id}/status`
- `GET /admin/user/list`（路径应为 `/admin/user/list`，不是 `/admin/users`）
- `GET /admin/resume/list`
- `GET /admin/job/list`
- `GET /admin/skill/list`
- `GET /admin/task/list`
- `POST /admin/task/{id}/retry`
- `GET /admin/company/auth/list`
- `POST /admin/company/{id}/approve`（应为 POST 不是 PUT）
- `POST /admin/company/{id}/reject`（应为 POST 不是 PUT）
- `GET /admin/company/pending`
- `GET /admin/company/auth-list`
- 批量操作：batch/approve, batch/reject, user/batch/disable, task/batch/retry

- [ ] **Step 3: 跑 TypeScript 检查**

```bash
cd frontend && npx tsc --noEmit src/lib/api/admin.ts
```

---

## Task 3: 创建 category.ts

**Files:** `frontend/src/lib/api/category.ts`（新建）

- [ ] **Step 1: 创建文件，写入 CategoryController 4 个接口**

```typescript
import apiClient from './client';

export interface SkillCategory {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  sortOrder?: number;
}

export const categoryApi = {
  getCategories: async (): Promise<SkillCategory[]> => {
    const response = await apiClient.get('/admin/skill/categories');
    return response.data;
  },

  createCategory: async (data: { name: string; description?: string; parentId?: number }): Promise<{ id: number }> => {
    const response = await apiClient.post('/admin/skill/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: { name?: string; description?: string; sortOrder?: number }): Promise<void> => {
    await apiClient.put(`/admin/skill/categories/${id}`, data);
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/skill/categories/${id}`);
  },
};
```

- [ ] **Step 2: 跑 TypeScript 检查**

---

## Task 4: 重构 person.ts

**Files:** `frontend/src/lib/api/person.ts`（重写）

- [ ] **Step 1: 路径修正为核心**

现有错误：`/person/{userId}` → 修正为：`/person/info`（SESSION 获取当前用户）

- [ ] **Step 2: 补全 PersonController + PersonAvatarController + PersonApplicationController（19个接口）**

```typescript
export const personApi = {
  // PersonController - SESSION 方式（当前用户）
  getInfo: async (): Promise<PersonProfile> => {
    const response = await apiClient.get('/person/info');
    return response.data;
  },

  updateInfo: async (data: Partial<PersonProfile>): Promise<void> => {
    await apiClient.put('/person/info', data);
  },

  getGraph: async (): Promise<SkillGraph> => {
    const response = await apiClient.get('/person/graph');
    return response.data;
  },

  getRecommendJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get('/person/recommend/jobs');
    return response.data;
  },

  getMatchDetail: async (jobId: number): Promise<MatchDetail> => {
    const response = await apiClient.get(`/person/match/${jobId}`);
    return response.data;
  },

  // PersonAvatarController
  uploadAvatar: async (formData: FormData): Promise<{ avatarUrl: string }> => {
    const response = await apiClient.post('/person/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAvatar: async (): Promise<{ avatarUrl: string }> => {
    const response = await apiClient.get('/person/avatar');
    return response.data;
  },

  // PersonApplicationController
  apply: async (data: { jobId: number; resumeId: number }): Promise<{ applicationId: number }> => {
    const response = await apiClient.post('/person/applications', data);
    return response.data;
  },

  getApplications: async (params?: { status?: string; page?: number }): Promise<PageResult<Application>> => {
    const response = await apiClient.get('/person/applications', { params });
    return response.data;
  },

  getApplicationDetail: async (id: number): Promise<Application> => {
    const response = await apiClient.get(`/person/applications/${id}`);
    return response.data;
  },

  withdrawApplication: async (id: number): Promise<void> => {
    await apiClient.put(`/person/applications/${id}/withdraw`);
  },

  // Favorites
  addFavorite: async (jobId: number): Promise<void> => {
    await apiClient.post('/person/favorites', { jobId });
  },

  removeFavorite: async (jobId: number): Promise<void> => {
    await apiClient.delete(`/person/favorites/${jobId}`);
  },

  getFavorites: async (params?: { page?: number }): Promise<PageResult<Job>> => {
    const response = await apiClient.get('/person/favorites', { params });
    return response.data;
  },
};
```

- [ ] **Step 3: 跑 TypeScript 检查**

---

## Task 5: 重构 resume.ts

**Files:** `frontend/src/lib/api/resume.ts`（重写）

- [ ] **Step 1: 路径修正**

现有错误：`/resume/user/{userId}` → 修正为：`/resume/my/*`

- [ ] **Step 2: 补全 ResumeController 全部 7 个接口**

```typescript
export const resumeApi = {
  upload: async (formData: FormData): Promise<{ resumeId: number }> => {
    const response = await apiClient.post('/resume/my/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getMyList: async (): Promise<Resume[]> => {
    const response = await apiClient.get('/resume/my');
    return response.data;
  },

  getDetail: async (id: number): Promise<Resume> => {
    const response = await apiClient.get(`/resume/${id}/detail`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/resume/${id}`);
  },

  setDefault: async (id: number): Promise<void> => {
    await apiClient.put(`/resume/${id}/default`);
  },

  triggerParse: async (id: number): Promise<void> => {
    await apiClient.post(`/resume/${id}/parse`);
  },

  getList: async (params?: { page?: number; size?: number }): Promise<PageResult<Resume>> => {
    const response = await apiClient.get('/resume/list', { params });
    return response.data;
  },
};
```

- [ ] **Step 3: 跑 TypeScript 检查**

---

## Task 6: 重构 company.ts

**Files:** `frontend/src/lib/api/company.ts`（重写）

- [ ] **Step 1: 读取现有 company.ts + company-job.ts + recommendation.ts 全部内容**

- [ ] **Step 2: 补全 CompanyController + CompanyApplicationController（26个接口）**

重点包括：
- `/company/info` GET/PUT（SESSION，当前公司）
- `/company/auth` POST（提交认证资料）
- `/company/job` POST（发布职位）
- `/company/job/list` GET（职位列表）
- `/company/job/{id}` GET/PUT/DELETE
- `/company/job/{id}/status` PUT（切换状态）
- `/company/job/{id}/publish` POST
- `/company/job/{id}/close` POST
- `/company/job/{id}/salary` PUT
- `/company/job/{id}/parse` POST（重新解析）
- `/company/job/{id}/graph` GET（图谱）
- `/company/match/{resumeId}` GET（匹配详情，query 参数 jobId）
- `/company/recommend/resumes` GET（推荐简历）
- `/company/create` POST
- `/company/{id}` GET/PUT
- `/company/staff/create` POST
- `/company/staff/{staffId}/reset-password` POST
- 公司收到的申请相关接口（CompanyApplicationController）：
  - `/company/applications` GET
  - `/company/applications/{id}` GET
  - `/company/applications/{id}/status` PUT
  - `/company/applications/{id}/interview` POST
  - `/company/applications/{id}/reject` POST
  - `/company/applications/{id}/accept` POST
  - `/company/talent-pool` POST/GET
  - `/company/talent-pool/{resumeId}` DELETE

- [ ] **Step 3: 跑 TypeScript 检查**

---

## Task 7: 重构 match.ts

**Files:** `frontend/src/lib/api/match.ts`（重写）

- [ ] **Step 1: 补全 MatchController + MatchGraphController（6个接口）**

```typescript
export const matchApi = {
  trigger: async (data: { resumeId?: number; jobId?: number }): Promise<{ matchId: number }> => {
    const response = await apiClient.post('/match/trigger', data);
    return response.data;
  },

  getDetail: async (matchId: number): Promise<MatchResult> => {
    const response = await apiClient.get(`/match/${matchId}/detail`);
    return response.data;
  },

  getResumeMatches: async (resumeId: number): Promise<MatchResult[]> => {
    const response = await apiClient.get(`/match/resume/${resumeId}/list`);
    return response.data;
  },

  getJobMatches: async (jobId: number): Promise<MatchResult[]> => {
    const response = await apiClient.get(`/match/job/${jobId}/list`);
    return response.data;
  },

  getGraphScore: async (personId: number, jobId: number): Promise<{ score: number; breakdown: any }> => {
    const response = await apiClient.get(`/match/person/${personId}/job/${jobId}/graph-score`);
    return response.data;
  },
};
```

- [ ] **Step 2: 从 skill-graph.ts 迁移过来的 `analyzeResume` 如需要可保留（但后端无此端点，删除）**

- [ ] **Step 3: 跑 TypeScript 检查**

---

## Task 8: 重构 notification.ts

**Files:** `frontend/src/lib/api/notification.ts`（重写）

- [ ] **Step 1: 路径修正**

现有错误：
- `/notifications/${userId}` → 修正为：`/notifications/user/{userId}`
- `/notifications/read-all?userId=${userId}` → 修正为：`/notifications/user/{userId}/read-all`

- [ ] **Step 2: 补全 NotificationController 全部 9 个接口**

```typescript
export const notificationApi = {
  getById: async (id: number): Promise<Notification> => {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },

  getByUser: async (userId: number, params?: { page?: number }): Promise<PageResult<Notification>> => {
    const response = await apiClient.get(`/notifications/user/${userId}`, { params });
    return response.data;
  },

  getUnread: async (userId: number): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications/user/${userId}/unread`);
    return response.data;
  },

  getByType: async (userId: number, type: string): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications/user/${userId}/type/${type}`);
    return response.data;
  },

  getUnreadCount: async (userId: number): Promise<number> => {
    const response = await apiClient.get(`/notifications/user/${userId}/unread-count`);
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  markAsUnread: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/unread`);
  },

  markAllAsRead: async (userId: number): Promise<void> => {
    await apiClient.put(`/notifications/user/${userId}/read-all`);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
```

- [ ] **Step 3: 跑 TypeScript 检查**

---

## Task 9: 创建 skillTag.ts

**Files:** `frontend/src/lib/api/skillTag.ts`（新建）

- [ ] **Step 1: 创建文件，写入 SkillTagController 11 个接口**

```typescript
export const skillTagApi = {
  create: async (data: { name: string; category: string }): Promise<{ id: number }> => {
    const response = await apiClient.post('/skill-tags', data);
    return response.data;
  },

  update: async (id: number, data: { name?: string; category?: string }): Promise<void> => {
    await apiClient.put(`/skill-tags/${id}`, data);
  },

  getById: async (id: number): Promise<SkillTag> => {
    const response = await apiClient.get(`/skill-tags/${id}`);
    return response.data;
  },

  getByName: async (name: string): Promise<SkillTag> => {
    const response = await apiClient.get(`/skill-tags/name/${name}`);
    return response.data;
  },

  getAll: async (): Promise<SkillTag[]> => {
    const response = await apiClient.get('/skill-tags');
    return response.data;
  },

  getByCategory: async (category: string): Promise<SkillTag[]> => {
    const response = await apiClient.get(`/skill-tags/category/${category}`);
    return response.data;
  },

  addSynonym: async (id: number, synonym: string): Promise<void> => {
    await apiClient.post(`/skill-tags/${id}/synonyms`, { synonym });
  },

  removeSynonym: async (id: number, synonym: string): Promise<void> => {
    await apiClient.delete(`/skill-tags/${id}/synonyms/${synonym}`);
  },

  updateCategory: async (id: number, category: string): Promise<void> => {
    await apiClient.put(`/skill-tags/${id}/category`, { category });
  },

  normalize: async (data: { skills: string[] }): Promise<{ normalized: string[] }> => {
    const response = await apiClient.post('/skill-tags/normalize', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/skill-tags/${id}`);
  },
};
```

- [ ] **Step 2: 跑 TypeScript 检查**

---

## Task 10: 创建 public.ts

**Files:** `frontend/src/lib/api/public.ts`（新建）

- [ ] **Step 1: 从 jobs.ts 和 company.ts 迁移公开接口**

```typescript
export const publicApi = {
  // PublicCompanyController
  searchCompanies: async (params?: { keyword?: string; page?: number; size?: number }): Promise<PageResult<Company>> => {
    const response = await apiClient.get('/public/companies', { params });
    return response.data;
  },

  getCompanyById: async (id: number): Promise<Company> => {
    const response = await apiClient.get(`/public/companies/${id}`);
    return response.data;
  },

  // PublicJobController
  searchJobs: async (params?: JobSearchParams): Promise<PageResult<Job>> => {
    const response = await apiClient.get('/public/jobs', { params });
    return response.data;
  },

  getJobById: async (id: number): Promise<Job> => {
    const response = await apiClient.get(`/public/jobs/${id}`);
    return response.data;
  },
};
```

- [ ] **Step 2: 跑 TypeScript 检查**

---

## Task 11: 删除废弃文件

**Files:** 删除 `frontend/src/lib/api/` 下 5 个文件

- [ ] 删除 `recommendation.ts`
- [ ] 删除 `skill-graph.ts`
- [ ] 删除 `homeApi.ts`
- [ ] 删除 `company-job.ts`
- [ ] 删除 `jobs.ts`
- [ ] 验证最终 `ls frontend/src/lib/api/*.ts` 返回 10 个文件

```bash
ls frontend/src/lib/api/*.ts
# 预期：auth.ts admin.ts category.ts person.ts resume.ts company.ts match.ts notification.ts skillTag.ts public.ts client.ts
```

---

## Task 12: 最终验证

- [ ] 跑 `tsc --noEmit` 全量 TypeScript 检查
- [ ] 验证 118 个接口全部覆盖（逐个对照后端 Controller）
- [ ] 确认无路径错误（grep 检查 `/person/{userId}`、`/resume/user/` 等错误模式）
- [ ] 提交 commit
