# 聊天面试通知弹窗组件化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将企业端聊天“面试通知”从内联表单改为可复用弹窗组件，并实现 shadcn 风格时间选择交互。

**Architecture:** 在 `ChatWorkspace` 引入独立 `InterviewInviteDialog` 组件，由组件内管理 UI 状态与字段校验，提交时通过回调触发既有 `chatApi.sendInterviewInvite`。时间选择采用 `Popover + Calendar + time input` 组合，输出兼容后端的本地 ISO 字符串。

**Tech Stack:** Next.js、React、TypeScript、Tailwind CSS、Vitest + Testing Library、Radix UI primitives。

---

### Task 1: TDD RED - 先写失败测试覆盖弹窗化行为

**Files:**
- Modify: `frontend/src/tests/pages/chat-workspace-redesign.test.tsx`

- [ ] **Step 1: 新增企业端“面试通知弹窗打开”断言**
- [ ] **Step 2: 新增“移除内联确认按钮”断言**
- [ ] **Step 3: 新增“提交后调用 sendInterviewInvite 且时间格式正确”断言**
- [ ] **Step 4: 运行 `npm run test:run -- src/tests/pages/chat-workspace-redesign.test.tsx`，确认新增断言失败**

### Task 2: 实现 shadcn 基础 UI 组件（最小集）

**Files:**
- Create: `frontend/src/components/ui/button.tsx`
- Create: `frontend/src/components/ui/input.tsx`
- Create: `frontend/src/components/ui/label.tsx`
- Create: `frontend/src/components/ui/dialog.tsx`
- Create: `frontend/src/components/ui/popover.tsx`
- Create: `frontend/src/components/ui/calendar.tsx`

- [ ] **Step 1: 新增 Button/Input/Label 轻量组件与 `cn` 合并类名**
- [ ] **Step 2: 新增 Dialog/Popover 封装，支持测试中可访问语义**
- [ ] **Step 3: 新增 Calendar 轻量实现（单月网格、可选日期）**

### Task 3: 实现面试通知弹窗组件并接入 ChatWorkspace

**Files:**
- Create: `frontend/src/features/chat/components/InterviewInviteDialog.tsx`
- Modify: `frontend/src/features/chat/components/ChatWorkspace.tsx`

- [ ] **Step 1: 编写 `InterviewInviteDialog`，实现字段状态、校验、时间选择层与提交回调**
- [ ] **Step 2: 在 `ChatWorkspace` 移除内联 invite 表单状态与 JSX**
- [ ] **Step 3: 用新组件替换“面试通知”交互并保持发送逻辑/错误处理**

### Task 4: TDD GREEN - 让测试通过并做回归

**Files:**
- Modify: `frontend/src/tests/pages/chat-workspace-redesign.test.tsx`
- Modify: `frontend/src/features/chat/components/InterviewInviteDialog.tsx`
- Modify: `frontend/src/features/chat/components/ChatWorkspace.tsx`

- [ ] **Step 1: 运行 `npm run test:run -- src/tests/pages/chat-workspace-redesign.test.tsx` 直至通过**
- [ ] **Step 2: 运行全量前端测试 `npm run test:run`**
- [ ] **Step 3: 运行前端构建 `npm run build`**

### Task 5: 发布记录与提交

**Files:**
- Modify: `RELEASE-NOTES.md`
- Modify: `docs/superpowers/specs/2026-05-07-171459-chat-interview-invite-dialog-design.md`
- Modify: `docs/superpowers/acceptance/2026-05-07-171459-chat-interview-invite-dialog-acceptance.md`
- Modify: `docs/superpowers/plans/2026-05-07-171459-chat-interview-invite-dialog.md`

- [ ] **Step 1: 更新 `RELEASE-NOTES.md` 记录本次弹窗组件化改造**
- [ ] **Step 2: `git add` 相关改动文件**
- [ ] **Step 3: 使用中文前缀提交信息完成提交**
