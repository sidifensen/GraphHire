# 管理端完全重写（静态模板迁移） Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `frontend` 管理端完全重做为模板风格，并保证构建、测试、浏览器验证通过。

**Architecture:** 保留 `/admin/*` 路由语义，页面内容与组件样式迁移自模板，统一由管理端壳层承载。数据层全部使用静态 mock 数据，禁用 API 拉取。动效依赖统一适配为 `framer-motion`。

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind, framer-motion, Vitest, Maven

---

### Task 1: 写失败测试覆盖管理端关键页面（RED）

**Files:**
- Create: `frontend/tests/admin/admin-pages.spec.tsx`
- Modify: `frontend/tests/setup.ts`（如需共享 mock）
- Test: `frontend/tests/admin/admin-pages.spec.tsx`

- [ ] **Step 1: 写失败测试**

```tsx
it('renders admin login hero and button', async () => {
  const LoginPage = (await import('@/app/admin/login/page')).default;
  render(<LoginPage />);
  expect(screen.getByText('欢迎回来')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '登 录' })).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd frontend && npm run test:run -- tests/admin/admin-pages.spec.tsx`
Expected: FAIL（页面关键文本未匹配或组件结构不一致）

### Task 2: 迁移管理端基础设施与壳层（GREEN）

**Files:**
- Create: `frontend/src/components/admin/AdminSidebar.tsx`
- Modify: `frontend/src/components/admin/AdminShell.tsx`
- Modify: `frontend/src/components/admin/AdminTopbar.tsx`
- Modify: `frontend/src/components/admin/AdminDataTable.tsx`
- Modify: `frontend/src/components/admin/AdminStatCard.tsx`
- Modify: `frontend/src/context/ThemeContext.tsx`
- Modify: `frontend/src/styles/globals.css`

- [ ] **Step 1: 写最小实现使布局测试可通过**
- [ ] **Step 2: 将 `motion/react` 适配为 `framer-motion`**
- [ ] **Step 3: 运行单测验证通过**

Run: `cd frontend && npm run test:run -- tests/admin/admin-pages.spec.tsx`
Expected: PASS

### Task 3: 迁移管理端页面到目标路由（GREEN）

**Files:**
- Modify: `frontend/src/app/admin/login/page.tsx`
- Modify: `frontend/src/app/admin/dashboard/page.tsx`
- Modify: `frontend/src/app/admin/enterprise-review/page.tsx`
- Modify: `frontend/src/app/admin/users/page.tsx`
- Modify: `frontend/src/app/admin/skill-tags/page.tsx`
- Modify: `frontend/src/app/admin/task-monitor/page.tsx`
- Modify: `frontend/src/app/admin/layout.tsx`

- [ ] **Step 1: 按映射关系迁移页面内容并保留静态 mock 数据**
- [ ] **Step 2: 确认页面未新增 API 请求副作用**
- [ ] **Step 3: 运行管理端测试集**

Run: `cd frontend && npm run test:run -- tests/admin/admin-pages.spec.tsx`
Expected: PASS

### Task 4: 全量验证（REFACTOR + VERIFY）

**Files:**
- Modify: `frontend/src/app/admin/page.tsx`（必要时重定向）
- Test: `frontend` 与 `backend` 构建/测试命令

- [ ] **Step 1: 前端构建验证**
Run: `cd frontend && npm run build`
Expected: exit code 0

- [ ] **Step 2: 后端编译验证**
Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 3: 前端测试验证**
Run: `cd frontend && npm run test:run`
Expected: 全部 PASS

- [ ] **Step 4: 后端测试验证**
Run: `cd backend && mvn test`
Expected: BUILD SUCCESS

- [ ] **Step 5: CDP 浏览器验证**
Run: 使用 `web-access` + CDP 打开 `/admin/login` 与 `/admin/dashboard`
Expected: 页面可渲染、导航可用、无明显报错

### Task 5: 提交与收尾

**Files:**
- Modify: `RELEASE-NOTES.md`（如项目约定需要记录）

- [ ] **Step 1: 仅暂存本次改造相关文件**
- [ ] **Step 2: 提交（中文 Conventional Commit）**

```bash
git add <本次文件>
git commit -m "feat(admin): 重写管理端并迁移静态模板"
```

- [ ] **Step 3: 执行收尾流程（code review + finishing branch）**
