# 管理端登录页渐变修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让管理端登录页恢复原型中的左上角深蓝渐变和卡片环境光晕，同时保持现有登录逻辑不变。

**Architecture:** 通过单页 Tailwind 结构调整修复背景视觉层次，并新增 Vitest 页面测试锁定关键 DOM 和内联样式，避免后续再次被改淡。

**Tech Stack:** Next.js 16 + React 19 + TailwindCSS 3 + Vitest

---

### Task 1: 锁定视觉结构的失败测试

**Files:**
- Create: `frontend/tests/pages/admin-login.test.tsx`
- Test: `frontend/tests/pages/admin-login.test.tsx`

- [ ] **Step 1: 编写页面结构测试**
- [ ] **Step 2: 编写背景渐变测试**
- [ ] **Step 3: 编写卡片光晕测试**
- [ ] **Step 4: 运行测试确认失败**

### Task 2: 修复登录页背景层次

**Files:**
- Modify: `frontend/src/app/admin/login/page.tsx`
- Test: `frontend/tests/pages/admin-login.test.tsx`

- [ ] **Step 1: 为背景层添加可测试标识并增强左上角深蓝渐变**
- [ ] **Step 2: 在登录卡片内部添加环境光晕**
- [ ] **Step 3: 运行测试确认通过**

### Task 3: 构建验证与页面验收

**Files:**
- Modify: `frontend/src/app/admin/login/page.tsx`
- Test: `frontend/tests/pages/admin-login.test.tsx`

- [ ] **Step 1: 运行相关测试**
- [ ] **Step 2: 运行生产构建**
- [ ] **Step 3: 通过 `/web-access` 打开本地管理端登录页完成验收**
