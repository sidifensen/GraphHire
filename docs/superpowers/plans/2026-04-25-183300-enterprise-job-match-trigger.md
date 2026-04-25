# Enterprise Job Match Trigger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为企业岗位详情页增加一键触发全量候选人匹配能力，并提供异步反馈。

**Architecture:** 在现有 CompanyController 上新增轻量触发接口，复用 MatchAppService 现有 `triggerMatchForJob` 能力；前端新增 API 包装与页面按钮状态管理，保持现有推荐页链路不变。

**Tech Stack:** Spring Boot, Next.js, Vitest, JUnit5, Mockito

---

### Task 1: 后端接口（TDD）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/job/interfaces/controller/CompanyControllerTest.java`
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`

- [x] Step 1: 新增失败测试，断言触发接口会调用 `matchAppService.triggerMatchForJob`。
- [x] Step 2: 运行测试并确认失败（方法不存在）。
- [x] Step 3: 实现 `POST /company/job/{id}/match/trigger`。
- [x] Step 4: 回跑测试并通过。

### Task 2: 前端按钮与 API（TDD）

**Files:**
- Modify: `frontend/src/tests/pages/enterprise-job-detail.test.tsx`
- Modify: `frontend/src/lib/api/company.ts`
- Modify: `frontend/src/app/enterprise/jobs/[id]/page.tsx`

- [x] Step 1: 新增失败测试，断言点击按钮后调用 API、按钮 loading/禁用、出现成功提示。
- [x] Step 2: 运行测试并确认失败（按钮不存在）。
- [x] Step 3: 实现 API 方法 `triggerJobMatch` 与页面按钮交互。
- [x] Step 4: 回跑测试并通过。

### Task 3: 项目级验证

**Files:**
- None

- [x] Step 1: 前端构建：`npm run build`。
- [x] Step 2: 前端测试：`npm run test:run`（记录现有基线失败）。
- [x] Step 3: 后端编译：`mvn compile`。
- [x] Step 4: 后端测试：`mvn test`（记录环境依赖失败）。
- [ ] Step 5: CDP 浏览器验证（当前受本机会话占用阻塞）。
