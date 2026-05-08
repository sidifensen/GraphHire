# 上传并发与异步链路优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保持现有接口兼容的前提下，实现上传链路限流、解析幂等互斥、解析/匹配解耦、MQ与S3并发配置化，以及异步上传任务化能力。

**Architecture:** 采用“兼容式增量”方案：保留同步上传接口，同时新增异步上传任务接口；使用 Redis Lua 令牌桶实现统一限流；通过解析锁避免重复解析；将匹配从解析消费者拆分为独立消费者；新增 upload_task 状态机支撑后台异步上传与可观测查询。

**Tech Stack:** Spring Boot 3.4.5, RocketMQ Spring 2.3.1, Redis (StringRedisTemplate + Lua), MyBatis-Plus, PostgreSQL, AWS S3 SDK v2

---

### Task 1: 基础配置与限流组件落地

**Files:**
- Create: `backend/src/main/java/com/graphhire/config/UploadRateLimitProperties.java`
- Create: `backend/src/main/java/com/graphhire/upload/application/service/UploadRateLimitService.java`
- Modify: `backend/src/main/resources/application.yml`
- Test: `backend/src/test/java/com/graphhire/upload/application/service/UploadRateLimitServiceTest.java`

- [ ] **Step 1: 编写限流服务失败测试（令牌不足返回false）**
- [ ] **Step 2: 运行单测确认失败**
- [ ] **Step 3: 实现 Redis Lua 令牌桶限流服务与配置绑定**
- [ ] **Step 4: 运行单测确认通过**
- [ ] **Step 5: 提交阶段性代码**

### Task 2: 上传入口接入限流

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/ResumeController.java`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonAvatarController.java`
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`
- Modify: `backend/src/main/java/com/graphhire/chat/interfaces/controller/ChatController.java`
- Modify: `backend/src/main/java/com/graphhire/config/GlobalExceptionHandler.java`
- Test: `backend/src/test/java/com/graphhire/resume/interfaces/controller/ResumeControllerTest.java`
- Test: `backend/src/test/java/com/graphhire/controllerIT/ChatControllerIT.java`

- [ ] **Step 1: 为简历上传限流新增失败测试（超限返回429）**
- [ ] **Step 2: 为聊天图片上传限流新增失败测试（超限返回429）**
- [ ] **Step 3: 运行新增测试确认失败**
- [ ] **Step 4: 在四个上传入口接入限流服务并抛出统一业务异常**
- [ ] **Step 5: 在全局异常处理中保留429状态码语义**
- [ ] **Step 6: 运行测试确认通过**
- [ ] **Step 7: 提交阶段性代码**

### Task 3: 解析锁与解析任务查询增强

**Files:**
- Create: `backend/src/main/java/com/graphhire/resume/application/service/ResumeParseLockService.java`
- Modify: `backend/src/main/java/com/graphhire/resume/domain/repository/ParseTaskRepository.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/ParseTaskRepositoryImpl.java`
- Modify: `backend/src/main/java/com/graphhire/resume/application/service/ResumeAppService.java`
- Test: `backend/src/test/java/com/graphhire/resume/application/service/ResumeAppServiceTest.java`
- Test: `backend/src/test/java/com/graphhire/resume/infrastructure/persistence/repository/ParseTaskRepositoryImplTest.java`

- [ ] **Step 1: 新增重复触发解析被拦截测试（service层）**
- [ ] **Step 2: 新增仓储运行中任务查询测试**
- [ ] **Step 3: 运行测试确认失败**
- [ ] **Step 4: 实现解析锁服务与仓储existsRunningByResumeId语义**
- [ ] **Step 5: 在触发解析逻辑中接入幂等互斥**
- [ ] **Step 6: 运行测试确认通过**
- [ ] **Step 7: 提交阶段性代码**

### Task 4: 解析/匹配解耦与消费者并发配置化

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/mq/ResumeMQProducer.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/mq/ResumeParseMQConsumer.java`
- Create: `backend/src/main/java/com/graphhire/resume/infrastructure/mq/ResumeMatchTriggerMQConsumer.java`
- Modify: `backend/src/main/resources/application.yml`
- Test: `backend/src/test/java/com/graphhire/resume/infrastructure/mq/ResumeParseMQConsumerTest.java`
- Create: `backend/src/test/java/com/graphhire/resume/infrastructure/mq/ResumeMatchTriggerMQConsumerTest.java`

