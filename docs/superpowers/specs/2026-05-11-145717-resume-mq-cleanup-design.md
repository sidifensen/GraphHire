# 设计规格：resume mq 链路精简

- 时间：2026-05-11-145717

## 背景

`resume/infrastructure/mq` 中存在两套“简历匹配触发”入口：
- `resume-match-trigger`（`ResumeMatchTriggerMQConsumer`）
- `resume-match-plan`（`ResumeMatchPlanMQConsumer`）

两者均调用 `MatchAppService.executeResumeMatchPlan(resumeId)`，语义重叠导致维护成本上升。
同时 `ResumeMQProducer` 中存在未使用的上传事件发送方法与消息类型定义。

## 目标

1. 匹配触发入口唯一化：统一使用 `resume-match-plan`。
2. 删除死代码：清理 `ResumeMQProducer` 未引用成员。
3. 不改变业务功能：解析成功仍触发匹配计划与图谱构建。

## 方案

1. 删除类
- 删除 `ResumeMatchTriggerMQConsumer`。

2. 解析成功触发 topic 调整
- `ResumeParseMQConsumer` 将匹配触发 topic 从 `resume-match-trigger` 调整为 `resume-match-plan`。

3. 生产者瘦身
- `ResumeMQProducer` 删除：
  - `TOPIC_RESUME_UPLOADED`
  - `sendResumeUploadedEvent(Resume)`
  - `ResumeParseMessage` 内部类
  - 相关无用 import

## 风险与回滚

- 风险：若外部仍有系统发送 `resume-match-trigger`，删除消费者后该 topic 无消费方。
- 控制：当前仓内触发已切到 `resume-match-plan`，并通过全量测试验证。
- 回滚：可快速恢复 `ResumeMatchTriggerMQConsumer` 并回退 topic 常量。
