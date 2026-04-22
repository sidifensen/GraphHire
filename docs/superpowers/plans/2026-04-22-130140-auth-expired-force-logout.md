# 登录过期强制退出 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复登录过期时未强制退出的问题，确保所有 401 场景都能立即登出并跳转登录页。

**Architecture:** 在统一 API 客户端拦截层处理鉴权失效，复用单一未授权处理函数，避免页面各自处理导致漏判。通过单测先复现包装码 401 场景，再实施最小改动通过测试。

**Tech Stack:** Next.js、Axios、Vitest

---

### Task 1: 编写失败测试（RED）

**Files:**
- Modify: `frontend/tests/lib/api/client.test.ts`

- [ ] Step 1: 新增“包装码 code=401 触发 logout”测试（用户域、管理域）
- [ ] Step 2: 运行 `npm run test:run -- tests/lib/api/client.test.ts`，确认新增用例失败

### Task 2: 实现拦截器修复（GREEN）

**Files:**
- Modify: `frontend/src/lib/api/client.ts`

- [ ] Step 1: 抽取统一 `handleUnauthorized` 逻辑
- [ ] Step 2: 在响应成功拦截器补充 `code===401` 分支，触发强制登出与跳转
- [ ] Step 3: 保持 HTTP 401 在响应失败拦截器也触发同逻辑
- [ ] Step 4: 运行 `npm run test:run -- tests/lib/api/client.test.ts`，确认通过

### Task 3: 全量验证与浏览器验证

**Files:**
- Verify only

- [ ] Step 1: 前端构建 `npm run build`
- [ ] Step 2: 前端测试 `npm run test:run`
- [ ] Step 3: 后端编译 `mvn compile`
- [ ] Step 4: 后端测试 `mvn test`
- [ ] Step 5: 使用 CDP 浏览器验证 401 场景会强退并跳登录页
