# Acceptance Criteria: 删除聊天冗余消息详情表

**Spec:** `docs/superpowers/specs/2026-05-06-150036-drop-unused-chat-message-detail-tables-design.md`
**Date:** 2026-05-06
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 执行数据库迁移后，`chat_message_image`、`chat_message_resume`、`chat_message_interview_invite` 三张表被删除 | API | 应用按最新迁移启动并完成 Flyway 执行 | `information_schema.tables` 查询三张表计数均为 `0` |
| AC-002 | `schema.sql` 基线中不再包含三张冗余详情表建表语句 | Logic | 代码已更新到本次变更版本 | `schema.sql` 中检索不到三张表名的 `CREATE TABLE` 定义 |
| AC-003 | 后端代码中不再保留三张冗余详情表的 PO 映射类 | Logic | 代码已更新到本次变更版本 | `backend/src/main/java/com/graphhire/chat/infrastructure/persistence/po/` 下不存在三张 PO 文件 |
| AC-004 | 聊天库结构回归测试通过并覆盖“三表不存在”断言 | Logic | 测试环境数据库可用 | `mvn -Dtest=ChatSchemaIT test` 通过 |
