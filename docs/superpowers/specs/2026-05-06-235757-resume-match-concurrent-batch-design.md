# 简历匹配并发批量改造设计

**日期：** 2026-05-06  
**状态：** Approved

## 目标

将默认简历触发的全职位匹配从串行改为并发批量执行，满足以下约束：
- 并发度固定为 `4`
- 单职位匹配失败后最多重试 `3` 次
- 重试仍失败则跳过该职位，不影响其余职位
- 必须记录完整重试/跳过日志

## 现状与问题

当前 `MatchAppService.triggerMatchForResume` 对已发布职位逐条串行执行 `matchDomainService.calculateMatch`，并同步落库。单职位匹配链路包含 AI 调用，单次通常 4~7 秒，导致总耗时线性增长。

## 设计方案

### 1) 并发执行模型

- 在 `triggerMatchForResume` 中引入固定线程池，线程数 `4`
- 以职位 ID 为粒度创建异步任务并行执行
- 主线程汇总任务结果后统一执行“删除过期旧记录”逻辑

### 2) 单职位重试策略

- 每个职位任务内部执行最多 3 次尝试
- 前 2 次失败记录 warn 日志并继续重试
- 第 3 次失败记录 error 日志并标记为 skipped
- 失败任务不抛出到外层，避免整体流程中断

### 3) 数据一致性策略

- 成功任务按既有逻辑更新/插入匹配记录（沿用旧记录 ID 与方向）
- 失败任务不改写该职位匹配记录（若已有旧记录则保留）
- 仅删除“不再属于已发布职位集合”的历史记录，避免因单职位失败误删

### 4) 日志策略

新增/强化如下日志：
- 单次失败重试：`resumeId/jobId/attempt/maxAttempts/error`
- 最终跳过：`resumeId/jobId/attempts/error`
- 批量汇总：`publishedCount/successCount/skippedCount/totalCostMs`

## 影响范围

- 代码：`backend/src/main/java/com/graphhire/match/application/service/MatchAppService.java`
- 测试：`backend/src/test/java/com/graphhire/match/application/service/MatchAppServiceTest.java`
- 文档：`RELEASE-NOTES.md`

## 风险与控制

- 风险：并发执行下 mock 交互与重试次数断言易波动
- 控制：测试中仅断言调用次数、保存次数与“不中断”行为，不依赖执行顺序

## 验证策略

后端改动执行：
1. `mvn compile`
2. `mvn test`
