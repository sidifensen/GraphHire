# Sa-Token Redis持久化与官方续期对齐 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 后端重启后保留登录态，并将认证续期机制对齐到 Sa-Token 官方能力（timeout/active-timeout/auto-renew），移除现有非官方 refresh-token 伪实现。  

**Architecture:** 使用官方 `sa-token-redis-jackson` 让 token/session 持久化到 Redis。登录续期采用 Sa-Token 官方会话模型，不再维护业务自定义 refresh token 键。前端保持 401 失败兜底登出策略。  

**Tech Stack:** Spring Boot 3, Sa-Token 1.45.0, Redis, Next.js + Axios, JUnit/Vitest

---

### Task 1: 后端依赖与配置对齐

**Files:**
- Modify: `backend/pom.xml`
- Modify: `backend/src/main/resources/application.yml`

- [ ] **Step 1: 添加官方 Redis 持久化依赖**
- [ ] **Step 2: 移除非官方配置项（allow-refresh-token/refresh-token-timeout）并保留官方 token 配置**
- [ ] **Step 3: 编译验证配置可加载**

### Task 2: 后端 Auth 服务移除伪 refresh-token

**Files:**
- Modify: `backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java`
- Modify: `backend/src/main/java/com/graphhire/auth/interfaces/controller/AuthController.java`

- [ ] **Step 1: 删除 refreshToken 相关 Redis 查询与流程**
- [ ] **Step 2: 登录响应统一不返回业务 refreshToken 字段（保持 null）**
- [ ] **Step 3: 下线 `/auth/refresh-token` 接口并返回明确错误（或移除）**

### Task 3: 测试更新（先红后绿）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/auth/interfaces/controller/AuthControllerTest.java`
- Modify: `backend/src/test/java/com/graphhire/auth/interfaces/controller/it/AuthControllerIT.java`

- [ ] **Step 1: 先改测试断言，期望 refresh-token 接口不可用（RED）**
- [ ] **Step 2: 修改生产代码使测试通过（GREEN）**
- [ ] **Step 3: 运行后端测试子集并通过**

### Task 4: 前端行为与测试对齐

**Files:**
- Modify: `frontend/src/lib/api/client.ts`
- Modify: `frontend/src/lib/api/auth.ts`
- Modify: `frontend/tests/lib/api/client.test.ts`

- [ ] **Step 1: 前端移除 refreshToken API 出口（若无调用则仅清理类型引用）**
- [ ] **Step 2: 保持 401 立即登出逻辑，确保无隐式续期依赖**
- [ ] **Step 3: 运行前端测试子集并通过**

### Task 5: 文档与发布记录

**Files:**
- Modify: `RELEASE-NOTES.md`
- Create: `docs/superpowers/plans/2026-05-06-184154-satoken-redis-official-session-renewal.md`

- [ ] **Step 1: 记录本次改动摘要到 RELEASE-NOTES.md**
- [ ] **Step 2: 执行改动面验证命令并记录结果**
- [ ] **Step 3: 按规范提交中文 commit**
