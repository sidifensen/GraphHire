# 任务计划：Resume MQ 并发闸门（RPermitExpirableSemaphore）

- 时间：2026-05-08-235926
- 目标：在简历异步上传与解析消费者中引入 Redis 分布式并发闸门，降低高并发下的资源争抢与级联阻塞风险。

## 范围

- backend/src/main/java/com/graphhire/resume/infrastructure/mq/ResumeUploadAsyncMQConsumer.java
- backend/src/main/java/com/graphhire/resume/infrastructure/mq/ResumeParseMQConsumer.java
- backend/src/main/java/com/graphhire/config/（新增 Redisson 配置）
- backend/src/main/resources/application.yml（新增 semaphore 配置）
- backend/src/test/java/com/graphhire/resume/infrastructure/mq/*（消费者单测补充）

## 实施步骤

1. 基线检查与依赖补齐
- 引入 Redisson 依赖，新增 RedissonClient Bean。
- 配置读取复用现有 spring.data.redis 信息，避免双配置漂移。

2. TDD：先补失败测试
- 上传消费者：拿不到 permit 时应抛出可识别异常；成功路径应释放 permit。
- 解析消费者：拿不到 permit 时应快速失败；成功/失败路径都要释放 permit。

3. 生产代码改造
- 在两个消费者 onMessage 开头执行 tryAcquire；拿不到直接 fail-fast。
- 使用 permitId 做 finally release，保证异常路径不泄露并发额度。
- 补齐注释：业务意图、边界条件、lease time 约束。

4. 配置化
- 新增 app.concurrent.resume-upload / resume-parse 的 semaphore 名称、permits、lease-seconds、wait-seconds。
- 保持默认值保守可用，不改变原有 consumeThread 配置语义。

5. 验证
- 最小改动面执行 backend: mvn test（至少覆盖 resume mq 相关单测）。
- 如时间允许执行 mvn compile。

6. 收尾
- 更新 RELEASE-NOTES.md。
- 按 AGENTS.md 规范执行 git add + git commit（中文前缀）。
