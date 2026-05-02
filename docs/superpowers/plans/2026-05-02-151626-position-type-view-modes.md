# 职位类型管理新增展示模式 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在职位类型管理页新增“路径面包屑视图”和“分栏级联视图”，并保持既有两种模式不回归。

**Architecture:** 扩展前端 `viewMode`，围绕 `selectedId` 构建派生数据（祖先链、同级列表、三级分栏数据），不改后端接口。新增页面测试覆盖两个新视图和关键联动路径。

**Tech Stack:** Next.js + React + TypeScript + Vitest + Testing Library

---

### Task 1: 先写失败测试覆盖新视图

**Files:**
- Modify: `frontend/src/tests/pages/admin-position-types-page.test.tsx`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/tests/pages/admin-position-types-page.test.tsx`
Expected: FAIL（找不到新按钮/新视图结构）

### Task 2: 实现路径面包屑视图与分栏级联视图

**Files:**
- Modify: `frontend/src/app/admin/position-types/page.tsx`

- [ ] **Step 1: 扩展 viewMode 和按钮**
- [ ] **Step 2: 添加祖先链与同级节点派生函数并渲染面包屑视图**
- [ ] **Step 3: 添加三级分栏派生函数并渲染分栏级联视图**
- [ ] **Step 4: 保持详情区与 selectedId 同步**

### Task 3: 绿测与回归验证

**Files:**
- Modify: `frontend/src/tests/pages/admin-position-types-page.test.tsx`
- Modify: `frontend/src/app/admin/position-types/page.tsx`

- [ ] **Step 1: 运行单测并修复直到通过**

Run: `npm run test:run -- src/tests/pages/admin-position-types-page.test.tsx`
Expected: PASS

- [ ] **Step 2: 运行前端完整验证**

Run: `npm run test:run && npm run build`
Expected: 全部 PASS

### Task 4: 文档与发布记录

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 更新 RELEASE-NOTES 记录本次视图增强**
- [ ] **Step 2: 提交代码（中文前缀提交信息）**
