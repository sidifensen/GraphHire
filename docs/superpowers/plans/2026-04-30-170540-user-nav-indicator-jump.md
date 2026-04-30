# 用户端顶部导航激活态漂移修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复用户端桌面顶部导航激活态从下方漂移的问题，确保激活态在菜单间水平平滑过渡。

**Architecture:** 用容器级单实例导航指示器替代 `layoutId` 共享布局动画。通过菜单项与容器的几何差计算横向位移和宽度，并将动画限制在 X 轴。

**Tech Stack:** Next.js 16、React 19、framer-motion、Vitest

---

### Task 1: 建立指示器计算回归测试（RED）

**Files:**
- Create: `frontend/src/tests/components/mock-user-navbar-indicator-metrics.test.ts`

- [x] **Step 1: 写失败测试**
- [x] **Step 2: 运行测试并验证失败**

### Task 2: 实现水平指示器计算（GREEN）

**Files:**
- Create: `frontend/src/lib/ui/nav-indicator.ts`
- Modify: `frontend/src/app/(user)/_mock/components/Navbar.tsx`

- [x] **Step 1: 新增计算函数 `resolveHorizontalIndicatorMetrics`，输出 `x/y/width` 且 `y=0`**
- [x] **Step 2: 用容器级单实例 `motion.div` 指示器替代 `layoutId` 共享动画**
- [x] **Step 3: 绑定路由变化与窗口 resize 重算逻辑**
- [x] **Step 4: 运行新增测试并验证通过**

### Task 3: 全量验证与浏览器验收

**Files:**
- Verify only

- [x] **Step 1: 运行前后端编译与测试命令**
- [x] **Step 2: 用 CDP 浏览器复现并确认修复**
