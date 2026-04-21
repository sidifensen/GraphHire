# 管理端真实数据接入与后端能力补齐 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让管理端五个页面全部移除业务假数据，接入正式后端接口，并补齐企业审核、用户状态管理、任务重试等缺失能力。

**Architecture:** 先统一后端管理端 DTO、查询接口与批量操作，再对前端 `adminApi` 和五个页面逐页替换真实数据源。执行过程中遵循 TDD：先补失败测试，再写最小实现，最后补页面联调和浏览器验收。用户已明确要求不创建 worktree，因此直接在当前工作区执行。

**Tech Stack:** Spring Boot、MyBatis-Plus、JUnit 5、MockMvc、Next.js App Router、React、TypeScript、Vitest。

---

### Task 1: 盘点管理端现有前后端契约并锁定改造边界

**Files:**
- Modify: `docs/superpowers/plans/2026-04-21-admin-pages-real-data-plan.md`
- Read: `frontend/src/lib/api/admin.ts`
- Read: `frontend/src/app/admin/dashboard/page.tsx`
- Read: `frontend/src/app/admin/enterprise-review/page.tsx`
- Read: `frontend/src/app/admin/users/page.tsx`
- Read: `frontend/src/app/admin/skill-tags/page.tsx`
- Read: `frontend/src/app/admin/task-monitor/page.tsx`
- Read: `backend/src/main/java/com/graphhire/admin/interfaces/controller/AdminController.java`
- Read: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`

- [ ] **Step 1: 读取管理端前后端现状并记录接口缺口**

Run: `Get-Content -Raw 'frontend/src/lib/api/admin.ts'`
Expected: 能看到管理端前端 API 封装定义。

- [ ] **Step 2: 读取五个管理端页面确认静态数据分布**

Run: `Get-Content -Raw 'frontend/src/app/admin/dashboard/page.tsx'`
Expected: 能确认页面仍以静态业务内容渲染。

- [ ] **Step 3: 读取后端 controller 与 service，列出现有路径与返回结构不一致点**

Run: `Get-Content -Raw 'backend/src/main/java/com/graphhire/admin/interfaces/controller/AdminController.java'`
Expected: 能确认现有接口存在分页、路径或参数不一致问题。

- [ ] **Step 4: 形成实现边界摘要并作为后续子任务输入**

Expected: 产出“dashboard / enterprise-review / users / skill-tags / task-monitor”五页与后端接口的明确缺口清单。

### Task 2: 为后端管理端接口补失败测试

**Files:**
- Modify: `backend/src/test/java/com/graphhire/admin/interfaces/controller/it/AdminControllerIT.java`
- Modify: `backend/src/test/java/com/graphhire/admin/interfaces/controller/AdminControllerTest.java`
- Modify: `backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java`

- [ ] **Step 1: 为 dashboard 聚合与趋势补失败测试**

Expected test targets: `GET /admin/dashboard/stats`, optional `GET /admin/dashboard/trend`.
Expected: 当前测试失败，提示字段缺失或接口不存在。

- [ ] **Step 2: 为企业审核分页、搜索、单项审核与批量审核补失败测试**

Expected test targets: `GET /admin/company/auth-list`, `PUT /admin/company/auth/{id}`, `POST /admin/company/batch/approve`, `POST /admin/company/batch/reject`.
Expected: 当前测试失败，提示路径、请求体或返回结构不匹配。

- [ ] **Step 3: 为用户分页筛选、状态修改、批量禁用补失败测试**

Expected test targets: `GET /admin/user/list`, `PUT /admin/user/{id}/status`, `POST /admin/user/batch/disable`.
Expected: 当前测试失败，提示返回仅有 ID 列表或状态参数不匹配。

- [ ] **Step 4: 为技能标签分页筛选和任务监控 summary / 批量重试补失败测试**

Expected test targets: `GET /admin/skill/list`, `GET /admin/task/list`, `POST /admin/task/batch/retry`.
Expected: 当前测试失败，提示分页结构或批量接口缺失。

- [ ] **Step 5: 运行管理端后端测试确认 RED**

Run: `mvn -Dtest=AdminControllerIT,AdminControllerTest,AdminAppServiceTest test`
Expected: FAIL，且失败原因对应新增断言而非语法错误。

### Task 3: 实现后端 DTO、查询与批量接口

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/interfaces/controller/AdminController.java`
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Create/Modify: `backend/src/main/java/com/graphhire/admin/interfaces/dto/response/*`
- Create/Modify: `backend/src/main/java/com/graphhire/admin/interfaces/dto/request/*`
- Create/Modify: `backend/src/main/java/com/graphhire/admin/application/query/*`
- Create/Modify: `backend/src/main/java/com/graphhire/admin/application/command/*`
- Modify: any required repository or mapper files under `backend/src/main/java/com/graphhire/**`

- [ ] **Step 1: 为 dashboard 定义页面型响应并实现统计聚合**

Expected implementation: 统计用户、企业、简历、职位、待审核企业、待处理任务等真实字段，必要时返回趋势或空列表。

- [ ] **Step 2: 实现企业审核分页查询、关键字筛选、单项审核和批量审核**

Expected implementation: 统一审核列表返回分页结构，拒绝时支持 reason，批量接口接收 ID 列表。

