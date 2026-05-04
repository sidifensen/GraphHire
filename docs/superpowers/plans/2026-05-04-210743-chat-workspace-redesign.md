# 聊天工作台重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户端与企业端聊天页面升级为桌面双栏/移动单栏的统一工作台体验，并补全职位头部、头像消息、按天时间分隔、表情面板、图片与默认简历发送。

**Architecture:** 新增共享 `ChatWorkspace` 组件承载会话列表与聊天面板，页面层只负责注入角色配置（路由前缀、标题、可用动作）。通过现有聊天接口拉取会话与消息，通过用户/企业现有岗位接口补全职位头部展示字段。消息渲染按日期插入分隔节点，输入区抽象为统一工具条与发送动作。

**Tech Stack:** Next.js App Router、React、TypeScript、Tailwind CSS、Vitest + Testing Library。

---

### Task 1: 建立聊天工作台测试基线（RED）

**Files:**
- Modify: `frontend/src/tests/pages/user-workbench-layout-consistency.test.tsx`
- Create: `frontend/src/tests/pages/chat-workspace-redesign.test.tsx`

- [ ] **Step 1: 写失败测试（桌面双栏、移动单栏、时间分隔、表情面板）**
- [ ] **Step 2: 运行 `npm run test:run -- src/tests/pages/chat-workspace-redesign.test.tsx`，确认失败（缺少新结构/交互）**

### Task 2: 实现共享 ChatWorkspace 组件（GREEN）

**Files:**
- Create: `frontend/src/features/chat/components/ChatWorkspace.tsx`
- Create: `frontend/src/features/chat/components/ChatTypes.ts`
- Create: `frontend/src/features/chat/components/emoji.ts`

- [ ] **Step 1: 实现主布局（桌面双栏 + 移动单栏）与会话列表选择逻辑**
- [ ] **Step 2: 实现消息区（头像 + 按天时间分隔 + 文本/图片/简历/面试消息）**
- [ ] **Step 3: 实现输入区（文本/表情弹层/图片上传/发送按钮）**
- [ ] **Step 4: 本地运行新增测试，确认从失败转通过**

### Task 3: 接入用户端与企业端页面

**Files:**
- Modify: `frontend/src/app/(user)/chat/page.tsx`
- Modify: `frontend/src/app/(user)/chat/[conversationId]/page.tsx`
- Modify: `frontend/src/app/enterprise/chat/page.tsx`
- Modify: `frontend/src/app/enterprise/chat/[conversationId]/page.tsx`
- Modify: `frontend/src/lib/types/chat.ts`

- [ ] **Step 1: 用户端页面接入 ChatWorkspace，默认简历发送改为自动取第一份简历**
- [ ] **Step 2: 企业端页面接入 ChatWorkspace，保留面试通知发送能力**
- [ ] **Step 3: 保持移动端“列表到详情”路由行为**
- [ ] **Step 4: 跑相关测试，确认通过**

### Task 4: 职位头部信息补全与查看职位链接

**Files:**
- Modify: `frontend/src/features/chat/components/ChatWorkspace.tsx`
- Modify: `frontend/src/lib/types/chat.ts`

- [ ] **Step 1: 基于会话 `jobId` 请求职位详情（用户端 `publicApi.jobs.getById`，企业端 `companyApi.getJobDetail`）**
- [ ] **Step 2: 渲染“负责人/公司/岗位/薪资/地点/查看职位”头部信息**
- [ ] **Step 3: 补充失败回退显示，避免阻塞聊天主体**
- [ ] **Step 4: 运行页面测试，确保展示与链接行为正确**

### Task 5: 全量验证与文档提交

**Files:**
- Modify: `RELEASE-NOTES.md`
- Modify: `docs/superpowers/plans/2026-05-04-210743-chat-workspace-redesign.md`

- [ ] **Step 1: 执行前端验证 `npm run build`、`npm run test:run`**
- [ ] **Step 2: 更新 `RELEASE-NOTES.md` 记录本次聊天页重构**
- [ ] **Step 3: `git add` + 中文前缀提交信息提交所有改动**
