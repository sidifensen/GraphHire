# 用户端真实数据全量接入与正式接口补齐 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让求职者前台全部页面改为通过正式后端接口读取真实数据，并补齐缺失的用户端后端接口、测试覆盖与联调数据。

**Architecture:** 沿用现有 `publicapi`、`resume`、`match`、`notification` 模块边界，以页面可交付为目标补充查询 DTO 与聚合接口；前端统一通过 `src/lib/api/*` 请求正式接口，再用 mapper 转换成页面展示模型，并为各页面补齐 loading、empty、error 状态。实施按四个页面域分批推进，每批遵循“先失败测试、再最小实现、再前端切换、再清理 mock”的节奏。

**Tech Stack:** Spring Boot、MyBatis、Next.js、TypeScript、Vitest、JUnit、MockMvc

---

### Task 1: 盘点用户端真实数据缺口并固定目标接口清单（对应 AC-001 ~ AC-022）

**Files:**
- Modify: `docs/superpowers/plans/2026-04-21-user-pages-real-data-plan.md`
- Inspect: `frontend/src/app/page.tsx`
- Inspect: `frontend/src/app/(user)/jobs/page.tsx`
- Inspect: `frontend/src/app/(user)/companies/page.tsx`
- Inspect: `frontend/src/app/(user)/resume/manage/page.tsx`
- Inspect: `frontend/src/app/(user)/resume/upload/page.tsx`
- Inspect: `frontend/src/app/(user)/profile/page.tsx`
- Inspect: `frontend/src/app/(user)/skill-graph/page.tsx`
- Inspect: `frontend/src/app/(user)/match/[id]/page.tsx`
- Inspect: `frontend/src/app/(user)/notifications/page.tsx`
- Inspect: `frontend/src/lib/api/*.ts`
- Inspect: `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/*.java`
- Inspect: `backend/src/main/java/com/graphhire/resume/interfaces/controller/*.java`
- Inspect: `backend/src/main/java/com/graphhire/match/interfaces/controller/*.java`
- Inspect: `backend/src/main/java/com/graphhire/notification/interfaces/controller/*.java`

- [ ] **Step 1: 列出仍使用 mock 的用户端页面与静态区块**

Run: `rg -n "mock|const .*\[|notifications = \[|skills = \[|companies = \[|mockJobs" frontend/src/app frontend/src/components frontend/src/lib -g "*.tsx" -g "*.ts"`
Expected: 输出首页、职位列表、企业列表、能力图谱、通知等页面的静态数据位置。

- [ ] **Step 2: 列出现有后端接口与页面字段缺口**

Run: `rg -n "@RequestMapping|@GetMapping|@PostMapping|@PutMapping|@DeleteMapping" backend/src/main/java/com/graphhire -g "*.java"`
Expected: 输出可复用控制器与需要补齐的页面接口清单。

- [ ] **Step 3: 固定本轮优先实现接口集**

完成结果必须覆盖：
- 首页聚合接口
- 公开职位列表增强接口
- 公开企业列表增强接口
- 简历管理/上传/资料页相关接口补齐
- 匹配详情与能力图谱接口补齐
- 通知列表/分类/已读接口补齐

- [ ] **Step 4: 提交盘点性小结（如有必要更新计划）**

Run: `git status --short`
Expected: 仅看到计划文档与后续任务相关文件改动，无无关文件污染。

### Task 2: 首页与公共浏览域后端测试先行（对应 AC-001 ~ AC-006, AC-019, AC-021）

**Files:**
- Create/Modify: `backend/src/test/java/com/graphhire/publicapi/interfaces/controller/it/PublicHomeControllerIT.java`
- Modify: `backend/src/test/java/com/graphhire/job/interfaces/controller/it/CompanyControllerIT.java`
- Create/Modify: `backend/src/test/java/com/graphhire/publicapi/interfaces/controller/it/PublicJobControllerIT.java`
- Create/Modify: `backend/src/test/java/com/graphhire/publicapi/interfaces/controller/it/PublicCompanyControllerIT.java`
- Create/Modify: `backend/src/test/resources/sql/user-pages-real-data-public.sql`

- [ ] **Step 1: 为首页聚合接口写失败集成测试**

Run: `mvn -pl backend -Dtest=PublicHomeControllerIT test`
Expected: FAIL，提示首页聚合接口不存在或响应结构不满足测试断言。

- [ ] **Step 2: 为公开职位增强查询写失败测试**

