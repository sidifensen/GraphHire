# 用户端投递记录页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在用户端新增投递记录页面，支持列表查看、状态筛选、前端分页。

**Architecture:** 复用现有 `personApi.getApplications` 拉取数据，在页面端完成状态过滤与分页切片；复用现有用户端布局样式，新增页面与必要导航路由改动；通过 Vitest + RTL 做页面交互测试，按 TDD 实现。

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, React Testing Library

---

### Task 1: 建立页面测试（RED）

**Files:**
- Create: `frontend/tests/pages/applications.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// 覆盖：列表渲染、状态筛选、分页、未登录、错误重试
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/pages/applications.test.tsx`
Expected: FAIL (页面文件不存在或断言失败)

### Task 2: 实现投递记录页面（GREEN）

**Files:**
- Create: `frontend/src/app/(user)/applications/page.tsx`

- [ ] **Step 1: Write minimal implementation**

```tsx
// 读取登录态 -> 拉取投递记录 -> 状态筛选 + 前端分页 + 错误重试
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npm run test:run -- tests/pages/applications.test.tsx`
Expected: PASS

### Task 3: 接入导航与布局

**Files:**
- Modify: `frontend/src/components/user/UserSidebar.tsx`
- Modify: `frontend/src/components/layout/UserLayout.tsx`

- [ ] **Step 1: Update sidebar link and layout route visibility**

```tsx
// 投递记录 href 改为 /applications；布局前缀增加 /applications
```

- [ ] **Step 2: Add/Update related test**

```tsx
// 在 sidebar 相关测试中断言链接目标
```

- [ ] **Step 3: Run affected tests**

Run: `npm run test:run -- tests/components/Sidebar.test.tsx`
Expected: PASS

### Task 4: 回归验证与质量门禁

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: Run frontend checks**

Run: `npm run build`
Expected: BUILD SUCCESS

- [ ] **Step 2: Run frontend tests**

Run: `npm run test:run`
Expected: ALL PASS

- [ ] **Step 3: Browser verification via CDP**

Run: 使用 `chrome-devtools` 打开 `/applications` 验证列表、筛选、分页、异常展示流程
Expected: 交互正常

- [ ] **Step 4: Update release note**

```md
- feat: 新增用户端投递记录页面（列表/状态筛选/分页）
```
