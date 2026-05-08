# 聊天沟通页 PDF 预览修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复聊天沟通页 PDF 预览被浏览器拦截的问题，保证弹窗内可预览并提供降级下载。

**Architecture:** 前端仅调整聊天预览弹窗渲染策略，将 PDF 从 `iframe sandbox` 切换为 `object[type=application/pdf]` + 回退文案链接；通过测试先失败后通过验证行为，不改动后端接口。

**Tech Stack:** Next.js, React, TypeScript, Vitest, Testing Library

---

### Task 1: 先写失败测试（RED）

**Files:**
- Modify: `frontend/src/tests/pages/chat-workspace-redesign.test.tsx`

- [ ] **Step 1: 调整 PDF 预览断言到新结构（`object` 存在且不再要求 iframe sandbox）**
- [ ] **Step 2: 运行聊天页测试文件，确认在旧实现下失败**

### Task 2: 最小实现修复（GREEN）

**Files:**
- Modify: `frontend/src/features/chat/components/ChatPreviewModal.tsx`

- [ ] **Step 1: PDF 预览改为 `object type=application/pdf data={previewUrl}`**
- [ ] **Step 2: 在 `object` 内容区加入回退提示与下载链接**
- [ ] **Step 3: 保持图片预览和关闭逻辑不变，避免引入额外行为变更**

### Task 3: 通过验证与收尾

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 运行聊天页测试文件，确认通过**
- [ ] **Step 2: 运行 `npm run test:run`**
- [ ] **Step 3: 运行 `npm run build`**
- [ ] **Step 4: 更新 `RELEASE-NOTES.md` 记录本次修复**
- [ ] **Step 5: 按规范提交（中文前缀）**