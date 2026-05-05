# 默认简历安全重匹配 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让上传自动默认与手动设默认都能触发安全的全职位重匹配，并保证失败不删旧匹配记录。

**Architecture:** 通过改造 `MatchAppService.triggerMatchForResume` 为事务内“更新/插入优先、成功后清理过期旧记录”的模式，替代先删后算；在 `ResumeAppService` 与 `ResumeParseMQConsumer` 中补齐默认触发入口。

**Tech Stack:** Spring Boot、MyBatis-Plus、RocketMQ、JUnit5、Mockito

---

### Task 1: 先写失败测试（匹配服务核心行为）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/match/application/service/MatchAppServiceTest.java`

- [ ] **Step 1: 改造 `triggerMatchForResume_shouldRebuildRecordsForAllPublishedJobs` 断言为“非先删”**
- [ ] **Step 2: 新增断言已有职位匹配会按旧记录 id 更新，过期旧记录才删除**
- [ ] **Step 3: 新增中途异常场景，断言不会执行旧记录清理**
- [ ] **Step 4: 运行 `mvn -Dtest=MatchAppServiceTest test`，确认失败（RED）**

### Task 2: 先写失败测试（默认触发链路）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/resume/application/service/ResumeAppServiceTest.java`
- Modify: `backend/src/test/java/com/graphhire/resume/infrastructure/mq/ResumeParseMQConsumerTest.java`

- [ ] **Step 1: 新增上传首份简历自动默认断言**
- [ ] **Step 2: 改造手动设默认断言为“先触发新默认重匹配，再清理旧默认”**
- [ ] **Step 3: 新增默认简历解析成功触发重匹配断言（及非默认不触发）**
- [ ] **Step 4: 运行 `mvn -Dtest=ResumeAppServiceTest,ResumeParseMQConsumerTest test`，确认失败（RED）**

### Task 3: 实现生产代码最小改动（GREEN）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/application/service/MatchAppService.java`
- Modify: `backend/src/main/java/com/graphhire/resume/application/service/ResumeAppService.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/mq/ResumeParseMQConsumer.java`

- [ ] **Step 1: 改造 `triggerMatchForResume` 为“先更新/插入，再删除过期旧记录”**
- [ ] **Step 2: 在 `uploadResume` 中实现“无默认简历时新上传自动默认”**
- [ ] **Step 3: 在 `setDefaultResume` 中触发新默认重匹配并后置清理旧默认**
- [ ] **Step 4: 在解析成功消费者中对默认简历触发 `triggerMatchForResume`**
- [ ] **Step 5: 运行上述定向测试并通过（GREEN）**

### Task 4: 回归验证与发布记录

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 运行 `mvn compile`**
- [ ] **Step 2: 运行 `mvn test`**
- [ ] **Step 3: 更新 `RELEASE-NOTES.md` 记录本次改动**
- [ ] **Step 4: 提交代码（中文提交信息，含前缀）**
