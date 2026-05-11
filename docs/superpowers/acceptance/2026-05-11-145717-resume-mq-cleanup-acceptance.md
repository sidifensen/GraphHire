# 验收标准：resume mq 链路精简

- 时间：2026-05-11-145717

## 功能验收

1. 匹配触发入口统一
- GIVEN 简历解析成功
- WHEN `ResumeParseMQConsumer` 发送匹配触发事件
- THEN 事件 topic 为 `resume-match-plan`。

2. 重复消费者移除
- `ResumeMatchTriggerMQConsumer` 已删除，代码库中不再存在该类。

3. 死代码清理
- `ResumeMQProducer` 中无 `sendResumeUploadedEvent` 方法。
- `ResumeMQProducer` 中无 `ResumeParseMessage` 内部类。

## 测试验收

1. 单测更新通过
- `ResumeParseMQConsumerTest` 中匹配触发 topic 断言更新并通过。

2. 后端全量验证
- `mvn compile` 通过。
- `mvn test` 通过。
