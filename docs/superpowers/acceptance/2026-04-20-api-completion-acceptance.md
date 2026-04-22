# Acceptance Criteria: API 接口层补全

**Spec:** `docs/superpowers/specs/2026-04-20-api-completion-design.md`
**Date:** 2026-04-20
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | `src/lib/api/` 目录下恰好 10 个 `.ts` 文件 | Logic | 执行文件统计 | `ls src/lib/api/*.ts | wc -l` 返回 10 |
| AC-002 | `recommendation.ts`、`skill-graph.ts`、`homeApi.ts` 已删除 | Logic | 执行前检查文件存在 | 删除后三个文件不存在于 `src/lib/api/` |
| AC-003 | `auth.ts` 包含 AuthController + PasswordController 全部 13 个接口 | Logic | 读取文件内容 | 文件内包含 `login`, `register/person`, `register/company`, `admin/login`, `send-verify-code`, `forgot-password`, `reset-password`, `logout`, `current`, `refresh-token`, `validate`, `change-password`, `send-reset-code` |
| AC-004 | `admin.ts` 包含 AdminController + BatchOperationController 全部 25 个接口 | Logic | 读取文件内容 | 文件内包含 `dashboard/stats`, `statistics`, `company/auth/{id}`, `user/{id}/status`, `user/disable`, `user/list`, `resume/list`, `job/list`, `skill/list`, `task/list`, `task/{id}/retry`, `company/auth/list`, `company/{id}/approve`, `company/{id}/reject`, `company/pending`, `company/auth-list`, `company/batch/approve`, `company/batch/reject`, `user/batch/disable`, `task/batch/retry` |
| AC-005 | `category.ts` 包含 CategoryController 全部 4 个接口 | Logic | 读取文件内容 | 文件内包含 `categories` GET/POST/PUT/DELETE |
| AC-006 | `person.ts` 包含 PersonController + PersonAvatarController + PersonApplicationController 全部 19 个接口 | Logic | 读取文件内容 | 文件内包含 `/person/info` GET/PUT，`/person/avatar` GET/POST，`/person/graph`，`/person/recommend/jobs`，`/person/match/{jobId}`，`/person/applications` GET/POST，`/person/applications/{id}`， `/person/applications/{id}/withdraw`，`/person/favorites` GET/POST/DELETE |
| AC-007 | `resume.ts` 包含 ResumeController 全部 7 个接口 | Logic | 读取文件内容 | 文件内包含 `/resume/my/upload`，`/resume/my`，`/resume/{id}/detail`，`/resume/{id}` DELETE，`/resume/{id}/default`，`/resume/{id}/parse`，`/resume/list` |
| AC-008 | `company.ts` 包含 CompanyController + CompanyApplicationController 全部 26 个接口 | Logic | 读取文件内容 | 文件内包含 `/company/info` GET/PUT，`/company/auth`，`/company/job` POST，`/company/job/list`，`/company/job/{id}` GET/PUT，`/company/job/{id}/status`，`/company/job/{id}/publish`，`/company/job/{id}/close`，`/company/job/{id}/salary`，`/company/job/{id}/parse`，`/company/job/{id}/graph`，`/company/match/{resumeId}`，`/company/recommend/resumes`，`/company/create`，`/company/staff/create`，`/company/staff/{staffId}/reset-password`，`/company/applications` 系列，`/company/talent-pool` 系列 |
| AC-009 | `match.ts` 包含 MatchController + MatchGraphController 全部 6 个接口 | Logic | 读取文件内容 | 文件内包含 `/match/trigger`，`/match/{matchId}/detail`，`/match/resume/{resumeId}/list`，`/match/job/{jobId}/list`，`/match/person/{personId}/job/{jobId}/graph-score` |
| AC-010 | `notification.ts` 包含 NotificationController 全部 9 个接口 | Logic | 读取文件内容 | 文件内包含 `/notifications/{id}` GET/DELETE，`/notifications/user/{userId}` GET，`/notifications/user/{userId}/unread` GET，`/notifications/user/{userId}/type/{type}` GET，`/notifications/user/{userId}/unread-count` GET，`/notifications/{id}/read` PUT，`/notifications/{id}/unread` PUT，`/notifications/user/{userId}/read-all` PUT |
| AC-011 | `skillTag.ts` 包含 SkillTagController 全部 11 个接口 | Logic | 读取文件内容 | 文件内包含 `/skill-tags` GET/POST，`/skill-tags/{id}` GET/PUT/DELETE，`/skill-tags/name/{name}` GET，`/skill-tags/category/{category}` GET，`/skill-tags/{id}/synonyms` POST/DELETE，`/skill-tags/{id}/category` PUT，`/skill-tags/normalize` POST |
| AC-012 | `public.ts` 包含 PublicCompanyController + PublicJobController 全部 4 个接口 | Logic | 读取文件内容 | 文件内包含 `/public/companies` GET，`/public/companies/{id}` GET，`/public/jobs` GET，`/public/jobs/{id}` GET |
| AC-013 | Person 模块路径修正：`/person/info`（SESSION）而非 `/person/{userId}` | Logic | 搜索文件内容 | `person.ts` 中无 `/person/{userId}` 路径，所有 GET/PUT person info 使用 `/person/info` |
| AC-014 | Resume 模块路径修正：`/resume/my/*` 而非 `/resume/user/{userId}` | Logic | 搜索文件内容 | `resume.ts` 中无 `/resume/user/` 路径，使用 `/resume/my/upload` 和 `/resume/my` |
| AC-015 | Notification 模块路径修正：`/notifications/user/{userId}/*` | Logic | 搜索文件内容 | `notification.ts` 中路径格式为 `/notifications/user/{userId}/...` |
| AC-016 | 后端 118 个接口全部覆盖：Auth 11 + Admin 21 + Category 4 + Person 15 + Resume 7 + Company 26 + Match 6 + Notification 9 + SkillTag 11 + Public 4 | Logic | 对照后端 Controller 逐个统计 | 每个 Controller 的每个接口都在前端 API 文件中存在 |
| AC-017 | `recommendation.ts` 接口已迁移至 `company.ts` | Logic | 读取 company.ts | 人才池相关 `POST /company/talent-pool`、`DELETE /company/talent-pool/{resumeId}`、`GET /company/talent-pool` 存在于 `company.ts` |
| AC-018 | `skill-graph.ts` 接口已迁移至 `match.ts` | Logic | 读取 match.ts | 图谱评分 `GET /match/person/{personId}/job/{jobId}/graph-score` 存在于 `match.ts` |
| AC-019 | `homeApi.ts` 接口已分散至 `public.ts` 和 `person.ts` | Logic | 读取 public.ts 和 person.ts | 首页数据接口（`/public/jobs`、`/person/recommend/jobs`、`/person/match/{jobId}`）存在于对应模块文件 |
| AC-020 | 文件组织与后端模块一一对应 | Logic | 对照 spec 文件结构表 | 10 个文件的模块归属与 spec 中定义一致 |
