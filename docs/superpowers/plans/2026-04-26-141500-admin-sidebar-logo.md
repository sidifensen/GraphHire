# Admin Sidebar Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将管理端侧边栏 logo 统一为 favicon，并消除展开/折叠导致的尺寸跳变。

**Architecture:** 在 `AdminSidebar` 品牌区域统一使用单一 logo 资源，展开态与折叠态共享固定图标尺寸，仅控制文字显隐，避免图标尺寸动画引发视觉抖动。

**Tech Stack:** Next.js、React、Tailwind CSS、Framer Motion、Vitest、Testing Library

---

### Task 1: 为品牌区补充失败测试

**Files:**
- Create: `frontend/src/tests/components/admin-sidebar-logo.test.tsx`
- Test: `frontend/src/tests/components/admin-sidebar-logo.test.tsx`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**

### Task 2: 实现品牌区 logo 统一和尺寸稳定

**Files:**
- Modify: `frontend/src/components/admin/AdminSidebar.tsx`
- Test: `frontend/src/tests/components/admin-sidebar-logo.test.tsx`

- [ ] **Step 1: Write minimal implementation**
- [ ] **Step 2: Run test to verify it passes**

### Task 3: 全量验证与浏览器检查

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: Run frontend build/test and backend compile/test**
- [ ] **Step 2: Run browser verification via CDP**
- [ ] **Step 3: Update release notes and commit**
