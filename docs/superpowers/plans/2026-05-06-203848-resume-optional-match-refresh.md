# 简历上传与重解析可选全量匹配刷新 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在上传简历与重新解析中提供“是否刷新所有职位匹配记录”开关（默认勾选），并确保技能/图谱更新始终执行。

**Architecture:** 前端在触发上传/重解析前收集用户选择并透传 `refreshAllMatches`；后端 controller -> service -> MQ message 贯通该参数；MQ 消费端将“匹配刷新”与“图谱更新”分离，仅前者受开关影响。

**Tech Stack:** Next.js + Vitest，Spring Boot + RocketMQ + JUnit/Mockito

---

### Task 1: 前端 RED 测试

**Files:**
- Modify: `frontend/src/tests/pages/user-resume-manage-page.test.tsx`

- [ ] **Step 1: 增加重解析参数断言**
- [ ] **Step 2: 增加上传 FormData 字段断言**
- [ ] **Step 3: 运行单测并确认失败**

### Task 2: 后端 RED 测试

**Files:**
- Modify: `backend/src/test/java/com/graphhire/resume/interfaces/controller/ResumeControllerTest.java`
- Modify: `backend/src/test/java/com/graphhire/resume/application/service/ResumeAppServiceTest.java`
- Modify: `backend/src/test/java/com/graphhire/resume/infrastructure/mq/ResumeParseMQConsumerTest.java`

- [ ] **Step 1: 改造 controller/service 方法签名断言**
- [ ] **Step 2: 增加 MQ 透传与 default+false 不触发匹配断言**
- [ ] **Step 3: 运行目标测试并确认失败**

### Task 3: 生产代码 GREEN

**Files:**
- Modify: `frontend/src/app/(user)/resume/_components/ResumeManageContent.tsx`
- Modify: `frontend/src/lib/api/resume.ts`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/ResumeController.java`
- Modify: `backend/src/main/java/com/graphhire/resume/application/service/ResumeAppService.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/mq/ResumeMQProducer.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/mq/ResumeParseMQConsumer.java`

- [ ] **Step 1: 前端透传 refreshAllMatches**
- [ ] **Step 2: 后端接口/服务参数透传**
- [ ] **Step 3: MQ 消息与消费条件更新**
- [ ] **Step 4: 运行目标测试确认通过**

### Task 4: 验证与交付

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 后端执行 `mvn compile` + `mvn test`**
- [ ] **Step 2: 前端执行 `npm run build` + `npm run test:run`**
- [ ] **Step 3: 更新发布记录并提交**
