# 移动端聊天列表详情分离 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户端与企业端移动端聊天改为“列表页与详情页分离”，并修复图片溢出与移动端留白过大问题。

**Architecture:** 复用现有聊天路由结构，通过 `ChatWorkspace` 的 `mobileMode` 控制列表/详情面板可见性；在 list 模式移动端点击会话后路由跳转，在 detail 模式注入返回入口；通过样式类约束图片边界与移动端间距。

**Tech Stack:** Next.js App Router、React、Tailwind CSS、Vitest + Testing Library

---

### Task 1: 先写失败测试覆盖移动端分离与样式约束

**Files:**
- Modify: `frontend/src/tests/pages/chat-workspace-redesign.test.tsx`

- [x] **Step 1: 增加用户端 list/detail 分离断言（失败）**
- [x] **Step 2: 增加企业端 detail 返回按钮断言（失败）**
- [x] **Step 3: 增加图片边界与移动端紧凑间距断言（失败）**
- [x] **Step 4: 运行单测确认新增用例先失败**

### Task 2: 实现移动端列表/详情分离与返回交互

**Files:**
- Modify: `frontend/src/features/chat/components/ChatWorkspace.tsx`

- [x] **Step 1: 注入 `useRouter`，封装移动端列表点击跳转逻辑**
- [x] **Step 2: 为列表面板与详情面板增加测试标识并调整显示条件**
- [x] **Step 3: 在 detail 模式头部增加返回会话列表入口**

### Task 3: 实现图片边界与移动端间距优化

**Files:**
- Modify: `frontend/src/features/chat/components/ChatWorkspace.tsx`

- [x] **Step 1: 调整根容器移动端 padding 为紧凑值**
- [x] **Step 2: 调整图片缩略图样式为容器内自适应不越界**

### Task 4: 验证与收尾

**Files:**
- Modify: `RELEASE-NOTES.md`
- Create: `docs/superpowers/specs/2026-05-05-174500-mobile-chat-split-design.md`
- Create: `docs/superpowers/acceptance/2026-05-05-174500-mobile-chat-split-acceptance.md`
- Create: `docs/superpowers/plans/2026-05-05-174500-mobile-chat-split.md`

- [x] **Step 1: 运行目标测试文件并通过**
- [x] **Step 2: 运行前端构建并通过**
- [x] **Step 3: 尝试全量前端测试并记录环境限制（若存在）**
- [ ] **Step 4: 更新 RELEASE-NOTES 并提交**
