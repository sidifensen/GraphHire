# Acceptance Criteria: 默认简历安全重匹配

**Spec:** `docs/superpowers/specs/2026-05-05-183635-default-resume-safe-rematch-design.md`  
**Date:** 2026-05-05  
**Status:** Draft

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 用户在当前无默认简历时上传新简历，新简历会被标记为默认简历 | Logic | 用户简历列表为空或无 `isDefault=true` 记录 | `uploadResume` 保存的简历对象 `isDefault=true` |
| AC-002 | 默认简历解析成功后会触发“该简历对全部已发布职位”的匹配重建 | Logic | 简历解析成功且 `isDefault=true` | `ResumeParseMQConsumer` 调用 `matchAppService.triggerMatchForResume(resumeId)` 一次 |
| AC-003 | 非默认简历解析成功不会触发全职位匹配重建 | Logic | 简历解析成功且 `isDefault=false/null` | `ResumeParseMQConsumer` 不调用 `triggerMatchForResume` |
| AC-004 | 手动设默认后会触发新默认简历全职位重匹配 | Logic | 目标简历属于用户且 `parseStatus=SUCCESS` | `setDefaultResume` 调用 `triggerMatchForResume(newResumeId)` |
| AC-005 | 手动设默认时，旧默认简历匹配记录在新默认匹配流程之后才清理 | Logic | 用户存在旧默认与新默认两份简历 | 发生调用顺序：先 `triggerMatchForResume(new)`，后 `clearOldMatchDataForResume(old)` |
| AC-006 | 默认简历全职位重匹配采用“先生成/更新，再清理过期记录”流程，不再先清空 | Logic | 简历有历史匹配记录，且有已发布职位列表 | `triggerMatchForResume` 不调用 `deleteByResumeId`，而是对已有职位记录走更新、仅删除过期旧记录 |
| AC-007 | 重匹配中途失败时不会进入旧记录清理步骤 | Logic | 第二个职位计算抛出异常 | 不发生任何 `delete(oldRecord)` 清理调用（由事务保证最终不丢旧数据） |
