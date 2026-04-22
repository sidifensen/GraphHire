# 企业端真实数据接入与关键操作补齐 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让企业端五个目标页面全部改为通过正式后端接口读取真实数据，并补齐 dashboard、员工、通知等缺失后端能力与关键操作。

**Architecture:** 以后端最小必要补齐为核心，在 `CompanyController` 与 `NotificationController` 基础上新增企业首页聚合查询、员工列表/统计、通知 me 视角接口，并将职位列表与推荐接口增强为页面友好响应；前端统一通过 `companyApi`、`notificationApi` 加载真实数据，为企业端页面补齐 loading / empty / error 与关键操作反馈。

**Tech Stack:** Spring Boot、JUnit、MockMvc、Next.js、TypeScript、Vitest、Axios

---

### Task 1: 盘点企业端页面真实数据缺口（对应 AC-001 ~ AC-020）

**Files:**
- Inspect: `frontend/src/app/enterprise/dashboard/page.tsx`
- Inspect: `frontend/src/app/enterprise/jobs/page.tsx`
- Inspect: `frontend/src/app/enterprise/recommendations/page.tsx`
- Inspect: `frontend/src/app/enterprise/employees/page.tsx`
- Inspect: `frontend/src/app/enterprise/notifications/page.tsx`
- Inspect: `frontend/src/lib/api/company.ts`
- Inspect: `frontend/src/lib/api/notification.ts`
- Inspect: `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`
- Inspect: `backend/src/main/java/com/graphhire/notification/interfaces/controller/NotificationController.java`

- [ ] **Step 1: 搜索企业端页面内的静态业务数据**

Run: `rg -n "24|156|高级算法工程师|林晓静|张伟|系统升级公告|const .*\[" frontend/src/app/enterprise -g "*.tsx"`
Expected: 能定位 dashboard、jobs、recommendations、employees、notifications 中的假数据位置。

- [ ] **Step 2: 搜索企业端现有接口与测试现状**

Run: `rg -n "CompanyController|NotificationController|enterprise-" backend/src/main/java backend/src/test/java frontend/src/tests -g "*.java" -g "*.ts" -g "*.tsx"`
Expected: 能确认现有接口可复用范围与缺失测试点。

### Task 2: 企业端后端测试先行（对应 AC-001, AC-003, AC-006, AC-008, AC-009, AC-013, AC-017）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/job/interfaces/controller/it/CompanyControllerIT.java`
- Modify: `backend/src/test/java/com/graphhire/notification/interfaces/controller/it/NotificationControllerIT.java`
- Create/Modify: `backend/src/test/resources/sql/enterprise-pages-real-data.sql`

- [ ] **Step 1: 为 dashboard 聚合接口写失败测试**

Run: `mvn -pl backend -Dtest=CompanyControllerIT test`
Expected: FAIL，提示 `/company/dashboard` 不存在或响应结构不匹配。

- [ ] **Step 2: 为职位列表筛选、推荐按职位过滤、员工列表/统计写失败测试**

Run: `mvn -pl backend -Dtest=CompanyControllerIT test`
Expected: FAIL，且失败原因是能力缺失而非测试语法错误。

- [ ] **Step 3: 为通知 me 视角查询与全部已读写失败测试**

Run: `mvn -pl backend -Dtest=NotificationControllerIT test`
Expected: FAIL。

### Task 3: 企业端后端最小实现（对应 AC-001, AC-003, AC-006, AC-008, AC-009, AC-013, AC-017）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`
- Modify: `backend/src/main/java/com/graphhire/job/application/service/CompanyAppService.java`
- Modify: `backend/src/main/java/com/graphhire/job/application/service/JobAppService.java`
- Modify: `backend/src/main/java/com/graphhire/job/domain/repository/CompanyStaffRepository.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyStaffRepositoryImpl.java`
- Create/Modify: `backend/src/main/java/com/graphhire/job/interfaces/dto/response/CompanyDashboardResponse.java`
- Create/Modify: `backend/src/main/java/com/graphhire/job/interfaces/dto/response/CompanyDashboardJobItemResponse.java`
- Create/Modify: `backend/src/main/java/com/graphhire/job/interfaces/dto/response/CompanyJobListItemResponse.java`
- Create/Modify: `backend/src/main/java/com/graphhire/job/interfaces/dto/response/CompanyStaffListItemResponse.java`
- Create/Modify: `backend/src/main/java/com/graphhire/job/interfaces/dto/response/CompanyStaffStatsResponse.java`
- Modify: `backend/src/main/java/com/graphhire/notification/interfaces/controller/NotificationController.java`
- Create/Modify: `backend/src/main/java/com/graphhire/notification/interfaces/dto/response/NotificationListItemResponse.java`
- Modify: `backend/src/main/java/com/graphhire/notification/application/service/NotificationAppService.java`

- [ ] **Step 1: 实现企业首页 dashboard 聚合接口**

Run: `mvn -pl backend -Dtest=CompanyControllerIT test`
Expected: dashboard 相关断言 PASS。

- [ ] **Step 2: 实现职位列表筛选、推荐按职位过滤、员工列表与统计接口**

Run: `mvn -pl backend -Dtest=CompanyControllerIT test`
Expected: 企业侧新增断言 PASS。

