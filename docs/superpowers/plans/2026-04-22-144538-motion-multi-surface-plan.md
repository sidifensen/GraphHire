# Motion Multi Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Header、通知页、技能图谱页落地 Motion 的布局动画、列表过渡与 SVG 动画，提升交互反馈。

**Architecture:** 三个页面分别引入 Motion 组件；Header 与通知分类采用 `layoutId` 共享布局，通知列表使用 `AnimatePresence`，技能图谱评分卡使用 `motion.circle` 的 SVG 进度环。

**Tech Stack:** Next.js 16, React 19, TypeScript, Framer Motion, Vitest

---

### Task 1: TDD RED

**Files:**
- Modify: `frontend/tests/components/Header.test.tsx`
- Modify: `frontend/tests/pages/notifications.test.tsx`
- Modify: `frontend/tests/pages/skill-graph.test.tsx`

- [ ] **Step 1: 为 Header 增加激活动画指示器断言**
- [ ] **Step 2: 为通知分类切换增加指示器迁移断言**
- [ ] **Step 3: 为技能图谱增加评分环渲染断言**
- [ ] **Step 4: 运行测试并确认失败**

Run: `npm run test:run -- tests/components/Header.test.tsx tests/pages/notifications.test.tsx tests/pages/skill-graph.test.tsx`
Expected: FAIL（缺少动画 DOM 节点）

### Task 2: TDD GREEN

**Files:**
- Modify: `frontend/src/components/Header.tsx`
- Modify: `frontend/src/app/(user)/notifications/page.tsx`
- Modify: `frontend/src/app/(user)/skill-graph/page.tsx`

- [ ] **Step 1: Header 导航接入 `layoutId` 指示器**
- [ ] **Step 2: 通知分类接入 `layoutId` 指示器**
- [ ] **Step 3: 通知列表接入 `AnimatePresence` 过渡**
- [ ] **Step 4: 技能图谱接入 SVG 进度环动画**
- [ ] **Step 5: 使用 `useReducedMotion` 做降级支持**
- [ ] **Step 6: 运行目标测试并确认通过**

Run: `npm run test:run -- tests/components/Header.test.tsx tests/pages/notifications.test.tsx tests/pages/skill-graph.test.tsx`
Expected: PASS

### Task 3: 全量验证与提交

**Files:**
- Modify: `frontend/src/components/Header.tsx`
- Modify: `frontend/src/app/(user)/notifications/page.tsx`
- Modify: `frontend/src/app/(user)/skill-graph/page.tsx`

- [ ] **Step 1: 前端构建通过**
Run: `npm run build`
Expected: PASS

- [ ] **Step 2: 前端测试通过**
Run: `npm run test:run`
Expected: PASS

- [ ] **Step 3: 后端编译与测试执行**
Run: `mvn compile && mvn test`
Expected: compile PASS, test 结果如实记录

- [ ] **Step 4: CDP 浏览器验收**
Run: 打开 Header/通知/技能图谱页面验证动画表现
Expected: 满足 AC-001 ~ AC-005
