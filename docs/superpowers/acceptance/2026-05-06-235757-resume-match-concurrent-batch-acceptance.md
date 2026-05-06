# Acceptance Criteria: 简历匹配并发批量改造

**Spec:** `docs/superpowers/specs/2026-05-06-235757-resume-match-concurrent-batch-design.md`
**Date:** 2026-05-06
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 默认简历触发全职位匹配时采用并发批量执行，逻辑可同时处理多个已发布职位 | Logic | `jobRepository.findAll()` 返回多个 `PUBLISHED` 职位 | `triggerMatchForResume` 执行后，对每个已发布职位都发起匹配计算并产生对应保存/跳过结果，不因单条失败中断整体流程 |
| AC-002 | 单个职位匹配失败时最多重试 3 次 | Logic | 某 `jobId` 的 `matchDomainService.calculateMatch` 前两次抛异常，第三次成功 | 该 `jobId` 总调用次数为 3，最终成功保存 1 条记录 |
| AC-003 | 单个职位连续失败 3 次后应跳过，不影响其他职位 | Logic | 某 `jobId` 连续 3 次抛异常，其他 `jobId` 正常 | 失败职位不落库；其他职位匹配与落库成功；方法整体不抛异常 |
| AC-004 | 历史记录清理仅删除“非当前已发布职位”记录，不因单条失败误删 | Logic | 现有匹配记录包含已发布职位记录和过期职位记录 | 执行后仅删除过期职位记录；已发布职位对应旧记录在失败时保留 |
| AC-005 | 后端改动面验证通过 | Logic | 完成代码与测试修改 | `mvn compile` 与 `mvn test` 成功通过 |
