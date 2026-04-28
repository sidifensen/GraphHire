# 企业端手机版原版对齐重写实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将企业端手机版页面按原版目录进行直接重写，恢复一致的移动端 UI 结构和交互入口。  
**Architecture:** 保持 Next.js app router 与企业端鉴权壳，重写 `mobile-enterprise` 页面层与壳层样式类，对齐原版布局；通过测试先失败后通过保障重写行为。  
**Tech Stack:** Next.js, React, TailwindCSS, Vitest, Testing Library

---

### Task 1: 更新测试为原版样式期望（RED）

**Files:**
- Modify: `frontend/src/tests/app/mobile-enterprise-shell.test.tsx`
- Modify: `frontend/src/tests/app/mobile-enterprise-dashboard-page.test.tsx`
- Modify: `frontend/src/tests/app/mobile-enterprise-team-page.test.tsx`

- [ ] Step 1: 将断言从“全宽”改为“375 容器 + 居中壳”。
- [ ] Step 2: 运行 `npm run test:run -- src/tests/app/mobile-enterprise-shell.test.tsx src/tests/app/mobile-enterprise-dashboard-page.test.tsx src/tests/app/mobile-enterprise-team-page.test.tsx`，确认失败。

### Task 2: 按原版重写页面与壳层（GREEN）

**Files:**
- Modify: `frontend/src/app/mobile-enterprise/_components/MobileEnterpriseShell.tsx`
- Modify: `frontend/src/app/mobile-enterprise/_components/TopNav.tsx`
- Modify: `frontend/src/app/mobile-enterprise/_components/BottomNav.tsx`
- Modify: `frontend/src/app/mobile-enterprise/page.tsx`
- Modify: `frontend/src/app/mobile-enterprise/jobs/page.tsx`
- Modify: `frontend/src/app/mobile-enterprise/jobs/create/page.tsx`
- Modify: `frontend/src/app/mobile-enterprise/jobs/[id]/page.tsx`
- Modify: `frontend/src/app/mobile-enterprise/jobs/[id]/edit/page.tsx`
- Modify: `frontend/src/app/mobile-enterprise/recommendations/page.tsx`
- Modify: `frontend/src/app/mobile-enterprise/team/page.tsx`
- Modify: `frontend/src/app/mobile-enterprise/messages/page.tsx`
- Create: `frontend/src/app/mobile-enterprise/candidate/[id]/page.tsx`

- [ ] Step 1: 直接覆盖重写目标页面，恢复原版布局与样式类。
- [ ] Step 2: 推荐页恢复“详情”跳转；新增候选人详情页路由文件。
- [ ] Step 3: 运行 Task 1 的定向测试，确认通过。

### Task 3: 全量验证与浏览器验收

**Files:**
- Modify: `RELEASE-NOTES.md`（如需记录）

- [ ] Step 1: 前端 `npm run build`
- [ ] Step 2: 前端 `npm run test:run`
- [ ] Step 3: 后端 `mvn compile`
- [ ] Step 4: 后端 `mvn test`
- [ ] Step 5: 使用 CDP 打开企业端手机版路径完成页面目视验证并截图留证。

### Task 4: 提交收尾

**Files:**
- N/A

- [ ] Step 1: `git add` 暂存改动。
- [ ] Step 2: 使用中文规范提交，例如：`feat: 重写企业端手机版并对齐原版页面`.
