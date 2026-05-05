# 移动端聊天外层留白与固定布局优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在用户端与企业端移动端聊天页面实现“无外层留白、外层直角、头尾固定中间滚动”的统一布局。

**Architecture:** 在 `ChatWorkspace` 上通过 `mobileMode` + Tailwind 响应式类完成布局改造；以测试先行锁定行为，再做组件结构与样式调整。

**Tech Stack:** Next.js、React、Tailwind CSS、Vitest

---

### Task 1: 先写失败测试锁定移动端布局行为

**Files:**
- Modify: `frontend/src/tests/pages/chat-workspace-redesign.test.tsx`

- [x] 新增无外层留白与直角断言
- [x] 新增详情页头尾固定/中间滚动断言
- [x] 运行目标测试并确认先失败

### Task 2: 修改聊天工作台组件实现布局

**Files:**
- Modify: `frontend/src/features/chat/components/ChatWorkspace.tsx`

- [x] 根容器移动端 padding 改为 0
- [x] 列表/详情外层容器移动端改为直角
- [x] 详情模式容器改为 `100dvh` 固定布局
- [x] 头部/底部设 `shrink-0`，消息区设 `flex-1 overflow-y-auto`

### Task 3: 回归验证与收尾

**Files:**
- Modify: `RELEASE-NOTES.md`
- Create: `docs/superpowers/specs/2026-05-05-180600-mobile-chat-edge-to-edge-fixed-layout-design.md`
- Create: `docs/superpowers/acceptance/2026-05-05-180600-mobile-chat-edge-to-edge-fixed-layout-acceptance.md`
- Create: `docs/superpowers/plans/2026-05-05-180600-mobile-chat-edge-to-edge-fixed-layout.md`

- [x] `npm run test:run -- src/tests/pages/chat-workspace-redesign.test.tsx`
- [x] `npm run build`
- [ ] 更新发布说明并提交
