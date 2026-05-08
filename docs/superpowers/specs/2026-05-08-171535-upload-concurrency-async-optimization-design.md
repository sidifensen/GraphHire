# 上传并发与异步链路优化设计

**日期**: 2026-05-08  
**范围**: backend

## 1. 目标

本次优化统一解决上传链路的六类问题：

1. 上传接口无统一限流，突发流量下易放大线程阻塞。
2. 同一简历可被重复触发解析，缺少解析幂等互斥。
3. `resume-parse` 消费者承担了解析和匹配两类重任务，消费链路耦合。
4. RocketMQ 消费并发参数依赖默认值，缺少环境化配置。
5. RustFS S3 客户端连接池参数保守，高并发时稳定性不足。
6. 上传仅有同步接口，请求线程需等待对象存储上传完成，缺少“任务化异步上传”能力。

## 2. 设计原则

1. **兼容优先**：保留现有同步上传接口，不破坏当前前端调用。
2. **增量演进**：新增异步接口与后台任务，不一次性替换旧路径。
3. **幂等可重试**：上传任务、解析任务都以状态机方式运行，支持失败重试。
4. **可观测性**：关键状态和限流拒绝可在任务与日志中明确定位。
5. **配置化**：限流阈值、MQ并发、任务消费并发全部通过配置项管理。

## 3. 总体架构调整

### 3.1 上传入口层

新增统一上传限流组件 `UploadRateLimitService`，在以下入口接入：

- `/resume/my/upload`
- `/resume/my/upload-async`（新增）
- `/person/avatar`
- `/company/avatar`
- `/chat/messages/image`

限流策略：

1. 用户级令牌桶（防单用户突发）。
2. 接口级全局令牌桶（防实例整体过载）。

令牌桶用 Redis Lua 原子脚本实现，接口超限返回 429（业务码保持统一 Result 结构）。

### 3.2 解析幂等与互斥

新增解析锁组件 `ResumeParseLockService`（Redis key: `lock:resume:parse:{resumeId}`）：

1. 入队前尝试加锁。
2. 已有运行中锁则拒绝重复解析请求（或直接忽略重复触发，保持幂等）。
3. 解析消费者最终 `finally` 释放锁。

并在 `parse_task` 层补“当前运行任务”查询语义，避免仅靠最新任务状态判断。

### 3.3 解析与匹配解耦

新增 topic：`resume-match-trigger`。

- `ResumeParseMQConsumer`：只负责解析、落库、通知、发布 `resume-parsed` 与 `resume-match-trigger`。
- 新增 `ResumeMatchTriggerMQConsumer`：专门处理默认简历的全职位匹配。

收益：解析吞吐更稳定，匹配重计算不阻塞解析消费。

### 3.4 上传任务化异步接口

新增数据表 `upload_task`（migration + schema 同步）：

核心字段：

- `id`
- `user_id`
- `file_name`
- `file_type`
- `file_size`
- `storage_key`
- `status`（PENDING/UPLOADING/UPLOADED/PARSE_PENDING/PARSE_RUNNING/SUCCESS/FAILED）
- `error_msg`
- `resume_id`
- `create_time/update_time/finish_time`

新增接口：

1. `POST /resume/my/upload-async`：
   - 接收 multipart 文件。
   - 落 `upload_task=PENDING`，把文件流上传到 RustFS（后台消费，见下）。
   - 立即返回 `taskId`（202语义）。
2. `GET /resume/upload-task/{taskId}`：
   - 返回任务状态、错误信息、关联 `resumeId`。

实现路径：

- 新增 topic `resume-upload-async`。
- `upload-async` 接口只落任务并发消息。
- 新增 `ResumeUploadAsyncMQConsumer`：
  - 消费任务 -> RustFS上传 -> 创建resume与parse_task -> 发 `resume-parse`。

说明：为保证重启后可恢复，任务状态完全落库；未来可扩展“失败重试管理”。

### 3.5 MQ 并发参数配置化

新增配置前缀 `app.mq.*`：

- `app.mq.resume-parse.consume-thread-number`
- `app.mq.resume-parse.consume-thread-max`
- `app.mq.resume-match.consume-thread-number`
- `app.mq.resume-match.consume-thread-max`
- `app.mq.resume-upload.consume-thread-number`
- `app.mq.resume-upload.consume-thread-max`

消费者实现 `RocketMQPushConsumerLifecycleListener`，在 `prepareStart` 中设置线程参数（避免注解常量限制）。

### 3.6 RustFS S3 客户端优化

在 `RustFSConfig` 增加可配置参数：

- `max-connections`
- `connection-acquire-timeout`
- `connection-time-to-live`
- `expect-continue-enabled`

并统一 `apiCallTimeout` / `apiCallAttemptTimeout` / socket timeout 配置化。

## 4. 数据库与模型变更

### 4.1 新增 upload_task 表

- 新增 migration: `V2026_05_08_031__add_upload_task_for_async_resume.sql`
- 更新 `backend/src/main/resources/db/schema.sql`

### 4.2 解析任务查询增强

为 `parse_task` 增加组合索引优化：

- `(task_type, source_id, status, id desc)`

并在仓储补 `findRunningByResumeId`/`existsRunningByResumeId` 语义接口。

## 5. 接口与兼容性

1. 原 `/resume/my/upload` 保持可用（同步上传）。
2. 新增 `/resume/my/upload-async` 与 `/resume/upload-task/{taskId}`。
3. 原进度接口 `/resume/{id}/progress` 保持不变。
4. 未来前端可渐进切换：先走异步上传，再复用原有解析进度页。

## 6. 错误处理

1. 限流失败：返回 429 + 明确错误文案（稍后重试）。
2. 解析锁冲突：返回 409 或业务 400（文案“该简历正在解析，请勿重复触发”）。
3. 异步上传任务失败：写入 `upload_task.error_msg`，查询接口可见。
4. 消费异常：任务标记 FAILED，避免消息无限静默失败。

## 7. 测试策略

### 7.1 单元测试

1. 限流服务（令牌发放、拒绝、边界时间窗）。
2. 解析锁服务（加锁成功、重复锁失败、释放）。
3. `ResumeAppService`：
   - 同步上传路径保留。
   - 异步任务创建路径。
   - 重复解析触发被拦截。
4. 新 MQ 消费者：
   - 解析与匹配解耦行为。
   - 异步上传任务状态流转。

### 7.2 集成测试

1. `/resume/my/upload-async` 返回 taskId。
2. `/resume/upload-task/{taskId}` 状态可查询。
3. 触发重复解析只会进入一次有效执行。
4. 聊天图片/头像接口限流返回 429。

## 8. 风险与回滚

1. **风险**：异步上传引入新任务状态机，若状态映射不完整会出现“卡住任务”。
   - 缓解：所有状态迁移点统一封装，异常路径强制 FAILED。
2. **风险**：限流阈值过小影响正常业务。
   - 缓解：初始阈值保守放宽，按压测回调。
3. **回滚策略**：
   - 关闭异步入口路由（保留同步路径）。
   - 关闭新消费者配置。
   - 限流组件支持开关（`app.upload.rate-limit.enabled=false`）。

## 9. 实施顺序

1. 先做限流 + 解析锁 + 解析匹配解耦（低风险高收益）。
2. 再做 MQ 并发配置化和 RustFS 客户端连接池参数化。
3. 最后做异步上传任务表、接口和消费者。

该顺序保证每一步都可独立发布，不要求一次性切换全部流量。
