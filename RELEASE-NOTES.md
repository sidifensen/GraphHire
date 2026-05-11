# Release Notes

## 2026-05-11

### refactor

- 精简简历 MQ 匹配触发链路：`resume-parse` 消费后直接发送 `resume-match-plan`，移除中转主题 `resume-match-trigger`。
- 删除冗余消费者 `ResumeMatchTriggerMQConsumer` 及对应单元测试，减少一个无业务增益的消费环节。
- 清理 `ResumeMQProducer` 未使用代码：移除 `sendResumeUploadedEvent`、`TOPIC_RESUME_UPLOADED` 与未使用的 `ResumeParseMessage` 内部类。
- 补充 MQ 关键方法与并发链路注释，明确业务意图、关键步骤与参数语义。
