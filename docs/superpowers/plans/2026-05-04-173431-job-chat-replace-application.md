# 岗位即时沟通前后端落地 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增用户端与企业端聊天页面（会话列表 + 会话详情），将用户端“立即投递”替换为“立即沟通”并直达会话；支持用户发送简历卡片、企业发送面试邀请卡片；删除投递与人才库链路。

**Architecture:** 使用 PostgreSQL 持久化 `chat_conversation/chat_message/*`，消息发送采用“先落库后分发”，RocketMQ + WebSocket 负责实时通知；会话唯一键为 `(job_id, candidate_user_id)`。岗位负责人由 `job.owner_user_id` 标识，企业侧仅该用户可在对应岗位会话中发送消息。

**Tech Stack:** Spring Boot 3.4、MyBatis-Plus、Sa-Token、RocketMQ、PostgreSQL、Next.js 16、React 19、Vitest

---

### Task 1: 数据库迁移（聊天表 + 旧链路下线）

**Files:**
- Create: `backend/src/main/resources/db/migration/V2026_05_04_024__job_chat_and_drop_application_talent_pool.sql`
- Modify: `backend/src/main/resources/db/schema.sql`
- Create: `backend/src/test/java/com/graphhire/controllerIT/ChatSchemaIT.java`

- [ ] **Step 1: Write the failing DB schema tests**

```java
@Test
void shouldContainChatTablesAndJobOwnerColumn() {
    Integer jobOwnerColumn = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='job' AND column_name='owner_user_id'",
        Integer.class
    );
    Integer conversationTable = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='chat_conversation'",
        Integer.class
    );
    Integer messageTable = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='chat_message'",
        Integer.class
    );
    assertEquals(1, jobOwnerColumn);
    assertEquals(1, conversationTable);
    assertEquals(1, messageTable);
}

@Test
void shouldDropApplicationAndTalentPoolTables() {
    Integer applicationTable = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='application'",
        Integer.class
    );
    Integer talentPoolTable = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='talent_pool'",
        Integer.class
    );
    assertEquals(0, applicationTable);
    assertEquals(0, talentPoolTable);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && mvn -Dtest=ChatSchemaIT test`
Expected: FAIL（聊天表不存在，旧表仍存在）

- [ ] **Step 3: Write migration and baseline schema**

```sql
ALTER TABLE job ADD COLUMN IF NOT EXISTS owner_user_id BIGINT;
COMMENT ON COLUMN job.owner_user_id IS '岗位负责人用户ID';

-- create chat_conversation/chat_message/chat_message_image/chat_message_resume/chat_message_interview_invite
-- 统一字段: create_time/update_time/deleted
-- status/message_type 使用 SMALLINT
-- 所有表和字段添加 COMMENT

DROP TABLE IF EXISTS application;
DROP TABLE IF EXISTS talent_pool;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && mvn -Dtest=ChatSchemaIT test`
Expected: PASS

---

### Task 2: 后端聊天基础能力（会话列表/详情/发消息/已读）

**Files:**
- Create: `backend/src/main/java/com/graphhire/chat/domain/model/ChatConversation.java`
- Create: `backend/src/main/java/com/graphhire/chat/domain/model/ChatMessage.java`
- Create: `backend/src/main/java/com/graphhire/chat/domain/model/ChatMessageType.java`
- Create: `backend/src/main/java/com/graphhire/chat/domain/repository/ChatConversationRepository.java`
- Create: `backend/src/main/java/com/graphhire/chat/domain/repository/ChatMessageRepository.java`
- Create: `backend/src/main/java/com/graphhire/chat/infrastructure/persistence/po/ChatConversationPO.java`
- Create: `backend/src/main/java/com/graphhire/chat/infrastructure/persistence/po/ChatMessagePO.java`
- Create: `backend/src/main/java/com/graphhire/chat/infrastructure/persistence/po/ChatMessageImagePO.java`
- Create: `backend/src/main/java/com/graphhire/chat/infrastructure/persistence/po/ChatMessageResumePO.java`
- Create: `backend/src/main/java/com/graphhire/chat/infrastructure/persistence/po/ChatMessageInterviewInvitePO.java`
- Create: `backend/src/main/java/com/graphhire/chat/infrastructure/persistence/mapper/ChatConversationMapper.java`
- Create: `backend/src/main/java/com/graphhire/chat/infrastructure/persistence/mapper/ChatMessageMapper.java`
- Create: `backend/src/main/java/com/graphhire/chat/infrastructure/persistence/repository/ChatConversationRepositoryImpl.java`
- Create: `backend/src/main/java/com/graphhire/chat/infrastructure/persistence/repository/ChatMessageRepositoryImpl.java`
- Create: `backend/src/main/java/com/graphhire/chat/application/service/ChatAppService.java`
- Create: `backend/src/main/java/com/graphhire/chat/interfaces/controller/ChatController.java`
- Create: `backend/src/test/java/com/graphhire/chat/application/service/ChatAppServiceTest.java`
- Create: `backend/src/test/java/com/graphhire/controllerIT/ChatControllerIT.java`
- Modify: `backend/src/main/java/com/graphhire/job/domain/model/Job.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/po/JobPO.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/JobRepositoryImpl.java`