Run: `mvn -pl backend -Dtest=PublicJobControllerIT test`
Expected: FAIL，提示筛选字段、排序或响应 DTO 字段不完整。

- [ ] **Step 3: 为公开企业增强查询写失败测试**

Run: `mvn -pl backend -Dtest=PublicCompanyControllerIT test`
Expected: FAIL，提示企业列表返回字段不足或聚合统计缺失。

- [ ] **Step 4: 准备公共浏览测试数据脚本**

内容应覆盖：已认证企业、已发布职位、热门企业、不同薪资/城市/技能组合。

- [ ] **Step 5: 运行首页与公共浏览相关测试，确认全部处于 RED**

Run: `mvn -pl backend -Dtest=PublicHomeControllerIT,PublicJobControllerIT,PublicCompanyControllerIT test`
Expected: FAIL，且失败原因为功能缺失或响应结构不匹配，而非测试环境语法错误。

### Task 3: 首页与公共浏览域后端最小实现（对应 AC-001 ~ AC-006, AC-019, AC-021）

**Files:**
- Create: `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicHomeController.java`
- Create: `backend/src/main/java/com/graphhire/publicapi/interfaces/dto/response/PublicHomeResponse.java`
- Create: `backend/src/main/java/com/graphhire/publicapi/interfaces/dto/response/PublicHomeJobCardResponse.java`
- Create: `backend/src/main/java/com/graphhire/publicapi/interfaces/dto/response/PublicHomeCompanyCardResponse.java`
- Create/Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/dto/response/PublicJobCardResponse.java`
- Create/Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/dto/response/PublicCompanyCardResponse.java`
- Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicJobController.java`
- Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicCompanyController.java`
- Modify: `backend/src/main/java/com/graphhire/job/application/service/CompanyAppService.java`
- Modify: `backend/src/main/java/com/graphhire/job/application/service/JobAppService.java`

- [ ] **Step 1: 实现首页聚合查询的最小控制器与响应 DTO**

Run: `mvn -pl backend -Dtest=PublicHomeControllerIT test`
Expected: PASS。

- [ ] **Step 2: 实现公开职位列表增强 DTO 与筛选映射**

Run: `mvn -pl backend -Dtest=PublicJobControllerIT test`
Expected: PASS。

- [ ] **Step 3: 实现公开企业列表增强 DTO 与热招职位聚合**

Run: `mvn -pl backend -Dtest=PublicCompanyControllerIT test`
Expected: PASS。

- [ ] **Step 4: 运行公共浏览后端测试回归**

Run: `mvn -pl backend -Dtest=PublicHomeControllerIT,PublicJobControllerIT,PublicCompanyControllerIT,CompanyControllerIT test`
Expected: PASS。

### Task 4: 首页与公共浏览域前端切换真实接口（对应 AC-001 ~ AC-006, AC-018, AC-020）

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/app/(user)/jobs/page.tsx`
- Modify: `frontend/src/app/(user)/companies/page.tsx`
- Modify: `frontend/src/lib/api/homeApi.ts`
- Create/Modify: `frontend/src/lib/api/public.ts`
- Create/Modify: `frontend/src/lib/types/home.ts`
- Create/Modify: `frontend/src/lib/mappers/homeMapper.ts`
- Create/Modify: `frontend/tests/pages/page.test.tsx`
- Create/Modify: `frontend/tests/pages/jobs.test.tsx`
- Create/Modify: `frontend/tests/pages/companies.test.tsx`
- Create/Modify: `frontend/tests/lib/api/homeApi.test.ts`

- [ ] **Step 1: 为首页真实接口渲染写失败前端测试**

Run: `npm --prefix frontend test -- page.test.tsx homeApi.test.ts`
Expected: FAIL，提示仍依赖 mock 或未请求正式接口。

- [ ] **Step 2: 为职位列表真实筛选渲染写失败测试**

Run: `npm --prefix frontend test -- jobs.test.tsx`
Expected: FAIL。

- [ ] **Step 3: 为企业列表真实渲染写失败测试**

Run: `npm --prefix frontend test -- companies.test.tsx`
Expected: FAIL。

- [ ] **Step 4: 实现首页、职位、企业页的真实接口接入与状态处理**

要求：移除页面内主业务 mock 数组，补 loading / empty / error / retry。

- [ ] **Step 5: 运行公共浏览前端测试回归**

Run: `npm --prefix frontend test -- page.test.tsx jobs.test.tsx companies.test.tsx homeApi.test.ts`
Expected: PASS。

### Task 5: 求职者资产域后端测试与实现（对应 AC-007 ~ AC-010, AC-019, AC-021）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/resume/interfaces/controller/it/ResumeControllerIT.java`
- Modify: `backend/src/test/java/com/graphhire/resume/interfaces/controller/it/PersonControllerIT.java`
- Create/Modify: `backend/src/test/resources/sql/user-pages-real-data-resume.sql`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/ResumeController.java`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonController.java`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/dto/ResumeVO.java`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/dto/PersonInfoResponse.java`
- Modify: `backend/src/main/java/com/graphhire/resume/application/service/ResumeAppService.java`

