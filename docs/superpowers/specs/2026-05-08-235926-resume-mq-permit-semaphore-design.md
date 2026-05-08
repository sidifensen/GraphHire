# 设计规格：Resume MQ 并发闸门（RPermitExpirableSemaphore）

- 时间：2026-05-08-235926
- 目标：在上传与解析 MQ 消费链路引入 Redis 分布式可过期信号量，限制同类任务并发，防止高峰时资源争抢导致雪崩。

## 背景问题

当前简历上传与解析消费者在高并发下会同时占用对象存储、OCR、AI 调用、数据库连接等资源，容易出现：
- 消费线程堆满但外部依赖吞吐不足；
- 下游超时和重试放大，导致链路抖动；
- 部分实例异常退出后并发额度无法及时回收（传统本地信号量无法跨实例）。

## 设计目标

1. 分布式限并发：多个实例共享同一并发上限。
2. 异常可恢复：worker 崩溃后 permit 可自动过期回收。
3. 最小侵入：不改变现有业务状态机与消息协议。
4. 可配置：按 topic 分别配置 permit 数、等待时长、租约时长。

## 非目标

- 不在本次改造中重构上传消息体（Base64 大消息问题另行治理）。
- 不改动 RocketMQ topic 与消费组模型。

## 方案

### 1) Redisson 客户端配置

新增 `RedissonConfig`：
- 读取 `spring.data.redis`（host/port/password/database/timeout）初始化 `RedissonClient`。
- 使用单节点配置与当前 Redis 部署保持一致。

### 2) 消费端并发闸门

在以下消费者 `onMessage` 顶部加入 `RPermitExpirableSemaphore`：
- `ResumeUploadAsyncMQConsumer`
- `ResumeParseMQConsumer`

流程：
1. 读取配置并初始化 permit 总量（幂等设置）。
2. `tryAcquire(wait, lease)` 获取 permitId。
3. 获取失败时快速失败，交给消息重试机制。
4. `finally` 中按 permitId `release`，确保成功/失败路径均释放。

### 3) 配置项

新增：
- `app.concurrent.resume-upload.*`
- `app.concurrent.resume-parse.*`

字段：
- `semaphore-name`
- `max-permits`
- `acquire-wait-seconds`
- `lease-seconds`

## 风险与约束

1. `lease-seconds` 过短会导致超发并发。
- 约束：默认值要覆盖 P99 耗时（解析默认 10 分钟，上传默认 3 分钟）。

2. `trySetPermits` 语义：首次初始化生效，后续不覆盖。
- 约束：变更 permit 总量需运维侧明确重置 semaphore 或发版迁移处理。

3. 未拿到 permit 会触发重试。
- 约束：依赖 RocketMQ 重试与死信策略，避免无限积压。

## 验收要点（摘要）

- 上传/解析消费者均存在 permit 获取与 finally 释放。
- permit 获取失败时任务快速失败且不会进入核心业务逻辑。
- 配置缺省值可直接启动，不影响现有功能。
- 单测覆盖成功路径释放、失败路径释放、获取失败路径。