- [ ] **Step 1: Write failing service tests**

```java
@Test
void shouldCreateOrReuseConversationByJobAndCandidate() {}

@Test
void shouldListCandidateConversationsOrderByUpdateTimeDesc() {}

@Test
void shouldRejectCompanyUserIfNotJobOwnerWhenSending() {}

@Test
void shouldUpdateLastReadMessageCursor() {}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && mvn -Dtest=ChatAppServiceTest,ChatControllerIT test`
Expected: FAIL

- [ ] **Step 3: Implement minimal API set**

```java
// user/company common
GET /chat/conversations
GET /chat/conversations/{conversationId}/messages?beforeMessageId=&pageSize=
POST /chat/conversations/start   // body: { jobId }
POST /chat/messages/text         // body: { conversationId, content }
POST /chat/messages/read         // body: { conversationId, readUpToMessageId }

// user only
POST /chat/messages/resume       // body: { conversationId, resumeId }
POST /chat/messages/image        // multipart: file + conversationId

// company(owner) only
POST /chat/messages/interview-invite // body: { conversationId, interviewTime, location, remark }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && mvn -Dtest=ChatAppServiceTest,ChatControllerIT test`
Expected: PASS

---

### Task 3: RocketMQ + WebSocket 实时通知

**Files:**
- Create: `backend/src/main/java/com/graphhire/chat/interfaces/ws/ChatWebSocketConfig.java`
- Create: `backend/src/main/java/com/graphhire/chat/interfaces/ws/ChatWebSocketHandler.java`
- Create: `backend/src/main/java/com/graphhire/chat/interfaces/ws/ChatHandshakeInterceptor.java`
- Create: `backend/src/main/java/com/graphhire/chat/infrastructure/mq/ChatMQProducer.java`
- Create: `backend/src/main/java/com/graphhire/chat/infrastructure/mq/ChatMQConsumer.java`
- Create: `backend/src/test/java/com/graphhire/controllerIT/ChatRealtimeIT.java`

- [ ] **Step 1: Write failing realtime tests**

```java
@Test
void shouldPersistMessageWhenMqDispatchFailed() {
    // send text with mocked mq failure
    // assert DB has message
}

@Test
void shouldPushReadReceiptToPeer() {
    // mark read then assert peer receives read receipt event
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && mvn -Dtest=ChatRealtimeIT test`
Expected: FAIL

- [ ] **Step 3: Implement store-first dispatch**

```java
Long messageId = chatAppService.sendText(...); // always persist first
try {
    chatMQProducer.sendMessageCreated(messageId, conversationId, receiverUserId);
} catch (Exception ex) {
    log.warn("chat dispatch failed but message persisted: {}", messageId, ex);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && mvn -Dtest=ChatRealtimeIT test`
Expected: PASS

---

### Task 4: 用户端页面（会话列表 + 会话详情 + 职位详情直达）

**Files:**
- Create: `frontend/src/lib/types/chat.ts`
- Create: `frontend/src/lib/api/chat.ts`
- Create: `frontend/src/app/(user)/chat/page.tsx`
- Create: `frontend/src/app/(user)/chat/[conversationId]/page.tsx`
- Modify: `frontend/src/app/(user)/jobs/[id]/page.tsx`
- Modify: `frontend/src/app/(user)/jobs/page.tsx`
- Modify: `frontend/src/app/(user)/_mock/components/Navbar.tsx`
- Create: `frontend/src/tests/pages/user-chat-list-page.test.tsx`
- Create: `frontend/src/tests/pages/user-chat-detail-page.test.tsx`
- Create: `frontend/src/tests/pages/user-job-detail-start-chat.test.tsx`

- [ ] **Step 1: Write failing tests for user flows**

```tsx
it('shows user conversation list page and items', async () => {
  expect(screen.getByText('沟通消息')).toBeInTheDocument();
});

it('clicking 立即沟通 on job detail should start and route to chat detail', async () => {
  // mock chatApi.startConversation => { conversationId: 101 }
  // expect push('/chat/101')
});

it('user can send resume card in chat detail', async () => {
  // click '发送简历' button and submit resume
  // expect chatApi.sendResume called
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:run -- src/tests/pages/user-chat-list-page.test.tsx src/tests/pages/user-chat-detail-page.test.tsx src/tests/pages/user-job-detail-start-chat.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement user chat pages and entry replacement**

```tsx
// /jobs/[id] button text: 立即沟通
// click -> startConversation(jobId) -> router.push(`/chat/${conversationId}`)
// /chat page: list all conversations
// /chat/[conversationId]: history + text/emoji + image upload + resume card send
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:run -- src/tests/pages/user-chat-list-page.test.tsx src/tests/pages/user-chat-detail-page.test.tsx src/tests/pages/user-job-detail-start-chat.test.tsx`
Expected: PASS

---

### Task 5: 企业端页面（会话列表 + 会话详情 + 面试通知发送）

**Files:**
- Create: `frontend/src/app/enterprise/chat/page.tsx`
- Create: `frontend/src/app/enterprise/chat/[conversationId]/page.tsx`
- Modify: `frontend/src/app/enterprise/_mock/components/TopNav.tsx`
- Modify: `frontend/src/app/enterprise/_mock/components/BottomNav.tsx`
- Modify: `frontend/src/lib/api/company.ts`
- Create: `frontend/src/tests/pages/enterprise-chat-list-page.test.tsx`
- Create: `frontend/src/tests/pages/enterprise-chat-detail-page.test.tsx`

- [ ] **Step 1: Write failing tests for enterprise flows**

```tsx
it('shows enterprise conversation list page and unread badge', async () => {
  expect(screen.getByText('沟通列表')).toBeInTheDocument();
});

