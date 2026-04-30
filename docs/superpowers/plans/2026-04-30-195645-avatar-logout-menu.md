# 头像下拉退出登录 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为企业端与用户端的头像入口提供一致的“点击头像 -> 退出登录”能力（覆盖桌面与移动场景）

**Architecture:** 在企业端 `TopNav` 与用户端 `Navbar` 内新增本地下拉菜单状态与外部点击收起逻辑，退出动作统一调用 `logoutWithServerInvalidation`。不改后端接口，仅补前端交互与测试。

**Tech Stack:** Next.js + React + Vitest + Testing Library

---

### Task 1: 企业端 TopNav 先测后改

**Files:**
- Modify: `frontend/src/tests/components/mock-enterprise-topnav-auth.test.tsx`
- Modify: `frontend/src/app/enterprise/_mock/components/TopNav.tsx`

- [ ] **Step 1: 写失败测试**
添加用例：点击头像后出现“退出登录”；点击退出后调用 `logoutWithServerInvalidation`。

- [ ] **Step 2: 运行测试确认失败**
Run: `npm run test:run -- src/tests/components/mock-enterprise-topnav-auth.test.tsx`
Expected: FAIL（缺少菜单/未调用登出）

- [ ] **Step 3: 写最小实现**
在 `TopNav.tsx` 增加菜单开关、外部关闭、桌面+移动头像按钮触发和退出事件。

- [ ] **Step 4: 运行测试确认通过**
Run: `npm run test:run -- src/tests/components/mock-enterprise-topnav-auth.test.tsx`
Expected: PASS

### Task 2: 用户端 Navbar 先测后改

**Files:**
- Modify: `frontend/src/tests/components/mock-user-navbar-auth.test.tsx`
- Modify: `frontend/src/app/(user)/_mock/components/Navbar.tsx`

- [ ] **Step 1: 写失败测试**
添加用例：点击头像后出现“退出登录”；点击退出后调用 `logoutWithServerInvalidation`。

- [ ] **Step 2: 运行测试确认失败**
Run: `npm run test:run -- src/tests/components/mock-user-navbar-auth.test.tsx`
Expected: FAIL（缺少菜单/未调用登出）

- [ ] **Step 3: 写最小实现**
在 `Navbar.tsx` 增加菜单状态、外部关闭、退出按钮逻辑。

- [ ] **Step 4: 运行测试确认通过**
Run: `npm run test:run -- src/tests/components/mock-user-navbar-auth.test.tsx`
Expected: PASS

### Task 3: 全量验证与浏览器验收

**Files:**
- Modify: `RELEASE-NOTES.md`（如需记录）

- [ ] **Step 1: 前端构建**
Run: `cd frontend && npm run build`
Expected: exit 0

- [ ] **Step 2: 后端编译**
Run: `cd backend && mvn compile`
Expected: exit 0

- [ ] **Step 3: 前端测试**
Run: `cd frontend && npm run test:run`
Expected: exit 0

- [ ] **Step 4: 后端测试**
Run: `cd backend && mvn test`
Expected: exit 0

- [ ] **Step 5: CDP 浏览器验证**
按 `/web-access` skill，验证企业端与用户端 PC/手机端头像退出交互可用。

- [ ] **Step 6: 提交代码**
Run:
`git add <changed-files>`
`git commit -m "feat: 企业端与用户端头像菜单支持退出登录"`