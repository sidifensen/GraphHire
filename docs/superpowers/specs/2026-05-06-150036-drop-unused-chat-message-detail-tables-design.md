# 聊天冗余消息详情表清理设计

## 背景与目标

当前聊天消息扩展字段已统一存放在 `chat_message.ext`，`chat_message_image`、`chat_message_resume`、`chat_message_interview_invite` 三张详情表长期为空且无读写路径。目标是在不改变现有聊天行为的前提下，移除这三张冗余表及对应无用代码，降低维护成本。

## 设计方案

1. 数据库层：
   - 新增迁移脚本删除三张冗余详情表。
   - 同步更新 `backend/src/main/resources/db/schema.sql`，移除三张表的基线定义，保持基线与迁移一致。
2. 后端代码层：
   - 删除仅用于映射冗余表且未被业务使用的 PO 类：
     - `ChatMessageImagePO`
     - `ChatMessageResumePO`
     - `ChatMessageInterviewInvitePO`
3. 测试层：
   - 扩展 `ChatSchemaIT`，断言上述三张表不存在，确保后续不会被误回引入。

## 影响面与兼容性

- 聊天发送与展示逻辑不受影响，现有流程全部依赖 `chat_message` 主表与 `ext` 字段。
- 迁移脚本使用 `DROP TABLE IF EXISTS`，对已不存在表的环境可幂等执行。

## 验证策略

- 后端编译：`mvn compile`
- 后端测试：`mvn test`
- 关键回归：`ChatSchemaIT` 必须通过并验证三表已删除。
