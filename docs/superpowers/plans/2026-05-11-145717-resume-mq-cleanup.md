# 任务计划：精简 resume/infrastructure/mq 冗余链路

- 时间：2026-05-11-145717
- 目标：删除 resume mq 目录中的重复/死代码，统一匹配触发链路到 `resume-match-plan` / `resume-match-batch`。

## 范围

- backend/src/main/java/com/graphhire/resume/infrastructure/mq/
- backend/src/test/java/com/graphhire/resume/infrastructure/mq/
- RELEASE-NOTES.md

## 实施步骤

1. 冗余识别与基线确认
- 确认 `ResumeMatchTriggerMQConsumer` 与 `ResumeMatchPlanMQConsumer` 功能重复。
- 确认 `ResumeMQProducer` 中 `sendResumeUploadedEvent` 与 `ResumeParseMessage` 未被引用。

2. TDD 先改测试（RED）
- 更新 `ResumeParseMQConsumerTest`：匹配触发 topic 断言由 `resume-match-trigger` 改为 `resume-match-plan`。
- 移除 trigger consumer 相关测试。

3. 生产代码改造（GREEN）
- 删除 `ResumeMatchTriggerMQConsumer`。
- `ResumeParseMQConsumer` 内匹配触发 topic 改为 `resume-match-plan`。
- `ResumeMQProducer` 清理未使用 topic/方法/内部类与无效 import。

4. 注释与可读性
- 保持现有注释风格，关键变更点补充简要说明。

5. 验证
- 后端验证：`mvn compile`、`mvn test`。

6. 收尾
- 更新 `RELEASE-NOTES.md`。
- 执行 `git add + git commit`（中文前缀）。
