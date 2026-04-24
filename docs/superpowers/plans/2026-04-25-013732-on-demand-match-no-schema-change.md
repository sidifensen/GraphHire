# 按需匹配改造计划（无表结构变更）

## 目标
- 上传简历后仅完成解析入库，不触发全量职位深度匹配。
- 岗位列表不触发深度匹配。
- 用户点击岗位时按需计算匹配，并复用已有 match_record 结果。
- 不新增数据库字段。

## 方案
1. 调整匹配触发策略
- 将 MatchAppService.triggerMatch 改为“先查缓存（match_record），未命中再计算并保存”。
- 这样复用已有 esume_id + job_id 的匹配结果，避免重复消耗 AI 额度。

2. 失效策略（无新增字段）
- 新增仓储能力：按 esume_id、job_id 批量删除匹配记录。
- 简历重新解析成功时，清理该简历历史匹配记录。
- 职位发布/更新时，清理该职位历史匹配记录。

3. MQ 行为调整
- ResumeParsedListener：由“全量匹配所有岗位”改为“仅清理该简历旧匹配”。
- JobPublishedListener：由“全量匹配所有简历”改为“仅清理该岗位旧匹配”。

4. 接口保持兼容并补充按需入口
- 保留 /match/trigger。
- 新增 /match/on-demand 复用同一逻辑，便于前端语义接入。

## 实施步骤
1. 扩展 MatchRecordMapper/Repository：增加 deleteByResumeId/deleteByJobId。
2. 更新 MatchAppService：实现“先查后算”；新增清理方法；停用全量计算逻辑。
3. 更新 MatchMQConsumer：改为调用清理方法，不再触发全量计算。
4. 更新 MatchController：新增 POST /match/on-demand。
5. 运行后端编译验证并记录结果。

## 风险与回滚
- 风险：历史推荐通知数量会下降（不再全量自动生成）。
- 回滚：恢复 MatchMQConsumer 两个 listener 到原逻辑即可。
