# Mobile User Original Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户端手机版按参考目录整套重写并同步最新夜间模式与切换按钮，同时保留现有 Next.js 路由壳和路径映射。  
**Architecture:** 保持 `frontend/src/app/mobile-user/**` 的路由文件与 `device-routing` 契约不变，把参考目录的页面、共享组件、主题上下文和样式变量迁入现有私有目录；通过先失败后通过的测试锁定主题切换与导航行为。  
**Tech Stack:** Next.js, React, TailwindCSS, Vitest, Testing Library

---

### Task 1: 为夜间模式与壳层补失败测试（AC-002, AC-003, AC-005）

**Files:**
- Modify: `frontend/src/tests/app/mobile-user-shell.test.tsx`
- Modify: `frontend/src/tests/app/mobile-user-structure.test.ts`
- Create: `frontend/src/tests/app/mobile-user-theme.test.tsx`

- [ ] Step 1: 在 `mobile-user-shell` 和新增主题测试中断言当前实现应具备“夜间模式”入口、主题根类切换和底部导航显示规则。
- [ ] Step 2: 运行 `npm run test:run -- src/tests/app/mobile-user-shell.test.tsx src/tests/app/mobile-user-theme.test.tsx src/tests/lib/device-routing.test.ts`，确认至少主题相关断言失败。

### Task 2: 迁入主题上下文与样式变量（AC-003, AC-004, AC-006）

**Files:**
- Create: `frontend/src/app/mobile-user/_context/ThemeContext.tsx`
- Modify: `frontend/src/app/mobile-user/layout.tsx`
- Modify: `frontend/src/app/mobile-user/_components/MobileShell.tsx`
- Modify: `frontend/src/app/mobile-user/_styles/mobile-user.css`

- [ ] Step 1: 将参考目录 `ThemeContext.tsx` 改造成可在 Next 客户端组件中使用的主题 Provider。
- [ ] Step 2: 在移动端布局或壳组件中挂载主题 Provider 与主题根类。
- [ ] Step 3: 将移动端样式变量扩展为亮色/暗色双主题并绑定 `light`/`dark` class。
- [ ] Step 4: 运行 `npm run test:run -- src/tests/app/mobile-user-theme.test.tsx src/tests/app/mobile-user-shell.test.tsx`，确认通过。

### Task 3: 按参考目录重写共享组件和页面（AC-001, AC-002, AC-006）

**Files:**
- Modify: `frontend/src/app/mobile-user/_components/BottomNav.tsx`
- Modify: `frontend/src/app/mobile-user/_components/TopNav.tsx`
- Modify: `frontend/src/app/mobile-user/_components/Skeleton.tsx`
- Modify: `frontend/src/app/mobile-user/_data/mockData.ts`
- Modify: `frontend/src/app/mobile-user/_data/types.ts`
- Modify: `frontend/src/app/mobile-user/_hooks/useLoading.ts`
- Modify: `frontend/src/app/mobile-user/page.tsx`
- Modify: `frontend/src/app/mobile-user/jobs/page.tsx`
- Modify: `frontend/src/app/mobile-user/jobs/[id]/page.tsx`
- Modify: `frontend/src/app/mobile-user/companies/page.tsx`
- Modify: `frontend/src/app/mobile-user/companies/[id]/page.tsx`
- Modify: `frontend/src/app/mobile-user/profile/page.tsx`
- Modify: `frontend/src/app/mobile-user/personal-info/page.tsx`
- Modify: `frontend/src/app/mobile-user/resume/page.tsx`
- Modify: `frontend/src/app/mobile-user/applications/page.tsx`
- Modify: `frontend/src/app/mobile-user/notifications/page.tsx`
- Modify: `frontend/src/app/mobile-user/graph/page.tsx`
- Modify: `frontend/src/app/mobile-user/login/page.tsx`
- Modify: `frontend/src/app/mobile-user/register/page.tsx`

- [ ] Step 1: 以参考目录为准整页覆盖共享组件和所有移动端用户页面，仅保留 Next 路由适配接口。
- [ ] Step 2: 在 `profile/page.tsx` 中加入夜间模式卡片和切换按钮，并让其他页面颜色全部回到主题变量。
- [ ] Step 3: 运行 `npm run test:run -- src/tests/app/mobile-user-theme.test.tsx src/tests/app/mobile-user-shell.test.tsx src/tests/app/mobile-user-structure.test.ts src/tests/lib/device-routing.test.ts`，确认通过。

### Task 4: 全量验证与浏览器验收（AC-007, AC-008, AC-009, AC-010, AC-011）

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] Step 1: 在 `frontend` 目录运行 `npm run build`。
- [ ] Step 2: 在 `frontend` 目录运行 `npm run test:run`。
- [ ] Step 3: 在 `backend` 目录运行 `mvn compile`。
- [ ] Step 4: 在 `backend` 目录运行 `mvn test`。
- [ ] Step 5: 通过 CDP 以移动端视口打开首页和我的页，验证夜间模式按钮与整体样式，并留存截图。
- [ ] Step 6: 在 `RELEASE-NOTES.md` 记录本次用户端手机版重写。

### Task 5: 提交收尾

**Files:**
- N/A

- [ ] Step 1: `git add` 暂存改动。
- [ ] Step 2: 使用中文规范提交，例如：`feat: 重写用户端手机版并同步夜间模式`.
