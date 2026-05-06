# 删除聊天冗余消息详情表 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 删除未使用的聊天消息详情子表并保持数据库基线、迁移脚本、后端代码与测试一致。

**Architecture:** 采用“先测试红灯、再最小实现、再全量验证”的方式。数据库通过新增迁移脚本删除三表，基线同步移除定义，后端删除无用 PO，最后由 schema 回归测试守护。

**Tech Stack:** Spring Boot, Maven, PostgreSQL, Flyway, JUnit5

---

### Task 1: 先建立失败断言（TDD-RED）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/controllerIT/ChatSchemaIT.java`
- Test: `backend/src/test/java/com/graphhire/controllerIT/ChatSchemaIT.java`

- [ ] **Step 1: 在 `shouldContainChatTablesAndOwnerUserIdColumn` 增加三张表不存在断言**
- [ ] **Step 2: 运行 `mvn -Dtest=ChatSchemaIT test` 并确认失败（当前库仍存在三表）**

Run: `mvn -Dtest=ChatSchemaIT test`  
Expected: `ChatSchemaIT` 失败，三表计数为 `1` 而非 `0`。

### Task 2: 最小实现让测试转绿（TDD-GREEN）

**Files:**
- Create: `backend/src/main/resources/db/migration/V2026_05_06_026__drop_unused_chat_message_detail_tables.sql`
- Modify: `backend/src/main/resources/db/schema.sql`
- Delete: `backend/src/main/java/com/graphhire/chat/infrastructure/persistence/po/ChatMessageImagePO.java`
- Delete: `backend/src/main/java/com/graphhire/chat/infrastructure/persistence/po/ChatMessageResumePO.java`
- Delete: `backend/src/main/java/com/graphhire/chat/infrastructure/persistence/po/ChatMessageInterviewInvitePO.java`

- [ ] **Step 1: 新增 Flyway 迁移脚本删除三张表**
- [ ] **Step 2: 从 `schema.sql` 删除三张表定义与注释/索引**
- [ ] **Step 3: 删除三张未使用 PO 类**
- [ ] **Step 4: 再次运行 `mvn -Dtest=ChatSchemaIT test` 确认通过**

Run: `mvn -Dtest=ChatSchemaIT test`  
Expected: `ChatSchemaIT` 全通过。

### Task 3: 完整验证与文档同步

**Files:**
- Modify: `RELEASE-NOTES.md`
- Create: `docs/superpowers/specs/2026-05-06-150036-drop-unused-chat-message-detail-tables-design.md`
- Create: `docs/superpowers/acceptance/2026-05-06-drop-unused-chat-message-detail-tables.md`
- Create: `docs/superpowers/plans/2026-05-06-150036-drop-unused-chat-message-detail-tables.md`

- [ ] **Step 1: 更新 `RELEASE-NOTES.md` 记录删表与代码清理**
- [ ] **Step 2: 运行 `mvn compile`**
- [ ] **Step 3: 运行 `mvn test`**
- [ ] **Step 4: 确认所有变更可提交**

Run: `mvn compile`  
Expected: BUILD SUCCESS

Run: `mvn test`  
Expected: BUILD SUCCESS
