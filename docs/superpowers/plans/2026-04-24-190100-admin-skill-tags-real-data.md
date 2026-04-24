# Admin Skill Tags Real Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让管理端标签管理页面与后端真实技能表字段保持一致并补齐编辑/删除操作入口。

**Architecture:** 保留现有页面结构与分页逻辑，移除无效筛选与无来源字段，仅通过搜索关键字驱动数据拉取。表格聚焦名称、同义词、操作三列，并对空同义词做兜底。

**Tech Stack:** Next.js + React + TypeScript + Vitest + Testing Library

---

### Task 1: 先写失败测试锁定页面行为

**Files:**
- Create: `frontend/src/tests/pages/admin-skill-tags-page.test.tsx`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Assert only search input remains and list contains edit/delete**

### Task 2: 页面实现对齐真实字段

**Files:**
- Modify: `frontend/src/app/admin/skill-tags/page.tsx`

- [ ] **Step 1: Remove category/status/filter UI**
- [ ] **Step 2: Remove category/refCount rendering and mapping**
- [ ] **Step 3: Keep keyword search + pagination load**
- [ ] **Step 4: Add visible edit/delete action buttons**

### Task 3: 修复并补齐测试

**Files:**
- Modify: `frontend/src/tests/pages/admin-skill-tags-page.test.tsx`
- Modify: `frontend/src/tests/pages/admin-skill-tags-null-category.test.tsx`

- [ ] **Step 1: Mock prompt/confirm for edit/delete**
- [ ] **Step 2: Update null-safe assertion for synonyms fallback**
- [ ] **Step 3: Run target tests and verify pass**

### Task 4: 全量验证

**Files:**
- Modify: none

- [ ] **Step 1: Run `npm run build` in frontend**
- [ ] **Step 2: Run `npm run test:run` in frontend**
- [ ] **Step 3: Run `mvn compile` in backend**
- [ ] **Step 4: Run `mvn test` in backend**
- [ ] **Step 5: Do browser verification on admin skill-tags page via web-access/CDP**
