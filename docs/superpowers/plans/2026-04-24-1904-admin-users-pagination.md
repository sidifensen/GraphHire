# Admin Users Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复管理端用户列表分页，确保每页 10 条且分页器与总数一致。

**Architecture:** 以后端分页正确性为主、前端参数兜底为辅。先通过仓储层兜底避免全量回传，再修正服务层 total 语义，最后固定前端 pageSize 与页码边界。

**Tech Stack:** Spring Boot + MyBatis-Plus + Next.js + React + Vitest + JUnit5

---

### Task 1: 后端仓储分页兜底

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/infrastructure/persistence/repository/AdminRepositoryImpl.java`
- Test: `backend/src/test/java/com/graphhire/admin/infrastructure/persistence/repository/AdminRepositoryImplUnitTest.java`

- [ ] Step 1: 先写失败测试，模拟 selectPage 返回 28 条 records 但请求 pageSize=10。
- [ ] Step 2: 运行指定单测，确认失败（实际返回 28 条）。
- [ ] Step 3: 在仓储层加入 records 超长时的手动切片兜底。
- [ ] Step 4: 复跑单测，确认通过。

### Task 2: 后端用户分页 total 语义修正

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Test: `backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java`

- [ ] Step 1: 将用户分页返回 total 从 `list.size()` 改为 `page.getTotal()`。
- [ ] Step 2: 运行用户分页相关单测，确认无回归。

### Task 3: 前端分页器稳定性修正

**Files:**
- Modify: `frontend/src/app/admin/users/page.tsx`
- Test: `frontend/src/tests/pages/admin-users.test.tsx`

- [ ] Step 1: 固定 pageSize 为 10，不再使用响应体 pageSize 覆盖。
- [ ] Step 2: 增加 total 变化后的页码夹紧逻辑，避免页码越界。
- [ ] Step 3: 运行 admin-users 页面测试。

### Task 4: 验证

**Files:**
- N/A

- [ ] Step 1: 前端执行 `npm run build`。
- [ ] Step 2: 前端执行 `npm run test:run`（记录既有失败）。
- [ ] Step 3: 后端执行 `mvn compile` 与 `mvn test`。
- [ ] Step 4: 用 CDP 在浏览器中验证用户管理页分页文案与翻页行为。