- [ ] **Step 3: 实现用户分页查询、状态修改与批量禁用**

Expected implementation: 返回用户详细列表，不再只返回 `List<Long>`；状态修改使用明确请求体。

- [ ] **Step 4: 实现技能标签分页筛选与任务监控 summary / 批量重试**

Expected implementation: 技能列表支持筛选，任务列表返回 summary + 分页列表，批量重试支持失败任务列表。

- [ ] **Step 5: 运行后端管理端测试确认 GREEN**

Run: `mvn -Dtest=AdminControllerIT,AdminControllerTest,AdminAppServiceTest test`
Expected: PASS。

### Task 4: 为前端管理端 API 与页面补失败测试

**Files:**
- Modify: `frontend/tests/pages/admin-dashboard.test.tsx`
- Modify: `frontend/tests/pages/admin-enterprise-review.test.tsx`
- Modify: `frontend/tests/pages/admin-users.test.tsx`
- Modify: `frontend/tests/pages/admin-skill-tags.test.tsx`
- Modify: `frontend/tests/pages/admin-task-monitor.test.tsx`
- Create/Modify: `frontend/tests/lib/api/admin.test.ts`

- [ ] **Step 1: 为 dashboard 真实请求、空态和错误态补失败测试**

Expected: 当前页面测试失败，因为页面仍渲染静态数字或未调用 API。

- [ ] **Step 2: 为企业审核页真实列表、筛选、审核操作补失败测试**

Expected: 当前测试失败，因为页面未发请求或按钮未触发真实接口。

- [ ] **Step 3: 为用户页真实列表、批量禁用与导出降级补失败测试**

Expected: 当前测试失败，因为页面仍渲染静态用户并缺少真实批量行为。

- [ ] **Step 4: 为技能标签页真实列表与运营模块降级补失败测试**

Expected: 当前测试失败，因为页面仍展示静态标签和静态统计。

- [ ] **Step 5: 为任务监控页 summary、列表与重试补失败测试**

Expected: 当前测试失败，因为页面未使用真实任务数据。

- [ ] **Step 6: 运行前端管理端相关测试确认 RED**

Run: `npm run test:run -- admin-dashboard admin-enterprise-review admin-users admin-skill-tags admin-task-monitor`
Expected: FAIL，且失败原因对应真实数据改造缺失。

### Task 5: 实现前端 adminApi 与五个页面真实数据化

**Files:**
- Modify: `frontend/src/lib/api/admin.ts`
- Modify: `frontend/src/app/admin/dashboard/page.tsx`
- Modify: `frontend/src/app/admin/enterprise-review/page.tsx`
- Modify: `frontend/src/app/admin/users/page.tsx`
- Modify: `frontend/src/app/admin/skill-tags/page.tsx`
- Modify: `frontend/src/app/admin/task-monitor/page.tsx`
- Create/Modify: reusable helper files under `frontend/src/lib/**` or `frontend/src/components/admin/**` if needed

- [ ] **Step 1: 对齐 adminApi 与后端接口契约**

Expected implementation: 统一路径、参数、请求体与响应类型，删除错误路径假设。

- [ ] **Step 2: 改造 dashboard 为真实统计、趋势、空态与错误态**

Expected implementation: 页面首屏发请求，移除主业务假数字，保留 UI 风格。

- [ ] **Step 3: 改造企业审核页为真实分页、筛选、单项/批量审核**

Expected implementation: 提供通过/拒绝交互、拒绝理由、成功后刷新列表。

- [ ] **Step 4: 改造用户页为真实列表、筛选、单项状态操作、批量禁用与导出降级**

Expected implementation: 选中计数、状态标签、操作按钮与真实接口联动。

- [ ] **Step 5: 改造技能标签页为真实列表与运营模块真实降级**

Expected implementation: 主列表真实化，无法真实提供的右侧模块隐藏或空态，不再展示硬编码大数字。

- [ ] **Step 6: 改造任务监控页为真实 summary、列表、单项/批量重试**

Expected implementation: 失败原因、状态卡片、任务列表全走真实接口。

- [ ] **Step 7: 运行前端管理端相关测试确认 GREEN**

Run: `npm run test:run -- admin-dashboard admin-enterprise-review admin-users admin-skill-tags admin-task-monitor`
Expected: PASS。

### Task 6: 全量验证与浏览器验收

**Files:**
- No required file edits

- [ ] **Step 1: 运行前端构建**

Run: `npm run build`
Expected: PASS。

- [ ] **Step 2: 运行后端编译**

Run: `mvn compile`
Expected: PASS。

- [ ] **Step 3: 运行前端全量测试**

Run: `npm run test:run`
Expected: PASS。

- [ ] **Step 4: 运行后端全量测试**

Run: `mvn test`
Expected: PASS。

- [ ] **Step 5: 通过 /web-access 浏览器验收五个管理端页面**

Expected: `/admin/dashboard`、`/admin/enterprise-review`、`/admin/users`、`/admin/skill-tags`、`/admin/task-monitor` 均展示真实数据，关键操作可用。

- [ ] **Step 6: 汇总结果并准备进入代码评审与收尾流程**

Expected: 记录已通过的命令、浏览器验收结果和剩余风险（如有）。
