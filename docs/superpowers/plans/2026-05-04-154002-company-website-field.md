# 公司官网字段与联系邮箱移除 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将公司资料从联系邮箱切换为公司官网，完成数据库、后端接口、前端展示全链路一致性改造。

**Architecture:** 采用“先测试失败，再最小实现，再回归”的 TDD 路径。数据层以迁移脚本与 schema 基线双更新保证环境可重复；后端删除 `contactEmail` 字段链路并新增 `website` 映射；前端以类型与页面同步改造，确保企业端可编辑、用户端可见。

**Tech Stack:** Spring Boot, MyBatis-Plus, PostgreSQL, Next.js, Vitest, JUnit/MockMvc

---

### Task 1: 文档与数据库迁移基线

**Files:**
- Create: `backend/src/main/resources/db/migration/V2026_05_04_023__company_add_website_and_drop_contact_email.sql`
- Modify: `backend/src/main/resources/db/schema.sql`

- [ ] **Step 1: 新增迁移脚本**
- [ ] **Step 2: 更新 schema.sql 中 company 结构与注释**
- [ ] **Step 3: 用 PostgreSQL MCP 校验字段状态**

### Task 2: 后端测试先行（RED）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/job/interfaces/controller/it/CompanyControllerIT.java`
- Modify: `backend/src/test/java/com/graphhire/publicapi/interfaces/controller/it/PublicCompanyControllerIT.java`

- [ ] **Step 1: 增加公司官网更新与返回断言（含 contactEmail 不存在断言）**
- [ ] **Step 2: 增加公开公司详情官网返回断言**
- [ ] **Step 3: 运行指定测试并确认失败**

### Task 3: 后端实现（GREEN）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/domain/model/Company.java`
- Modify: `backend/src/main/java/com/graphhire/job/application/service/CompanyAppService.java`
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/dto/request/CompanyProfileUpdateRequest.java`
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/dto/response/CompanyProfileResponse.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/po/CompanyPO.java`
- Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/dto/response/PublicCompanyCardResponse.java`
- Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicCompanyController.java`

- [ ] **Step 1: 删除 contactEmail 链路并新增 website 映射**
- [ ] **Step 2: 调整 profile/info/public 相关 DTO 与接口**
- [ ] **Step 3: 运行后端相关测试通过**

### Task 4: 前端测试先行（RED）

**Files:**
- Modify: `frontend/src/tests/pages/enterprise-company-profile-page.test.tsx`
- Modify: `frontend/tests/pages/user-company-detail-page.test.tsx`

- [ ] **Step 1: 增加“无联系邮箱输入”断言**
- [ ] **Step 2: 增加“公司官网展示链接”断言**
- [ ] **Step 3: 运行指定测试并确认失败**

### Task 5: 前端实现（GREEN）

**Files:**
- Modify: `frontend/src/lib/api/company.ts`
- Modify: `frontend/src/lib/api/public.ts`
- Modify: `frontend/src/app/enterprise/company/profile/page.tsx`
- Modify: `frontend/src/app/(user)/companies/[id]/page.tsx`

- [ ] **Step 1: 移除 contactEmail 类型与表单提交**
- [ ] **Step 2: 新增公司详情页官网展示**
- [ ] **Step 3: 运行前端相关测试通过**

### Task 6: 全量验证与交付

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 后端执行 `mvn compile` 与 `mvn test`**
- [ ] **Step 2: 前端执行 `npm run build` 与 `npm run test:run`**
- [ ] **Step 3: 更新 RELEASE-NOTES.md 并提交**
