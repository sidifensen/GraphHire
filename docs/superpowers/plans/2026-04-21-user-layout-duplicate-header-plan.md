# 用户端个人空间重复 Header 修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复个人空间页面顶部与底部公共壳重复渲染的问题，同时保留侧边栏与页面主体结构。

**Architecture:** 保留 `components/UserLayout.tsx` 作为个人空间页面壳，让其继续负责 `Header`、`Sidebar`、`Footer`；将 `app/(user)/UserLayoutClient.tsx` 收缩为纯容器，避免与页面级壳重复承担公共导航职责。先补布局组合测试暴露重复渲染，再做最小实现并做浏览器验证。

**Tech Stack:** Next.js、TypeScript、Vitest、Testing Library

---

### Task 1: 为重复公共壳补失败测试（对应 AC-001 ~ AC-003）

**Files:**
- Create: `frontend/tests/layouts/user-layout-shell.test.tsx`
- Inspect: `frontend/src/app/(user)/UserLayoutClient.tsx`
- Inspect: `frontend/src/components/UserLayout.tsx`
- Inspect: `frontend/src/components/Header.tsx`
- Inspect: `frontend/src/components/Footer.tsx`

- [ ] **Step 1: 编写组合渲染测试**

覆盖点：
- `UserLayoutClient` 包裹 `UserLayout`
- `GraphHire 图谱智聘` 只出现 1 次
- `© 2026 GraphHire 图谱智聘` 只出现 1 次
- `智聘空间` 与示例内容同时存在

- [ ] **Step 2: 运行测试确认处于 RED**

Run: `npm --prefix frontend test -- user-layout-shell.test.tsx`
Expected: FAIL，失败原因是 Header/Footer 被渲染了两次。

### Task 2: 实现最小布局修复（对应 AC-001 ~ AC-003）

**Files:**
- Modify: `frontend/src/app/(user)/UserLayoutClient.tsx`

- [ ] **Step 1: 移除路由组布局中的重复 Header/Footer**

要求：
- 删除 `Header`、`Footer` 引入
- 保留包裹 `children` 的基础容器
- 不改 `components/UserLayout.tsx` 现有 Sidebar + main 结构

- [ ] **Step 2: 运行测试确认转为 GREEN**

Run: `npm --prefix frontend test -- user-layout-shell.test.tsx`
Expected: PASS。

### Task 3: 做局部回归与浏览器验证（对应 AC-004 ~ AC-005）

**Files:**
- No additional code files required

- [ ] **Step 1: 运行相关前端测试回归**

Run: `npm --prefix frontend test -- profile.test.tsx resume-manage.test.tsx user-layout-shell.test.tsx`
Expected: PASS。

- [ ] **Step 2: 使用 `/web-access` 验证个人空间页面**

Expected: `/resume/manage`、`/profile` 顶部只显示 1 条导航，左侧侧边栏与正文显示正常。
