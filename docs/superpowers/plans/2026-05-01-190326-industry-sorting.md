# Industry Sorting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为管理端行业模块补齐“列表升降序查看 + 上移下移持久化 + 连续排序值”能力。  
**Architecture:** 在管理应用层实现可配置排序，行业应用层实现 move 语义与连续重排；前端行业页通过排序参数和 move 接口驱动交互，不做本地假排序。  
**Tech Stack:** Spring Boot + MyBatis Plus + JUnit5/Mockito；Next.js + React + Vitest + Testing Library。

---

### Task 1: 后端控制器接口扩展

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/interfaces/controller/AdminController.java`
- Create: `backend/src/main/java/com/graphhire/admin/interfaces/dto/request/AdminIndustryMoveRequest.java`
- Test: `backend/src/test/java/com/graphhire/admin/interfaces/controller/AdminControllerTest.java`

- [ ] 新增控制器失败测试：行业列表透传 `sortBy/sortDir`，新增 move 接口调用应用服务。
- [ ] 运行 `mvn -Dtest=AdminControllerTest test`，确认新增用例先失败。
- [ ] 实现控制器参数与 move 端点，保证测试通过。

### Task 2: 后端应用服务排序与移动

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Modify: `backend/src/main/java/com/graphhire/industry/application/service/IndustryAppService.java`
- Test: `backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java`
- Create: `backend/src/test/java/com/graphhire/industry/application/service/IndustryAppServiceTest.java`

- [ ] 新增应用层失败测试：
  - `AdminAppService` 行业列表按参数排序
  - `IndustryAppService` move up/down 连续重排与边界行为
- [ ] 运行 `mvn -Dtest=AdminAppServiceTest,IndustryAppServiceTest test`，确认先红。
- [ ] 实现排序比较器、方向解析与 move 重排逻辑，转绿。

### Task 3: 前端 API 与页面交互

**Files:**
- Modify: `frontend/src/lib/api/admin.ts`
- Modify: `frontend/src/components/admin/AdminDataTable.tsx`
- Modify: `frontend/src/app/admin/industry/page.tsx`
- Create: `frontend/src/tests/pages/admin-industry-page.test.tsx`

- [ ] 新增前端失败测试：
  - 初始请求排序参数
  - 点击列头切换排序
  - 点击上移/下移调用 move API
  - 新增弹窗默认排序值=max+1
- [ ] 运行 `npm run test:run -- src/tests/pages/admin-industry-page.test.tsx`，确认先红。
- [ ] 实现前端交互并让测试转绿。

### Task 4: 全量验证与发布记录

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] 运行后端编译与测试：`mvn compile`、`mvn test`
- [ ] 运行前端构建与测试：`npm run build`、`npm run test:run`
- [ ] 使用 CDP 打开行业管理页进行浏览器验证（排序与上移下移）
- [ ] 更新 `RELEASE-NOTES.md` 简要记录
- [ ] `git add` + 中文前缀提交信息完成提交
