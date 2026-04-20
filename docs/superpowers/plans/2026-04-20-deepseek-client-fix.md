# DeepSeek Client Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 DeepSeek chat/completions 鉴权、响应解析与 fallback 可观测性问题，并补齐回归测试。

**Architecture:** 在 `DeepSeekClient` 内抽出统一调用/内容提取逻辑，所有公开方法复用同一入口；JSON 解析统一先取 `choices[0].message.content`，并兼容 fenced JSON。保留现有 mock/fallback，但为成功与降级路径补充日志。

**Tech Stack:** Java 21, Spring Boot, Hutool HTTP/JSON, JUnit 5, Mockito

---

### Task 1: 锁定 DeepSeek 现有缺陷的失败测试

**Files:**
- Create: `backend/src/test/java/com/graphhire/match/infrastructure/ai/DeepSeekClientTest.java`
- Modify: `backend/pom.xml`（如测试依赖不足时才调整；预计无需修改）
- Test: `backend/src/test/java/com/graphhire/match/infrastructure/ai/DeepSeekClientTest.java`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Keep only behavior assertions for header / content parsing / fallback / fenced JSON**
- [ ] **Step 4: Re-run targeted test and confirm RED**

### Task 2: 修复 `DeepSeekClient`

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/infrastructure/ai/DeepSeekClient.java`
- Test: `backend/src/test/java/com/graphhire/match/infrastructure/ai/DeepSeekClientTest.java`

- [ ] **Step 1: Add unified chat completion call with status/body/content checks and logging**
- [ ] **Step 2: Route `generateMatchReason` / `calculateMatch` / `parseResume` / `parseJob` through the unified path**
- [ ] **Step 3: Add fenced JSON normalization and robust content JSON parsing**
- [ ] **Step 4: Run targeted tests to reach GREEN**
- [ ] **Step 5: Refactor minimally without expanding scope**

### Task 3: 验证与收尾

**Files:**
- Modify: `docs/superpowers/specs/2026-04-20-deepseek-client-fix-design.md`
- Modify: `docs/superpowers/acceptance/2026-04-20-deepseek-client-fix-acceptance.md`
- Modify: `docs/superpowers/plans/2026-04-20-deepseek-client-fix.md`

- [ ] **Step 1: Run `mvn -q "-Dtest=DeepSeekClientTest,JobParseMQConsumerTest,ResumeParseMQConsumerTest" test`**
- [ ] **Step 2: Record pass/fail summary for final report**
- [ ] **Step 3: Keep source changes scoped to backend files and tests directly related to this fix**
