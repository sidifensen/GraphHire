# 聊天页暗色可读性修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复聊天页关键交互控件与消息区在夜间模式下的白底可读性问题，并补充对应回归测试。

**Architecture:** 仅调整 `features/chat/components` 的展示样式与 `styles/globals.css` 的滚动条主题化规则，不改动聊天业务逻辑。先测试失败，再最小实现通过，最后执行全量前端验证。

**Tech Stack:** Next.js, React, Tailwind CSS, Vitest, Testing Library

---

### Task 1: 暗色回归测试先行（RED）

**Files:**
- Modify: `frontend/src/tests/pages/chat-workspace-redesign.test.tsx`

- [ ] **Step 1: 添加暗色可读性断言（目标元素需无 `bg-white`）**
- [ ] **Step 2: 运行测试文件并确认新增断言失败**

### Task 2: 聊天组件样式修复（GREEN）

**Files:**
- Modify: `frontend/src/features/chat/components/ChatConversationListPanel.tsx`
- Modify: `frontend/src/features/chat/components/ChatComposerDock.tsx`
- Modify: `frontend/src/features/chat/components/ChatMessageStream.tsx`
- Modify: `frontend/src/features/chat/components/ChatEmojiPanel.tsx`
- Modify: `frontend/src/styles/globals.css`

- [ ] **Step 1: 会话搜索框容器与输入框改为主题 token 类**
- [ ] **Step 2: 表情按钮、图片按钮、文本输入框改为主题 token 类**
- [ ] **Step 3: 对方气泡与日期标签改为主题 token 类**
- [ ] **Step 4: 为消息区/会话区滚动容器挂载 `chat-scrollbar` 并补全主题滚动条 CSS**

### Task 3: 验证与收尾

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 运行 `npm run test:run`**
- [ ] **Step 2: 运行 `npm run build`**
- [ ] **Step 3: 更新 RELEASE-NOTES 记录本次修复**
- [ ] **Step 4: 按规范提交（中文前缀提交信息）**
