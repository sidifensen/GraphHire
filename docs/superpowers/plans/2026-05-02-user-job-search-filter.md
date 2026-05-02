# 用户端职位页筛选联调 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让用户端职位页接入后端真实数据，并支持职位类别/行业/地点多选及其余条件单选筛选。

**Architecture:** 后端在 public 域新增筛选元数据树接口并扩展 `/public/jobs` 参数；前端职位页改为真实 API 驱动，使用弹窗组件承载树形与省市筛选，筛选状态统一映射到搜索参数。

**Tech Stack:** Spring Boot + MyBatis-Plus + Next.js + React + Vitest + MockMvc

---

### Task 1: 后端接口失败测试先行（TDD Red）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/publicapi/interfaces/controller/it/PublicJobControllerIT.java`
- Create: `backend/src/test/java/com/graphhire/publicapi/interfaces/controller/it/PublicFilterMetaControllerIT.java`

- [ ] **Step 1: 为 `/public/jobs` 新增筛选参数写失败 IT 用例**
- [ ] **Step 2: 为 `/public/position-types/tree` 与 `/public/industries/tree` 写失败 IT 用例**
- [ ] **Step 3: 运行后端定向测试，确认失败原因是接口/参数未实现**

### Task 2: 后端实现（TDD Green）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicJobController.java`
- Create: `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicFilterMetaController.java`
- Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/dto/response/PublicJobCardResponse.java`（若需扩展字段）

- [ ] **Step 1: 实现 `/public/jobs` 扩展参数过滤逻辑（职位类别叶子/行业叶子/城市多选/jobType/学历/规模）**
- [ ] **Step 2: 实现 `/public/position-types/tree`（仅可用节点）**
- [ ] **Step 3: 实现 `/public/industries/tree`（仅启用节点）**
- [ ] **Step 4: 运行后端定向测试，确认通过**

### Task 3: 前端页面失败测试先行（TDD Red）

**Files:**
- Create: `frontend/src/tests/pages/user-jobs-page.test.tsx`
- Modify: `frontend/src/lib/api/public.ts`（先声明 mock 需要的方法签名）

- [ ] **Step 1: 编写职位页筛选交互测试（弹窗打开、多选/单选、参数映射）**
- [ ] **Step 2: 运行前端定向测试，确认失败原因是页面仍为 mock 实现**

### Task 4: 前端实现（TDD Green）

**Files:**
- Modify: `frontend/src/lib/api/public.ts`
- Modify: `frontend/src/app/(user)/jobs/page.tsx`
- Create: `frontend/src/lib/constants/china-provinces-cities.ts`

- [ ] **Step 1: 扩展 public API 方法与类型（职位树/行业树/搜索新参数）**
- [ ] **Step 2: 重构职位页为真实接口驱动，接入筛选状态与请求参数映射**
- [ ] **Step 3: 实现职位类别/公司行业三栏弹窗与地点两栏弹窗**
- [ ] **Step 4: 运行前端定向测试，确认通过**

### Task 5: 回归验证与文档更新

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 执行后端检查：`mvn compile`、`mvn test`**
- [ ] **Step 2: 执行前端检查：`npm run build`、`npm run test:run`**
- [ ] **Step 3: 更新 `RELEASE-NOTES.md` 记录本次变更**
- [ ] **Step 4: 提交代码（中文 commit 前缀）**