- [ ] **Step 3: 实现通知 me 视角查询、未读统计、全部已读能力**

Run: `mvn -pl backend -Dtest=NotificationControllerIT test`
Expected: PASS。

- [ ] **Step 4: 回归企业端相关后端测试**

Run: `mvn -pl backend -Dtest=CompanyControllerIT,NotificationControllerIT test`
Expected: PASS。

### Task 4: 企业端前端测试先行（对应 AC-002, AC-004, AC-005, AC-007, AC-010, AC-011, AC-012, AC-014, AC-015, AC-016, AC-018, AC-019）

**Files:**
- Modify: `frontend/src/tests/pages/enterprise-dashboard.test.tsx`
- Modify: `frontend/src/tests/pages/enterprise-jobs.test.tsx`
- Create/Modify: `frontend/src/tests/pages/enterprise-recommendations.test.tsx`
- Modify: `frontend/src/tests/pages/enterprise-employees.test.tsx`
- Create/Modify: `frontend/src/tests/pages/enterprise-notifications.test.tsx`
- Create/Modify: `frontend/src/tests/lib/api/company.test.ts`
- Create/Modify: `frontend/src/tests/lib/api/notification.test.ts`

- [ ] **Step 1: 为 dashboard、jobs 页面真实接口流写失败测试**

Run: `npm --prefix frontend test -- enterprise-dashboard.test.tsx enterprise-jobs.test.tsx`
Expected: FAIL。

- [ ] **Step 2: 为 recommendations、employees、notifications 页面真实接口流写失败测试**

Run: `npm --prefix frontend test -- enterprise-recommendations.test.tsx enterprise-employees.test.tsx enterprise-notifications.test.tsx`
Expected: FAIL。

- [ ] **Step 3: 为 companyApi / notificationApi 对齐新后端能力写失败测试**

Run: `npm --prefix frontend test -- company.test.ts notification.test.ts`
Expected: FAIL。

### Task 5: 企业端前端真实数据接入（对应 AC-002, AC-004, AC-005, AC-007, AC-010, AC-011, AC-012, AC-014, AC-015, AC-016, AC-018, AC-019）

**Files:**
- Modify: `frontend/src/app/enterprise/dashboard/page.tsx`
- Modify: `frontend/src/app/enterprise/jobs/page.tsx`
- Modify: `frontend/src/app/enterprise/recommendations/page.tsx`
- Modify: `frontend/src/app/enterprise/employees/page.tsx`
- Modify: `frontend/src/app/enterprise/notifications/page.tsx`
- Modify: `frontend/src/lib/api/company.ts`
- Modify: `frontend/src/lib/api/notification.ts`
- Create/Modify: `frontend/src/lib/types/enterprise.ts`
- Create/Modify: `frontend/src/lib/mappers/enterpriseMapper.ts`

- [ ] **Step 1: 接入 dashboard 真实数据并补 loading/empty/error**

Run: `npm --prefix frontend test -- enterprise-dashboard.test.tsx`
Expected: PASS。

- [ ] **Step 2: 接入 jobs 真实列表与关键操作**

Run: `npm --prefix frontend test -- enterprise-jobs.test.tsx company.test.ts`
Expected: PASS。

- [ ] **Step 3: 接入 recommendations 真实职位与推荐结果**

Run: `npm --prefix frontend test -- enterprise-recommendations.test.tsx`
Expected: PASS。

- [ ] **Step 4: 接入 employees 真实统计、列表、创建员工、重置密码**

Run: `npm --prefix frontend test -- enterprise-employees.test.tsx company.test.ts`
Expected: PASS。

- [ ] **Step 5: 接入 notifications 真实列表、分类、已读操作**

Run: `npm --prefix frontend test -- enterprise-notifications.test.tsx notification.test.ts`
Expected: PASS。

### Task 6: 全量回归与浏览器验收（对应 AC-016 ~ AC-020）

**Files:**
- Modify: `frontend/src/tests/**/*.test.ts*`
- Modify: `backend/src/test/**/*.java`

- [ ] **Step 1: 运行企业端相关后端测试回归**

Run: `mvn -pl backend -Dtest=CompanyControllerIT,NotificationControllerIT test`
Expected: PASS。

- [ ] **Step 2: 运行企业端相关前端测试回归**

Run: `npm --prefix frontend test -- enterprise-dashboard.test.tsx enterprise-jobs.test.tsx enterprise-recommendations.test.tsx enterprise-employees.test.tsx enterprise-notifications.test.tsx company.test.ts notification.test.ts`
Expected: PASS。

- [ ] **Step 3: 检查企业端页面是否仍残留业务 mock**

Run: `rg -n "林晓静|高级算法工程师|系统升级公告|124|118|12,400|57 份推荐简历" frontend/src/app/enterprise -g "*.tsx"`
Expected: 不再输出企业端页面主业务假数据。

- [ ] **Step 4: 启动前后端并使用 `/web-access` 做浏览器验收**

Expected: `/enterprise/dashboard`、`/enterprise/jobs`、`/enterprise/recommendations`、`/enterprise/employees`、`/enterprise/notifications` 均能打开并显示真实数据，关键操作无明显异常。
