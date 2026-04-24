# 管理端企业审核全字段展示与操作修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 统一企业审核表头样式，展示企业完整字段，修复详情/通过/拒绝交互并完善后端审核接口映射。

**Architecture:** 前端继续使用 adminApi 的企业审核列表接口，在列表行展示更多后端字段，详情通过弹窗展示全量信息；后端扩展 `AdminCompanyAuthItemResponse` 和 `Company` 映射字段，保证列表接口返回真实数据库企业信息；审核动作继续走现有 `PUT /admin/company/auth/{id}`。

**Tech Stack:** Next.js + React + Vitest，Spring Boot + JUnit。

---

### Task 1: 补充失败测试（前后端）

**Files:**
- Modify: `frontend/src/tests/pages/admin-enterprise-review.test.tsx`
- Modify: `backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java`

- [ ] **Step 1: 前端测试补充字段与详情弹窗断言**
- [ ] **Step 2: 前端测试补充拒绝按钮调用断言**
- [ ] **Step 3: 后端测试补充公司行业/规模/地址等映射断言**
- [ ] **Step 4: 运行对应测试并确认先失败**

### Task 2: 后端接口补齐企业真实字段

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/interfaces/dto/response/AdminCompanyAuthItemResponse.java`
- Modify: `backend/src/main/java/com/graphhire/job/domain/model/Company.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/po/CompanyPO.java`
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`

- [ ] **Step 1: DTO 增加 industry/scale/address/contact/phone/applyTime 等字段**
- [ ] **Step 2: Company/CompanyPO 增加对应字段并打通映射**
- [ ] **Step 3: 在 `toAdminCompanyAuthItem` 中填充真实字段与时间**
- [ ] **Step 4: 运行后端测试确认通过**

### Task 3: 前端页面展示与交互修复

**Files:**
- Modify: `frontend/src/lib/api/admin.ts`
- Modify: `frontend/src/app/admin/enterprise-review/page.tsx`

- [ ] **Step 1: 扩展前端 `CompanyAuthItem` 类型字段**
- [ ] **Step 2: 表头样式统一字体/颜色（企业名称、所属行业、人员规模、申请时间、状态、操作）**
- [ ] **Step 3: 数据行展示完整企业信息（至少行业、规模、地址、联系人、电话、信用代码、执照地址等）**
- [ ] **Step 4: 实现“详情”按钮弹窗展示全量信息**
- [ ] **Step 5: 修复“通过/拒绝”可点击并刷新列表**
- [ ] **Step 6: 运行前端测试确认通过**

### Task 4: 全量验证与浏览器验收

**Files:**
- Modify: （无）

- [ ] **Step 1: 前端编译 `npm run build`**
- [ ] **Step 2: 前端测试 `npm run test:run`**
- [ ] **Step 3: 后端编译 `mvn compile`**
- [ ] **Step 4: 后端测试 `mvn test`**
- [ ] **Step 5: 使用 CDP 做管理端企业审核页面手工验证（详情/通过/拒绝）**
