# 热门搜索（职位/公司）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为职位搜索与公司搜索新增热门搜索能力，基于 Redis 统计关键词热度，并在搜索框聚焦时展示可点击热门词。

**Architecture:** 后端在搜索接口收到有效关键词时写入 Redis ZSet（分职位/公司两个 key），并提供读取热门词接口；前端在输入框 focus 时请求热门词并渲染下拉面板，点击热门词回填并触发搜索。采用最小侵入改造，不改变现有筛选逻辑。

**Tech Stack:** Spring Boot + StringRedisTemplate（Redis ZSet）、Next.js + React、现有 Tailwind/shadcn 风格 UI、MockMvc IT + Vitest。

---

### Task 1: 后端热门搜索集成测试（RED）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/publicapi/interfaces/controller/it/PublicJobControllerIT.java`
- Modify: `backend/src/test/java/com/graphhire/publicapi/interfaces/controller/it/PublicCompanyControllerIT.java`

- [ ] **Step 1: 为职位搜索新增热门统计与读取测试（先失败）**
- [ ] **Step 2: 运行仅这两个 IT 用例，确认新增断言失败**

### Task 2: 后端 Redis 热词服务与 API（GREEN）

**Files:**
- Create: `backend/src/main/java/com/graphhire/publicapi/application/service/HotSearchAppService.java`
- Create: `backend/src/main/java/com/graphhire/publicapi/interfaces/dto/response/PublicHotSearchItemResponse.java`
- Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicJobController.java`
- Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicCompanyController.java`

- [ ] **Step 1: 新增 Redis 热词服务（record/list）并限制长度与最小有效词**
- [ ] **Step 2: 职位/公司搜索接口接入关键词统计**
- [ ] **Step 3: 新增职位/公司热门词读取接口**
- [ ] **Step 4: 运行 IT 用例，确认通过**

### Task 3: 前端 API 测试（RED）

**Files:**
- Modify: `frontend/tests/lib/api/public.test.ts`

- [ ] **Step 1: 为 jobs/companies 热门词 API 增加调用测试（先失败）**
- [ ] **Step 2: 运行该测试文件确认失败**

### Task 4: 前端 API 与 UI 组件（GREEN）

**Files:**
- Create: `frontend/src/components/ui/hot-search-dropdown.tsx`
- Modify: `frontend/src/lib/api/public.ts`
- Modify: `frontend/src/app/(user)/jobs/page.tsx`
- Modify: `frontend/src/app/(user)/companies/page.tsx`
- Create: `frontend/tests/components/hot-search-dropdown.test.tsx`

- [ ] **Step 1: 新增 publicApi 热门词方法并通过测试**
- [ ] **Step 2: 新增下拉组件（支持 loading/empty/click）并补组件测试**
- [ ] **Step 3: 在职位页搜索框接入 focus 展示热门词，点击回填并触发搜索**
- [ ] **Step 4: 在公司页搜索框接入同样能力（移动端+桌面端）**
- [ ] **Step 5: 运行相关 Vitest 用例确保通过**

### Task 5: 全量验证与提交

**Files:**
- Modify: `RELEASE-NOTES.md`
- Include existing: `frontend/src/app/(user)/skill-graph/page.tsx`（按用户要求一并提交）

- [ ] **Step 1: 执行前后端改动面验证命令（mvn compile/mvn test + npm run build/npm run test:run）**
- [ ] **Step 2: 更新 RELEASE-NOTES.md 记录热门搜索功能与提交内容**
- [ ] **Step 3: git add 全部改动并使用中文规范提交信息提交**
