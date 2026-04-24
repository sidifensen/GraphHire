# 管理端页面直接替换 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将管理端页面替换为参考设计风格，并修复 Header/Sidebar/Login 的一致性与可用性。

**Architecture:** 保持现有 Next.js 路由与 `adminApi` 数据流不变，仅替换管理端壳层组件与登录页视觉结构。通过 `AdminShell` 统一容器，页面级逻辑最小改动以降低回归风险。

**Tech Stack:** Next.js, React, TypeScript, TailwindCSS, Vitest, Testing Library

---

### Task 1: 登录页替换（TDD）

**Files:**
- Modify: `frontend/src/app/admin/login/page.tsx`
- Test: `frontend/src/tests/pages/admin-login.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it('renders new admin login hero and submits credentials', async () => {
  // assert: GraphHire + 欢迎回来 + 登录提交行为
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/tests/pages/admin-login.test.tsx`
Expected: FAIL（新文案或行为断言未满足）

- [ ] **Step 3: Write minimal implementation**

```tsx
// 在 page.tsx 中替换为参考模板结构，保留 adminApi.login + authStore + router.push
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/tests/pages/admin-login.test.tsx`
Expected: PASS

### Task 2: 侧边栏与 Header 统一（TDD）

**Files:**
- Modify: `frontend/src/components/admin/AdminSidebar.tsx`
- Modify: `frontend/src/components/admin/AdminHeader.tsx`
- Modify: `frontend/src/components/admin/AdminShell.tsx`
- Test: `frontend/src/tests/pages/admin-shell.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it('renders admin brand/sidebar nav and header user menu', async () => {
  // assert: GraphHire, 图谱智聘管理端, 用户菜单可展开
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/tests/pages/admin-shell.test.tsx`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```tsx
// 统一 sidebar/header 样式与结构；保持路由映射与登出逻辑
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/tests/pages/admin-shell.test.tsx`
Expected: PASS

### Task 3: 设置页接入统一壳层（TDD）

**Files:**
- Modify: `frontend/src/app/admin/settings/page.tsx`
- Test: `frontend/src/tests/pages/admin-settings-layout.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it('uses admin shell in settings page', () => {
  // assert: settings page wrapped by AdminShell layout semantics
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/tests/pages/admin-settings-layout.test.tsx`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```tsx
// settings 页面改为复用 <AdminShell activeItem="settings">
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/tests/pages/admin-settings-layout.test.tsx`
Expected: PASS

### Task 4: 全量验证

**Files:**
- No code change expected

- [ ] **Step 1: Run frontend tests**

Run: `npm run test:run`
Expected: PASS

- [ ] **Step 2: Run frontend build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Run backend compile and tests**

Run: `mvn compile` and `mvn test` in `backend`
Expected: PASS

- [ ] **Step 4: Browser verification via web-access (CDP)**

Run: open `/admin/login` and `/admin/dashboard`
Expected: 页面正常渲染、Header/Sidebar/Login 样式与交互可用