it('job owner can send interview invite card from chat detail', async () => {
  // fill interviewTime/location/remark and submit
  // expect chatApi.sendInterviewInvite called
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:run -- src/tests/pages/enterprise-chat-list-page.test.tsx src/tests/pages/enterprise-chat-detail-page.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement enterprise chat pages**

```tsx
// /enterprise/chat: list all conversations for current owner
// /enterprise/chat/[conversationId]: history + text/emoji + image + interview invite card send
// 403 from backend show '仅岗位负责人可操作'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:run -- src/tests/pages/enterprise-chat-list-page.test.tsx src/tests/pages/enterprise-chat-detail-page.test.tsx`
Expected: PASS

---

### Task 6: 删除投递/人才库链路与关联前端入口

**Files:**
- Delete: `backend/src/main/java/com/graphhire/application/interfaces/controller/PersonApplicationController.java`
- Delete: `backend/src/main/java/com/graphhire/application/interfaces/controller/CompanyApplicationController.java`
- Delete: `backend/src/main/java/com/graphhire/application/**`
- Delete: `frontend/src/app/(user)/applications/page.tsx`
- Modify: `frontend/src/app/(user)/profile/page.tsx`
- Modify: `frontend/src/app/(user)/_components/UserWorkbenchSidebar.tsx`
- Modify: `frontend/src/components/user/UserSidebar.tsx`
- Modify: `frontend/src/components/layout/UserLayout.tsx`
- Modify: `frontend/src/components/user/UserAuthGuard.tsx`
- Modify: `frontend/src/lib/api/person.ts`
- Modify: `frontend/src/lib/api/resume.ts`
- Delete: `frontend/src/tests/pages/user-applications-page.test.tsx`
- Modify: `frontend/src/tests/components/user-layout-applications-sidebar.test.tsx`
- Modify: `frontend/src/tests/components/user-sidebar-applications-link.test.tsx`
- Modify: `frontend/src/tests/components/user-workbench-sidebar.test.tsx`
- Modify: `frontend/src/tests/pages/user-workbench-layout-consistency.test.tsx`

- [ ] **Step 1: Write failing cleanup tests**

```ts
it('should not render 投递记录 entry in sidebars', () => {
  expect(screen.queryByText('投递记录')).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:run -- src/tests/components/user-workbench-sidebar.test.tsx src/tests/components/user-sidebar-applications-link.test.tsx`
Expected: FAIL

- [ ] **Step 3: Remove old references and adjust profile metrics**

```ts
// profile stats remove application/favorite dependent sections if linked to deleted APIs
// keep unaffected profile data loading
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:run -- src/tests/components/user-workbench-sidebar.test.tsx src/tests/components/user-sidebar-applications-link.test.tsx src/tests/pages/user-profile-links.test.tsx`
Expected: PASS

---

### Task 7: 全量验证、发布记录、提交

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: Run backend compile**

Run: `cd backend && mvn compile`
Expected: PASS

- [ ] **Step 2: Run backend tests**

Run: `cd backend && mvn test`
Expected: PASS

- [ ] **Step 3: Run frontend build**

Run: `cd frontend && npm run build`
Expected: PASS

- [ ] **Step 4: Run frontend tests**

Run: `cd frontend && npm run test:run`
Expected: PASS

- [ ] **Step 5: Update release notes**

```md
- feat: 新增用户端与企业端即时沟通页面（会话列表/会话详情）
- feat: 职位详情“立即沟通”直达会话，支持用户发送简历与企业发送面试通知
- refactor: 删除投递与人才库链路
```

- [ ] **Step 6: Commit**

```bash
git add backend frontend docs/superpowers RELEASE-NOTES.md
git commit -m "feat: 新增双端聊天并替换投递链路"
```

---

### Task 8: 浏览器验收（CDP）

**Files:**
- N/A

- [ ] **Step 1: 用户端验收**

Run: 进入 `/jobs/{id}` 点击“立即沟通” -> 跳转 `/chat/{conversationId}` -> 发送文本/表情/图片/简历卡片。
Expected: 会话实时更新，刷新后历史仍可见。

- [ ] **Step 2: 企业端验收**

Run: 进入 `/enterprise/chat` 打开某会话 -> 发送文本与面试邀请卡片。
Expected: 用户端实时收到，邀请卡片展示完整字段。

- [ ] **Step 3: 权限验收**

Run: 非岗位负责人企业账号在该岗位会话发送消息。
Expected: 返回 403，页面提示“仅岗位负责人可操作”。