- [ ] **Step 1: 为简历管理与资料页相关接口补失败测试**

Run: `mvn -pl backend -Dtest=ResumeControllerIT,PersonControllerIT test`
Expected: FAIL，提示缺少页面所需字段、状态或当前用户接口能力。

- [ ] **Step 2: 补简历列表、上传结果、资料查询更新的最小实现**

Run: `mvn -pl backend -Dtest=ResumeControllerIT,PersonControllerIT test`
Expected: PASS。

- [ ] **Step 3: 回归现有简历与资料测试**

Run: `mvn -pl backend -Dtest=ResumeControllerTest,ResumeControllerIT,PersonControllerIT test`
Expected: PASS。

### Task 6: 求职者资产域前端切换真实接口（对应 AC-007 ~ AC-010, AC-018, AC-020）

**Files:**
- Modify: `frontend/src/app/(user)/resume/manage/page.tsx`
- Modify: `frontend/src/app/(user)/resume/upload/page.tsx`
- Modify: `frontend/src/app/(user)/profile/page.tsx`
- Modify: `frontend/src/lib/api/resume.ts`
- Modify: `frontend/src/lib/api/person.ts`
- Create/Modify: `frontend/tests/pages/resume-manage.test.tsx`
- Create/Modify: `frontend/tests/pages/resume-upload.test.tsx`
- Create/Modify: `frontend/tests/pages/profile.test.tsx`

- [ ] **Step 1: 为简历管理、上传、个人资料页补失败测试**

Run: `npm --prefix frontend test -- resume-manage.test.tsx resume-upload.test.tsx profile.test.tsx`
Expected: FAIL。

- [ ] **Step 2: 将三个页面切换为真实接口流并补状态处理**

Run: `npm --prefix frontend test -- resume-manage.test.tsx resume-upload.test.tsx profile.test.tsx`
Expected: PASS。

### Task 7: 匹配与图谱域后端测试与实现（对应 AC-011 ~ AC-014, AC-019, AC-021）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/match/interfaces/controller/it/MatchControllerIT.java`
- Create: `backend/src/test/java/com/graphhire/match/interfaces/controller/it/MatchGraphControllerIT.java`
- Create/Modify: `backend/src/test/resources/sql/user-pages-real-data-match.sql`
- Modify: `backend/src/main/java/com/graphhire/match/interfaces/controller/MatchController.java`
- Modify: `backend/src/main/java/com/graphhire/match/interfaces/controller/MatchGraphController.java`
- Modify: `backend/src/main/java/com/graphhire/match/interfaces/dto/response/MatchDetailResponse.java`
- Create/Modify: `backend/src/main/java/com/graphhire/match/interfaces/dto/response/SkillGraphResponse.java`
- Modify: `backend/src/main/java/com/graphhire/match/application/service/MatchAppService.java`

- [ ] **Step 1: 为匹配详情与能力图谱接口写失败测试**

Run: `mvn -pl backend -Dtest=MatchControllerIT,MatchGraphControllerIT test`
Expected: FAIL，提示返回字段或接口能力不足。

- [ ] **Step 2: 实现匹配详情页响应增强**

Run: `mvn -pl backend -Dtest=MatchControllerIT test`
Expected: PASS。

- [ ] **Step 3: 实现能力图谱正式接口与空结构返回**

Run: `mvn -pl backend -Dtest=MatchGraphControllerIT test`
Expected: PASS。

- [ ] **Step 4: 回归匹配相关测试**

Run: `mvn -pl backend -Dtest=MatchControllerIT,MatchGraphControllerIT test`
Expected: PASS。

### Task 8: 匹配与图谱域前端切换真实接口（对应 AC-012 ~ AC-014, AC-018, AC-020）

