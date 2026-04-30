# 首页 Hero 右侧轻奢重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将首页 Hero 右侧视觉从普通图片卡升级为轻奢玻璃态信息视觉。

**Architecture:** 在现有 Hero 右侧容器中保留主图，新增渐变柔光背景、玻璃态悬浮指标卡和底部三列指标条；在 Next 页面和 mock-user 页面双写保持一致，并通过页面测试验证关键文案存在。

**Tech Stack:** React, Next.js, Tailwind CSS, Framer Motion, Vitest

---

### Task 1: 先写失败测试（TDD RED）

**Files:**
- Modify: `frontend/tests/pages/page.test.tsx`

- [x] **Step 1: 添加右侧新文案断言**
- [x] **Step 2: 运行 `npm run test:run -- tests/pages/page.test.tsx`，确认失败**

### Task 2: 实现右侧轻奢视觉（TDD GREEN）

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/features/mock-user/pages/Home.tsx`

- [x] **Step 1: 重构 Hero 右侧容器与视觉层（主图、柔光、玻璃态浮层、底部指标条）**
- [x] **Step 2: 引入并使用 `Target` 图标作为主指标卡视觉锚点**
- [x] **Step 3: 回跑 `npm run test:run -- tests/pages/page.test.tsx`，确认通过**

### Task 3: 完整验证

**Files:**
- Modify: `frontend/tests/pages/page.test.tsx`

- [ ] **Step 1: 运行前端构建 `npm run build`**
- [ ] **Step 2: 运行前端测试 `npm run test:run`**
- [ ] **Step 3: 运行后端编译 `mvn compile`**
- [ ] **Step 4: 运行后端测试 `mvn test`**
- [ ] **Step 5: 使用 CDP 浏览器验证首页视觉效果**
