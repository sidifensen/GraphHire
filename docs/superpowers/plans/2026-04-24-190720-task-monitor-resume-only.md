# 任务监控简历解析单类型化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将任务监控链路统一为“仅简历解析”，并补齐任务表格关键信息展示。  
**Architecture:** 后端扩展任务 DTO + 映射并收敛类型过滤，数据库通过 migration 更新注释语义，前端扩展任务类型定义与表格列渲染。全过程以 TDD 执行：先补失败测试，再最小改动使测试通过。  
**Tech Stack:** Spring Boot + MyBatis-Plus + PostgreSQL(Flyway SQL) + Next.js + React + Vitest

---

### Task 1: 后端任务列表字段与类型收敛（AC-001/AC-002/AC-003）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java`
- Modify: `backend/src/main/java/com/graphhire/admin/interfaces/dto/response/AdminTaskItemResponse.java`
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Modify: `backend/src/main/java/com/graphhire/resume/domain/model/ParseTask.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/ParseTaskRepositoryImpl.java`

- [ ] **Step 1: 先写失败测试**
- [ ] **Step 2: 运行后端单测确认失败**
- [ ] **Step 3: 实现最小代码改动**
- [ ] **Step 4: 再跑后端单测确认通过**

### Task 2: 数据库注释迁移（AC-004）

**Files:**
- Create: `backend/src/main/resources/db/migration/V2026_04_24_008__restrict_parse_task_to_resume_only.sql`

- [ ] **Step 1: 新增 migration 并更新 `task_type`/`source_id` 注释**
- [ ] **Step 2: 检查命名与版本号连续性**

### Task 3: 前端任务监控筛选与表格扩展（AC-005/AC-006/AC-007）

**Files:**
- Modify: `frontend/src/tests/pages/admin-task-monitor.test.tsx`
- Modify: `frontend/src/lib/api/admin.ts`
- Modify: `frontend/src/app/admin/task-monitor/page.tsx`

- [ ] **Step 1: 先补失败测试（下拉项与新增列）**
- [ ] **Step 2: 运行前端页面测试确认失败**
- [ ] **Step 3: 实现前端数据类型和渲染逻辑**
- [ ] **Step 4: 再跑前端页面测试确认通过**

### Task 4: 全量验证与提交

**Files:**
- Modify: `RELEASE-NOTES.md`（如仓库已有版本记录规范时补充）

- [ ] **Step 1: 前端 `npm run build`**
- [ ] **Step 2: 前端 `npm run test:run`**
- [ ] **Step 3: 后端 `mvn compile`**
- [ ] **Step 4: 后端 `mvn test`**
- [ ] **Step 5: 使用 `/web-access` + CDP 打开任务监控页做浏览器验证**
- [ ] **Step 6: `git add` + 中文 Conventional Commit**