**Files:**
- Modify: `frontend/src/app/(user)/match/[id]/page.tsx`
- Modify: `frontend/src/app/(user)/skill-graph/page.tsx`
- Modify: `frontend/src/lib/api/match.ts`
- Create/Modify: `frontend/tests/pages/match-detail.test.tsx`
- Create/Modify: `frontend/tests/pages/skill-graph.test.tsx`
- Create/Modify: `frontend/tests/lib/api/match.test.ts`

- [ ] **Step 1: 为匹配详情页与能力图谱页补失败测试**

Run: `npm --prefix frontend test -- match-detail.test.tsx skill-graph.test.tsx match.test.ts`
Expected: FAIL。

- [ ] **Step 2: 改接真实接口并移除静态示例数据**

Run: `npm --prefix frontend test -- match-detail.test.tsx skill-graph.test.tsx match.test.ts`
Expected: PASS。

### Task 9: 通知域后端测试与实现（对应 AC-015 ~ AC-017, AC-019, AC-021）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/notification/interfaces/controller/it/NotificationControllerIT.java`
- Create/Modify: `backend/src/test/resources/sql/user-pages-real-data-notification.sql`
- Modify: `backend/src/main/java/com/graphhire/notification/interfaces/controller/NotificationController.java`
- Create/Modify: `backend/src/main/java/com/graphhire/notification/interfaces/dto/response/NotificationListItemResponse.java`
- Modify: `backend/src/main/java/com/graphhire/notification/application/service/NotificationAppService.java`

- [ ] **Step 1: 为通知列表、分类、未读数、已读操作补失败测试**

Run: `mvn -pl backend -Dtest=NotificationControllerIT test`
Expected: FAIL。

- [ ] **Step 2: 实现通知页正式接口响应与已读能力**

Run: `mvn -pl backend -Dtest=NotificationControllerIT test`
Expected: PASS。

### Task 10: 通知域前端切换真实接口（对应 AC-016 ~ AC-018, AC-020）

**Files:**
- Modify: `frontend/src/app/(user)/notifications/page.tsx`
- Modify: `frontend/src/lib/api/notification.ts`
- Create/Modify: `frontend/tests/pages/notifications.test.tsx`

- [ ] **Step 1: 为通知页真实数据流补失败测试**

Run: `npm --prefix frontend test -- notifications.test.tsx`
Expected: FAIL。

- [ ] **Step 2: 改接真实通知接口并移除示例通知数组**

Run: `npm --prefix frontend test -- notifications.test.tsx`
Expected: PASS。

### Task 11: 全量回归、数据校验与浏览器验收准备（对应 AC-018 ~ AC-022）

**Files:**
- Modify: `frontend/tests/**/*.test.ts*`
- Modify: `backend/src/test/**/*.java`
- Modify: `docs/测试账号.md`（如需补充联调账号）

- [ ] **Step 1: 运行后端用户端相关测试回归**

Run: `mvn -pl backend test`
Expected: PASS，或至少与本次改动相关的用户端测试全部 PASS。

- [ ] **Step 2: 运行前端测试回归**

Run: `npm --prefix frontend test`
Expected: PASS。

- [ ] **Step 3: 确认无页面级业务 mock 残留**

Run: `rg -n "mockJobs|const companies = \[|const notifications = \[|const skills = \[|const dimensions = \[" frontend/src/app frontend/src/components -g "*.tsx"`
Expected: 不再输出用户端页面主业务数据 mock 定义。

- [ ] **Step 4: 启动前后端并准备浏览器验收**

Run: `git status --short`
Expected: 仅有本次任务相关变更，准备进入浏览器验收。

### Task 12: 浏览器验收与收尾（对应 AC-022）

**Files:**
- No code files required; uses running app and browser verification artifacts

- [ ] **Step 1: 使用 `/web-access` 验证首页与公共浏览域核心页面**

Expected: `/`、`/jobs`、`/companies` 可以打开并显示真实接口内容。

- [ ] **Step 2: 使用 `/web-access` 验证求职者资产域核心页面**

Expected: `/resume/manage`、`/profile`、`/resume/upload` 可用且显示真实接口/状态反馈。

- [ ] **Step 3: 使用 `/web-access` 验证匹配与图谱域、通知域核心页面**

Expected: `/skill-graph`、`/match/[id]`、`/notifications` 可用且数据正常。

- [ ] **Step 4: 按流程进入代码评审与分支收尾**

Run: `git log --oneline -5`
Expected: 能清楚看到本次规格、验收、计划与后续实现提交历史。
