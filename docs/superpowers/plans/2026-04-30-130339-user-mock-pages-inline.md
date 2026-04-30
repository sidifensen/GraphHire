# 用户端 Mock 页面内联迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户端路由页从 `_mock/pages` 转发模式迁移为 `page.tsx` 直接实现。  
**Architecture:** 先用静态测试锁定迁移目标，再批量内联 12 个目标路由页并删除 `_mock/pages`，最后执行全量验证。  
**Tech Stack:** Next.js App Router、Vitest、Maven

---

### Task 1: 建立失败测试（RED）

**Files:**
- Create: `frontend/tests/pages/user/mock-pages-inline-migration.test.ts`

- [ ] **Step 1: 编写静态迁移断言**
- [ ] **Step 2: 运行并确认失败**

Run: `npm run test:run -- tests/pages/user/mock-pages-inline-migration.test.ts`  
Expected: FAIL

### Task 2: 批量内联用户端页面（GREEN）

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/app/(user)/applications/page.tsx`
- Modify: `frontend/src/app/(user)/companies/page.tsx`
- Modify: `frontend/src/app/(user)/companies/[id]/page.tsx`
- Modify: `frontend/src/app/(user)/jobs/page.tsx`
- Modify: `frontend/src/app/(user)/jobs/[id]/page.tsx`
- Modify: `frontend/src/app/(user)/notifications/page.tsx`
- Modify: `frontend/src/app/(user)/personal-info/page.tsx`
- Modify: `frontend/src/app/(user)/profile/page.tsx`
- Modify: `frontend/src/app/(user)/resume/manage/page.tsx`
- Modify: `frontend/src/app/(user)/resume/upload/page.tsx`
- Modify: `frontend/src/app/(user)/skill-graph/page.tsx`
- Delete: `frontend/src/app/(user)/_mock/pages/*`

- [ ] **Step 1: 用 `_mock/pages` 源码替换路由壳页**
- [ ] **Step 2: 替换路由页中的 `react-router-dom` 为 Next API**
- [ ] **Step 3: 删除用户端 `_mock/pages`**

### Task 3: 回归测试（GREEN）

**Files:**
- Modify: `frontend/tests/pages/user/mock-pages-inline-migration.test.ts`

- [ ] **Step 1: 运行迁移测试并确认通过**

Run: `npm run test:run -- tests/pages/user/mock-pages-inline-migration.test.ts`  
Expected: PASS

### Task 4: 强制验证

- [ ] **Step 1: 前端构建**
Run: `npm run build` (cwd: `frontend`)

- [ ] **Step 2: 前端测试**
Run: `npm run test:run` (cwd: `frontend`)

- [ ] **Step 3: 后端编译**
Run: `mvn compile` (cwd: `backend`)

- [ ] **Step 4: 后端测试**
Run: `mvn test` (cwd: `backend`)

- [ ] **Step 5: CDP 页面验证**
Open: `/`、`/jobs`、`/companies`

### Task 5: 提交

- [ ] **Step 1: `git add` 本次变更**
- [ ] **Step 2: 中文规范提交（建议 `refactor: 用户端页面内联迁移到Next路由页面`）**
