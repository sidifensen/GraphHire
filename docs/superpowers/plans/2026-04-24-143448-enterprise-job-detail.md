# 企业端职位详情入口与详情页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在企业端职位管理列表新增“详情”按钮并提供独立职位详情页，支持加载成功、错误、重试流程。

**Architecture:** 复用现有企业端接口 `GET /company/job/{id}`，在前端新增 `companyApi.getJobDetail` 与详情类型定义。列表页仅添加链接入口，详情页负责读取路由参数并渲染职位完整信息。通过 Vitest 页面级测试覆盖入口与详情页状态流转。

**Tech Stack:** Next.js App Router、React、TypeScript、Vitest、Testing Library

---

### Task 1: 先写失败测试（列表页详情入口）

**Files:**
- Modify: `frontend/src/tests/pages/enterprise-jobs.test.tsx`

- [ ] **Step 1: Add failing assertion for detail link**
- [ ] **Step 2: Run target test and confirm RED**
Run: `npm run test:run -- src/tests/pages/enterprise-jobs.test.tsx`
Expected: FAIL because “详情”链接不存在

### Task 2: 先写失败测试（详情页）

**Files:**
- Create: `frontend/src/tests/pages/enterprise-job-detail.test.tsx`

- [ ] **Step 1: Add failing tests for success/invalid-id/error-retry states**
- [ ] **Step 2: Run target test and confirm RED**
Run: `npm run test:run -- src/tests/pages/enterprise-job-detail.test.tsx`
Expected: FAIL because page/API/type not implemented

### Task 3: 最小实现使测试转绿

**Files:**
- Modify: `frontend/src/app/enterprise/jobs/page.tsx`
- Create: `frontend/src/app/enterprise/jobs/[id]/page.tsx`
- Modify: `frontend/src/lib/api/company.ts`
- Modify: `frontend/src/lib/types/enterprise.ts`

- [ ] **Step 1: Add getJobDetail API and detail types**
- [ ] **Step 2: Add detail link to jobs list item**
- [ ] **Step 3: Implement job detail page with loading/error/retry/success rendering**
- [ ] **Step 4: Run focused tests and confirm GREEN**
Run: `npm run test:run -- src/tests/pages/enterprise-jobs.test.tsx src/tests/pages/enterprise-job-detail.test.tsx`
Expected: PASS

### Task 4: 全量验证与浏览器验证

**Files:**
- N/A

- [ ] **Step 1: Frontend build**
Run: `npm run build` (cwd `frontend`)
Expected: exit 0
- [ ] **Step 2: Frontend tests**
Run: `npm run test:run` (cwd `frontend`)
Expected: all pass
- [ ] **Step 3: Backend compile**
Run: `mvn compile` (cwd `backend`)
Expected: BUILD SUCCESS
- [ ] **Step 4: Backend tests**
Run: `mvn test` (cwd `backend`)
Expected: BUILD SUCCESS
- [ ] **Step 5: Browser verification via CDP**
Use chrome-devtools to open enterprise jobs page and click detail entry; confirm detail page renders expected info.

### Task 5: 提交变更

**Files:**
- Modify/Create all above files

- [ ] **Step 1: Stage only related files**
- [ ] **Step 2: Commit with Chinese Conventional Commit message**
Suggested: `feat(enterprise): 新增职位管理详情页入口与详情展示`