- [ ] **Step 1: 新增“解析成功仅发送匹配触发消息”失败测试**
- [ ] **Step 2: 新增匹配触发消费者调用MatchAppService测试**
- [ ] **Step 3: 运行测试确认失败**
- [ ] **Step 4: 修改解析消费者，移除直接匹配调用，改为发送独立topic**
- [ ] **Step 5: 新增匹配触发消费者并实现可配置并发参数注入**
- [ ] **Step 6: 运行测试确认通过**
- [ ] **Step 7: 提交阶段性代码**

### Task 5: RustFS S3 客户端并发连接参数优化

**Files:**
- Modify: `backend/src/main/java/com/graphhire/config/RustFSConfig.java`
- Modify: `backend/src/main/resources/application.yml`
- Test: `backend/src/test/java/com/graphhire/resume/infrastructure/file/RustFSClientTest.java`

- [ ] **Step 1: 补充配置绑定失败测试（默认值与自定义值）**
- [ ] **Step 2: 运行测试确认失败**
- [ ] **Step 3: 在RustFSConfig中引入max-connections等HTTP参数配置化**
- [ ] **Step 4: 运行测试确认通过**
- [ ] **Step 5: 提交阶段性代码**

### Task 6: 上传任务表与领域模型

**Files:**
- Create: `backend/src/main/resources/db/migration/V2026_05_08_031__add_upload_task_for_async_resume.sql`
- Modify: `backend/src/main/resources/db/schema.sql`
- Create: `backend/src/main/java/com/graphhire/resume/domain/model/UploadTask.java`
- Create: `backend/src/main/java/com/graphhire/resume/domain/repository/UploadTaskRepository.java`
- Create: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/po/UploadTaskPO.java`
- Create: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/mapper/UploadTaskMapper.java`
- Create: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/UploadTaskRepositoryImpl.java`
- Test: `backend/src/test/java/com/graphhire/job/infrastructure/persistence/UploadTaskSchemaSqlTest.java`
- Create: `backend/src/test/java/com/graphhire/resume/infrastructure/persistence/repository/UploadTaskRepositoryImplTest.java`

- [ ] **Step 1: 新增schema/migration校验失败测试**
- [ ] **Step 2: 新增UploadTask仓储读写失败测试**
- [ ] **Step 3: 运行测试确认失败**
- [ ] **Step 4: 实现upload_task表结构、PO/Mapper/Repository**
- [ ] **Step 5: 运行测试确认通过**
- [ ] **Step 6: 提交阶段性代码**

### Task 7: 异步上传接口与任务查询接口

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/ResumeController.java`
- Modify: `backend/src/main/java/com/graphhire/resume/application/service/ResumeAppService.java`
- Create: `backend/src/main/java/com/graphhire/resume/interfaces/dto/UploadTaskResponse.java`
- Test: `backend/src/test/java/com/graphhire/resume/interfaces/controller/ResumeControllerTest.java`
- Test: `backend/src/test/java/com/graphhire/resume/application/service/ResumeAppServiceTest.java`

- [ ] **Step 1: 新增upload-async接口单测（返回taskId）**
- [ ] **Step 2: 新增upload-task查询接口单测（返回状态）**
- [ ] **Step 3: 运行测试确认失败**
- [ ] **Step 4: 在ResumeController与ResumeAppService实现异步任务创建与查询**
- [ ] **Step 5: 运行测试确认通过**
- [ ] **Step 6: 提交阶段性代码**

### Task 8: 异步上传任务消费者

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/mq/ResumeMQProducer.java`
- Create: `backend/src/main/java/com/graphhire/resume/infrastructure/mq/ResumeUploadAsyncMQConsumer.java`
- Modify: `backend/src/main/resources/application.yml`
- Test: `backend/src/test/java/com/graphhire/resume/infrastructure/mq/ResumeUploadAsyncMQConsumerTest.java`

- [ ] **Step 1: 新增异步上传任务消费者失败测试（成功与失败状态流转）**
- [ ] **Step 2: 运行测试确认失败**
- [ ] **Step 3: 实现消费者：上传、建简历、建parse_task、发解析消息、失败落盘**
- [ ] **Step 4: 运行测试确认通过**
- [ ] **Step 5: 提交阶段性代码**

### Task 9: 全量回归与文档收尾

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 执行后端编译与测试（`mvn compile`、`mvn test`）**
- [ ] **Step 2: 若失败则按失败项修复并复跑直至通过**
- [ ] **Step 3: 更新 RELEASE-NOTES.md 记录本次改动**
- [ ] **Step 4: 整理变更并提交（中文 commit message，符合前缀规范）**

