# 聊天桌面端雾面组件化改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户端与企业端桌面沟通页升级为雾面低边框风格，并完成核心 UI 组件化拆分，不改变业务行为。

**Architecture:** `ChatWorkspace` 继续负责状态和数据请求，新增多个纯展示组件承接布局渲染；样式通过共享 class 片段统一管理，桌面端增强视觉层次，移动端维持原行为。

**Tech Stack:** Next.js App Router、React、TypeScript、Tailwind CSS、Vitest + Testing Library

---

### Task 1: 先写失败测试锁定新视觉与组件边界（AC-001, AC-002, AC-003, AC-006）

**Files:**
- Modify: `frontend/src/tests/pages/chat-workspace-redesign.test.tsx`

- [ ] **Step 1: 新增桌面雾面与组件化断言（先失败）**
在现有聊天测试中新增断言：
1) `chat-workspace` 包含新的桌面壳类名；
2) 会话列表 panel/详情 panel 包含去重边框与雾面类名；
3) 输入区包含 dock 类名；
4) 保留移动端既有断言。

- [ ] **Step 2: 运行定向测试确认失败**
Run: `npm run test:run -- src/tests/pages/chat-workspace-redesign.test.tsx`
Expected: FAIL（缺少新增类名或组件挂载点）。

### Task 2: 拆分聊天 UI 子组件并接入（AC-003, AC-004, AC-005）

**Files:**
- Create: `frontend/src/features/chat/components/ChatAvatar.tsx`
- Create: `frontend/src/features/chat/components/ChatEmojiPanel.tsx`
- Create: `frontend/src/features/chat/components/ChatPreviewModal.tsx`
- Create: `frontend/src/features/chat/components/ChatConversationListPanel.tsx`
- Create: `frontend/src/features/chat/components/ChatDetailHeader.tsx`
- Create: `frontend/src/features/chat/components/ChatMessageStream.tsx`
- Create: `frontend/src/features/chat/components/ChatComposerDock.tsx`
- Modify: `frontend/src/features/chat/components/ChatWorkspace.tsx`

- [ ] **Step 1: 抽离无状态/弱状态展示组件**
将 Avatar、Emoji 面板、预览弹层、会话列表、详情头、消息流、输入区从 `ChatWorkspace` 拆出，props 明确传入。

- [ ] **Step 2: 保持行为不变**
`ChatWorkspace` 仍负责：接口请求、状态管理、发送与预览事件、已读更新与移动端路由切换。

- [ ] **Step 3: 运行定向测试确认行为回归无破坏**
Run: `npm run test:run -- src/tests/pages/chat-workspace-redesign.test.tsx`
Expected: PASS。

### Task 3: 应用雾面低边框桌面样式（AC-001, AC-002, AC-003, AC-004）

**Files:**
- Modify: `frontend/src/features/chat/components/ChatWorkspace.tsx`
- Modify: `frontend/src/features/chat/components/ChatConversationListPanel.tsx`
- Modify: `frontend/src/features/chat/components/ChatDetailHeader.tsx`
- Modify: `frontend/src/features/chat/components/ChatMessageStream.tsx`
- Modify: `frontend/src/features/chat/components/ChatComposerDock.tsx`

- [ ] **Step 1: 根壳层与双栏容器桌面雾面化**
增加渐变背景、轻模糊、阴影类；桌面端弱化外边框。

- [ ] **Step 2: 会话项、消息气泡、附件块去重边框**
改为背景层级 + 轻交互反馈，保留可读性与操作可见性。

- [ ] **Step 3: 发送区改为 Dock 感**
输入区和工具按钮改为圆角悬浮块，维持原交互。

### Task 4: 全量前端验证与文档更新（AC-007）

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 执行前端验证命令**
Run: `npm run test:run`
Expected: PASS。
Run: `npm run build`
Expected: PASS。

- [ ] **Step 2: 更新发布说明并准备提交**
在 `RELEASE-NOTES.md` 的 `2026-05-07` 下新增本次聊天页桌面端样式改版与组件化说明。

- [ ] **Step 3: 提交代码**
Run:
`git add <changed files>`
`git commit -m "feat: 聊天页桌面端雾面化并完成组件拆分"`
Expected: commit 成功。