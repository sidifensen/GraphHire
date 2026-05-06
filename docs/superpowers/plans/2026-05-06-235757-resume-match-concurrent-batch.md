# Resume Match Concurrent Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将默认简历全职位匹配改为并发4线程执行，并实现单职位失败3次重试后跳过且记录日志。

**Architecture:** 在 `MatchAppService.triggerMatchForResume` 中引入固定线程池与 `CompletableFuture` 聚合。每个职位任务内部执行“最多3次重试”的保存流程，失败仅影响当前职位。主线程汇总后再执行旧记录清理与汇总日志。

**Tech Stack:** Spring Boot, Java 17, CompletableFuture, JUnit5, Mockito

---

### Task 1: 先写失败测试覆盖重试与跳过

**Files:**
- Modify: `backend/src/test/java/com/graphhire/match/application/service/MatchAppServiceTest.java`

- [ ] **Step 1: 新增“失败3次后跳过且不中断”测试**
- [ ] **Step 2: 新增“前两次失败第三次成功”测试**
- [ ] **Step 3: 运行定向测试并确认 RED**

### Task 2: 实现并发与重试逻辑

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/application/service/MatchAppService.java`

- [ ] **Step 1: 引入并发常量（并发度4、最大重试3）与线程池执行框架**
- [ ] **Step 2: 抽取单职位重试保存方法，记录重试与跳过日志**
- [ ] **Step 3: 汇总成功/跳过计数并输出批处理日志**

### Task 3: GREEN与回归验证

**Files:**
- Modify: `backend/src/test/java/com/graphhire/match/application/service/MatchAppServiceTest.java`
- Modify: `backend/src/main/java/com/graphhire/match/application/service/MatchAppService.java`

- [ ] **Step 1: 运行定向测试并确认 GREEN**
- [ ] **Step 2: 执行 `mvn compile`**
- [ ] **Step 3: 执行 `mvn test`**

### Task 4: 文档与提交

**Files:**
- Modify: `RELEASE-NOTES.md`
- Create: `docs/superpowers/specs/2026-05-06-235757-resume-match-concurrent-batch-design.md`
- Create: `docs/superpowers/acceptance/2026-05-06-235757-resume-match-concurrent-batch-acceptance.md`
- Create: `docs/superpowers/plans/2026-05-06-235757-resume-match-concurrent-batch.md`

- [ ] **Step 1: 更新发布说明**
- [ ] **Step 2: 仅暂存本次改动文件**
- [ ] **Step 3: 按规范中文提交（feat/fix前缀）**
