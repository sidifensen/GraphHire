# User Company Detail Desktop Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户端公司详情页桌面信息架构调整为“公司名下方双入口（公司介绍 / 在招职位）”，默认展示公司介绍，切换后展示该公司全部在招职位。

**Architecture:** 保留现有真实 API 拉取逻辑与公司头部字段展示，只重构详情页内容区为 Tab 切换结构。通过前端页面测试先写失败断言（默认 Tab、切换后内容变化），再最小改动页面实现，最后执行前端 build 与 test 全量验证。

**Tech Stack:** Next.js App Router + React + Tailwind CSS + Vitest + RTL

---

### Task 1: 公司详情页 Tab 行为测试（RED）

**Files:**
- Modify: `frontend/tests/pages/user-company-detail-page.test.tsx`

- [ ] **Step 1: 新增/调整断言，要求默认激活“公司介绍”Tab，职位列表默认不展示**
- [ ] **Step 2: 新增断言，点击“在招职位”Tab 后展示职位列表并切换选中状态**
- [ ] **Step 3: 运行单测确认失败（当前实现默认同时展示职位）**
Run: `npm run test:run -- tests/pages/user-company-detail-page.test.tsx`
Expected: FAIL

### Task 2: 公司详情页内容区改为 Tab 结构（GREEN）

**Files:**
- Modify: `frontend/src/app/(user)/companies/[id]/page.tsx`

- [ ] **Step 1: 在公司头部区域（公司名下方）新增 `公司介绍 / 在招职位` Tab 入口**
- [ ] **Step 2: 默认状态为 `公司介绍`，内容区展示公司介绍与真实字段信息块**
- [ ] **Step 3: 切换到 `在招职位` 时仅展示职位列表（真实 `jobs` 数据）**
- [ ] **Step 4: 保持公司头部信息字段完全沿用当前后端真实字段，不新增虚构字段**
- [ ] **Step 5: 运行详情页单测验证通过**
Run: `npm run test:run -- tests/pages/user-company-detail-page.test.tsx`
Expected: PASS

### Task 3: 回归验证与发布记录

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 前端构建验证**
Run: `npm run build`
Expected: BUILD SUCCESS

- [ ] **Step 2: 前端测试验证**
Run: `npm run test:run`
Expected: PASS

- [ ] **Step 3: 更新发布记录并提交**
- 追加本次“公司详情页桌面 Tab 信息架构改造”说明到 `RELEASE-NOTES.md`
- 按规范执行 `git add` + `git commit`（中文前缀提交信息）
