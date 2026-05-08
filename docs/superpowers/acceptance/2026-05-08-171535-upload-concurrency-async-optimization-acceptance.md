# Acceptance Criteria: 上传并发与异步链路优化

**Spec:** `docs/superpowers/specs/2026-05-08-171535-upload-concurrency-async-optimization-design.md`  
**Date:** 2026-05-08  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 简历同步上传接口在通过限流配额时可继续执行上传并返回成功结果 | API | 用户登录；`/resume/my/upload` 请求文件合法且未超限 | 返回 `code=200` 且 `data.id` 为数值型简历ID |
| AC-002 | 简历同步上传接口在用户级限流命中时应被拒绝 | API | 用户登录；短时间内连续触发超过 `app.upload.rate-limit.resume.user-burst` 次上传 | 返回 `code=429`，错误文案包含“上传过于频繁” |
| AC-003 | 聊天图片上传接口在全局限流命中时应被拒绝 | API | 多并发请求触发 `/chat/messages/image`，超过配置的全局桶容量 | 返回 `code=429`，不创建新聊天图片消息 |
| AC-004 | 同一简历重复触发解析时，第二次请求应被幂等拦截 | Logic | 对同一 `resumeId` 连续调用解析触发逻辑，首次已持有解析锁 | 第二次触发抛出业务异常（或返回幂等拒绝），不会新增第二条有效运行解析任务 |
| AC-005 | 解析消费者执行完成后必须释放解析锁 | Logic | 构造成功解析与失败解析两条路径执行 `ResumeParseMQConsumer` | 两种路径执行结束后解析锁都被释放（后续可再次获取） |
| AC-006 | 解析成功后“全职位匹配”应由独立匹配触发消费者处理，而不是在解析消费者内直接执行 | Logic | 默认简历解析成功，`refreshAllMatches=true` | 解析消费者仅发送匹配触发消息；`MatchAppService.triggerMatchForResume` 在匹配触发消费者中被调用 |
| AC-007 | 新增异步上传接口可立即返回任务ID而不阻塞前端等待解析结束 | API | 用户登录；调用 `POST /resume/my/upload-async` 上传合法文件 | 返回 `code=200` 且 `data.taskId` 为数值型；响应不依赖解析完成 |
| AC-008 | 异步上传任务查询接口可返回任务状态与关联简历ID | API | 已存在上传任务（PENDING/UPLOADING/SUCCESS/FAILED 任一状态） | `GET /resume/upload-task/{taskId}` 返回任务状态字段，成功任务返回 `resumeId` |
| AC-009 | 异步上传任务消费者在上传成功后应创建 resume + parse_task 并发送解析消息 | Logic | 任务状态为 PENDING；文件元数据与存储引用可用 | 任务流转至 `PARSE_PENDING`（或后续状态），创建简历与解析任务记录，并发送 `resume-parse` 消息 |
| AC-010 | 异步上传任务消费者在上传或建档异常时应写入失败状态和错误信息 | Logic | 模拟 RustFS 上传异常或DB写入异常 | `upload_task.status=FAILED` 且 `error_msg` 非空 |
| AC-011 | RocketMQ 解析消费者并发参数支持配置化并可在消费者启动时生效 | Logic | 配置 `app.mq.resume-parse.consume-thread-number` / `consume-thread-max` | 消费者启动后实际线程参数与配置一致 |
| AC-012 | RustFS S3 客户端连接池参数支持配置化并正确注入 | Logic | 配置 `rustfs.http.max-connections` 等参数并启动上下文 | `S3Client` 构建不报错，读取到配置值并用于HTTP客户端构建 |
| AC-013 | 数据库迁移脚本与 schema.sql 均包含 upload_task 表结构与必要索引 | Logic | 查看 migration 与 schema 文件 | migration 新增 `upload_task` 建表SQL；`schema.sql` 同步包含相同核心字段和索引 |
| AC-014 | parse_task 结构增强（索引/查询语义）后不破坏现有任务监控查询 | Logic | 运行现有 `ParseTaskRepositoryImplTest` 与 Admin 任务列表相关测试 | 原有任务分页、状态统计测试继续通过 |
| AC-015 | 保持历史接口兼容：`/resume/my/upload`、`/resume/{id}/progress`、头像和聊天图片上传接口返回结构不变 | API | 执行现有相关 Controller/IT 测试 | 既有测试通过，新增限流仅在超限场景触发行为变化 |
