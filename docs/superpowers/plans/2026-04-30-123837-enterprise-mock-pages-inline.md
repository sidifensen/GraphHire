# 企业端 Mock 页面内联迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将企业端 9 个页面实现直接落到对应 Next.js `page.tsx`，移除 `_mock/pages` 转发层。  
**Architecture:** 先用静态测试锁定“不可再引用 `_mock/pages` / `react-router-dom` 且目录删除”的行为，再迁移 9 个页面并替换 Next 路由 API，最后执行全量验证。  
**Tech Stack:** Next.js App Router、TypeScript、Vitest、Maven

---

### Task 1: 建立失败测试（RED）

**Files:**
- Create: `frontend/tests/pages/enterprise/mock-pages-inline-migration.test.ts`
- Test: `frontend/tests/pages/enterprise/mock-pages-inline-migration.test.ts`

- [ ] **Step 1: 写失败测试**
```ts
import { describe, expect, it } from 'vitest';

describe('enterprise mock pages inline migration', () => {
  it('fails before migration when page wrappers still import _mock/pages', () => {
    expect(true).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

Run: `npm run test:run -- tests/pages/enterprise/mock-pages-inline-migration.test.ts`  
Expected: FAIL

### Task 2: 迁移 9 个路由页面（GREEN）

**Files:**
- Modify: `frontend/src/app/enterprise/candidates/[id]/page.tsx`
- Modify: `frontend/src/app/enterprise/dashboard/page.tsx`
- Modify: `frontend/src/app/enterprise/employees/page.tsx`
- Modify: `frontend/src/app/enterprise/jobs/page.tsx`
- Modify: `frontend/src/app/enterprise/jobs/new/page.tsx`
- Modify: `frontend/src/app/enterprise/jobs/[id]/page.tsx`
- Modify: `frontend/src/app/enterprise/jobs/[id]/edit/page.tsx`
- Modify: `frontend/src/app/enterprise/notifications/page.tsx`
- Modify: `frontend/src/app/enterprise/recommendations/page.tsx`
- Delete: `frontend/src/app/enterprise/_mock/pages/*`

- [ ] **Step 1: 将 `_mock/pages` 内容内联到各自 `page.tsx`**
- [ ] **Step 2: 将 `react-router-dom` 改为 `next/link` 与 `next/navigation`**
- [ ] **Step 3: 统一企业端内部路径为 `/enterprise/*`**
- [ ] **Step 4: 删除 `frontend/src/app/enterprise/_mock/pages` 目录**

### Task 3: 回归测试（GREEN）

**Files:**
- Modify: `frontend/tests/pages/enterprise/mock-pages-inline-migration.test.ts`
- Test: `frontend/tests/pages/enterprise/mock-pages-inline-migration.test.ts`

- [ ] **Step 1: 将失败测试替换为真实断言**
- [ ] **Step 2: 运行测试验证通过**

Run: `npm run test:run -- tests/pages/enterprise/mock-pages-inline-migration.test.ts`  
Expected: PASS

### Task 4: 仓库强制验证与浏览器验证

**Files:**
- None

- [ ] **Step 1: 前端构建**

Run: `npm run build` (cwd: `frontend`)  
Expected: 成功

- [ ] **Step 2: 前端测试**

Run: `npm run test:run` (cwd: `frontend`)  
Expected: 成功

- [ ] **Step 3: 后端编译**

Run: `mvn compile` (cwd: `backend`)  
Expected: 成功

- [ ] **Step 4: 后端测试**

Run: `mvn test` (cwd: `backend`)  
Expected: 成功

- [ ] **Step 5: CDP 浏览器验证**

Open: `/enterprise/dashboard`、`/enterprise/jobs`、`/enterprise/recommendations`  
Expected: 页面可见关键文案、无明显崩溃

### Task 5: 提交与收尾

**Files:**
- Modify/Create/Delete: 本次变更全部文件

- [ ] **Step 1: `git add` 本次变更**
- [ ] **Step 2: 使用中文规范提交信息提交（建议 `refactor: 企业端页面内联迁移到Next路由`）**
- [ ] **Step 3: 产出变更说明并提供后续选项**
