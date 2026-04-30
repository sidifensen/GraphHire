# 企业端桌面菜单切换动效 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让企业端桌面顶部菜单切换具备可感知的平滑滑块与交互过渡动画。

**Architecture:** 在现有 `TopNav` 组件内增强桌面导航容器、菜单项和激活态指示器样式；保持路由映射和移动端分支不变。通过现有 `framer-motion layoutId` 提升切换连续性。

**Tech Stack:** Next.js, React, Tailwind CSS, framer-motion, Vitest, Testing Library

---

### Task 1: 补充失败测试（RED）

**Files:**
- Create: `frontend/src/tests/components/mock-enterprise-topnav-desktop-animation.test.tsx`
- Test: `frontend/src/tests/components/mock-enterprise-topnav-desktop-animation.test.tsx`

- [ ] **Step 1: 编写失败测试**
- [ ] **Step 2: 运行单测确认失败（缺少导航轨道/指示器测试节点）**

### Task 2: 实现最小动效改动（GREEN）

**Files:**
- Modify: `frontend/src/app/enterprise/_mock/components/TopNav.tsx`
- Modify: `frontend/src/features/mock-enterprise/components/TopNav.tsx`

- [ ] **Step 1: 为桌面导航容器增加轨道样式和测试节点**
- [ ] **Step 2: 为激活态滑块增加测试节点与更顺滑的弹簧参数**
- [ ] **Step 3: 为菜单项/图标添加轻量过渡与 hover 微动效**
- [ ] **Step 4: 运行单测确认通过**

### Task 3: 全量验证与回归

**Files:**
- Modify: `none`

- [ ] **Step 1: 运行前端构建 `npm run build`**
- [ ] **Step 2: 运行前端测试 `npm run test:run`**
- [ ] **Step 3: 使用 CDP 做企业端桌面菜单切换验证**
