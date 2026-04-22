# Resume Limit & Default Graph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 限制每用户最多3份简历，并在成功设默认后异步刷新能力图谱，同时支持管理页重新解析入口。

**Architecture:** 在应用服务层增加业务约束，新增一个默认切换MQ事件与消费者复用图谱构建服务；前端仅增强管理页动作入口与状态控制。

**Tech Stack:** Spring Boot, RocketMQ, MyBatis-Plus, Next.js, Vitest

---

### Task 1: 后端测试先行（数量限制与设默认约束）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/resume/application/service/ResumeAppServiceTest.java`

- [ ] **Step 1: 写失败测试（上传超限拒绝）**
- [ ] **Step 2: 写失败测试（非SUCCESS设默认拒绝）**
- [ ] **Step 3: 写失败测试（SUCCESS设默认后发MQ）**
- [ ] **Step 4: 运行 `mvn -Dtest=ResumeAppServiceTest test` 确认失败原因正确**

### Task 2: 后端实现

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/application/service/ResumeAppService.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/mq/ResumeMQProducer.java`
- Add: `backend/src/main/java/com/graphhire/resume/infrastructure/mq/ResumeDefaultChangedMQConsumer.java`

- [ ] **Step 1: 在 uploadResume 增加最多3份校验与异常信息**
- [ ] **Step 2: 在 setDefaultResume 增加 SUCCESS 状态校验**
- [ ] **Step 3: 设默认成功后发送 resume-default-changed 事件**
- [ ] **Step 4: 新增消费者并调用 GraphBuildService.buildGraphForResume**
- [ ] **Step 5: 运行 `mvn -Dtest=ResumeAppServiceTest,ResumeGraphMQConsumerTest test` 或最小相关测试集**

### Task 3: 前端测试与实现

**Files:**
- Modify: `frontend/src/app/(user)/resume/manage/page.tsx`
- Modify: `frontend/src/lib/api/resume.ts`
- Add/Modify: `frontend/src/app/(user)/resume/manage/page.test.tsx`（若已存在则修改）

- [ ] **Step 1: 写失败测试（按钮显示/禁用逻辑）**
- [ ] **Step 2: 写失败测试（点击重新解析触发API并刷新）**
- [ ] **Step 3: 实现按钮逻辑与点击行为**
- [ ] **Step 4: 运行 `npm run test:run` 验证前端通过**

### Task 4: 验证与浏览器检查

**Files:**
- Modify: 无（运行验证）

- [ ] **Step 1: 运行 `npm run build`**
- [ ] **Step 2: 运行 `mvn compile`**
- [ ] **Step 3: 运行 `mvn test`（记录现有非本次改动失败项）**
- [ ] **Step 4: 用 CDP 打开简历管理页，验证“重新解析”按钮与状态行为**
