# Admin Skill Tags Display Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复标签管理页同义词与时间字段在兼容返回结构下不显示的问题。

**Architecture:** 在前端页面引入数据归一化层，统一兼容多种字段命名与同义词载荷格式，保证展示层稳定；通过单测锁定回归。

**Tech Stack:** Next.js + React + Vitest + Testing Library

---

### Task 1: 先写失败测试（RED）

**Files:**
- Modify: `frontend/src/tests/pages/admin-skill-tags-page.test.tsx`

- [ ] **Step 1: 写兼容字段失败用例**
- [ ] **Step 2: 运行单测，确认失败**

### Task 2: 最小实现（GREEN）

**Files:**
- Modify: `frontend/src/app/admin/skill-tags/page.tsx`

- [ ] **Step 1: 新增同义词归一化函数**
- [ ] **Step 2: 新增时间字段归一化函数**
- [ ] **Step 3: 在 `loadSkills` 映射中使用归一化逻辑**
- [ ] **Step 4: 运行对应单测，确认通过**

### Task 3: 回归验证与交付

**Files:**
- Modify: `RELEASE-NOTES.md`（如仓库已有发布说明流程）

- [ ] **Step 1: 执行前端构建与测试**
- [ ] **Step 2: 执行后端编译与测试**
- [ ] **Step 3: 通过 CDP 打开 `/admin/skill-tags` 做可视化验证**
- [ ] **Step 4: 提交变更（中文 Conventional Commit）**
