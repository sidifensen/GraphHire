# Backend Security And Performance Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close identified backend security vulnerabilities and implement agreed performance optimizations without changing requested business behavior.

**Architecture:** Introduce explicit ownership-aware service methods for resume and match flows, tighten input and transport boundaries (upload/CORS/WS), and shift hot-path queries to cheaper repository methods. Keep existing controller/service layering, but pass authenticated user context into sensitive application services.

**Tech Stack:** Spring Boot 3, Sa-Token, MyBatis-Plus, JUnit5, MockMvc, Mockito

---

### Task 1: Add failing tests for skill-tag write authorization

**Files:**
- Modify: `backend/src/test/java/com/graphhire/skill/interfaces/controller/it/SkillTagControllerIT.java`

- [ ] **Step 1: Write failing IT assertions for non-admin write attempts**

```java
@Test
@DisplayName("10 - 非管理员创建技能标签应被拒绝")
void createSkillTag_ForbiddenForNonAdmin() throws Exception {
    String json = "{\"name\":\"forbidden_tag\",\"category\":\"技术技能\",\"description\":\"x\"}";
    mockMvc.perform(post("/skill-tags")
            .headers(personHeaders)
            .contentType(MediaType.APPLICATION_JSON)
            .content(json))
        .andExpect(jsonPath("$.code").value(403));
}
```

- [ ] **Step 2: Run targeted test and verify RED**

Run: `mvn -Dtest=SkillTagControllerIT#createSkillTag_ForbiddenForNonAdmin test`
Expected: FAIL (currently returns 200)

- [ ] **Step 3: Implement minimal authorization guard for write endpoints**

```java
private void ensureAdmin() {
    Long userId = StpUtil.getLoginIdAsLong();
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new Exceptions.UnauthorizedException("登录用户不存在"));
    if (user.getUserType() != UserType.ADMIN) {
        throw new Exceptions.ForbiddenException("无权访问该资源");
    }
}
```

- [ ] **Step 4: Re-run target test and verify GREEN**

Run: `mvn -Dtest=SkillTagControllerIT test`
Expected: PASS

### Task 2: Add failing tests for `/resume/list` ownership scope and response minimization

**Files:**
- Modify: `backend/src/test/java/com/graphhire/resume/interfaces/controller/it/ResumeControllerIT.java`
- Modify: `backend/src/test/java/com/graphhire/resume/interfaces/controller/ResumeControllerTest.java`

- [ ] **Step 1: Add RED integration test for cross-user visibility**

```java
mockMvc.perform(get("/resume/list").headers(personHeaders))
  .andExpect(jsonPath("$.data.records[*].userId", everyItem(is(personUserId.intValue()))));
```

- [ ] **Step 2: Run targeted test and verify RED**

Run: `mvn -Dtest=ResumeControllerIT test`
Expected: FAIL (currently may include foreign rows)

- [ ] **Step 3: Implement scoped service API and remove parseResult from list VO mapping**

```java
public PageResult<ResumeVO> getList(Long userId, int page, int size) {
    IPage<Resume> pageResult = resumeRepository.findPageByUserId(userId, page, size);
    ...
    vo.setParseResult(null);
}
```

- [ ] **Step 4: Re-run tests and verify GREEN**

Run: `mvn -Dtest=ResumeControllerIT,ResumeControllerTest test`
Expected: PASS

### Task 3: Add failing tests for match ownership controls

**Files:**
- Modify: `backend/src/test/java/com/graphhire/match/interfaces/controller/it/MatchControllerIT.java`
- Modify: `backend/src/test/java/com/graphhire/match/application/service/MatchAppServiceTest.java`
- Modify: `backend/src/test/java/com/graphhire/controllerIT/ChatControllerIT.java` (if fixture IDs need updates)

- [ ] **Step 1: Add RED tests for unauthorized match detail/list access**

```java
mockMvc.perform(get("/match/{matchId}/detail", foreignMatchId).headers(personHeaders))
  .andExpect(jsonPath("$.code").value(403));
```

- [ ] **Step 2: Run targeted tests and verify RED**

Run: `mvn -Dtest=MatchControllerIT,MatchAppServiceTest test`
Expected: FAIL (currently allows broader access)

- [ ] **Step 3: Implement ownership-aware MatchAppService methods and controller context passing**

```java
public MatchDetailResponse getMatchDetailForCurrentUser(Long currentUserId, UserType userType, Long matchId) { ... }
public List<MatchDetailResponse> getMatchListForResumeCurrentUser(Long currentUserId, UserType userType, Long resumeId) { ... }
public List<MatchDetailResponse> getMatchListForJobCurrentUser(Long currentUserId, UserType userType, Long jobId) { ... }
```

- [ ] **Step 4: Re-run target tests and verify GREEN**

Run: `mvn -Dtest=MatchControllerIT,MatchAppServiceTest test`
Expected: PASS

### Task 4: Add failing tests for chat image upload hardening

**Files:**
- Modify: `backend/src/test/java/com/graphhire/controllerIT/ChatControllerIT.java`
- Modify: `backend/src/test/java/com/graphhire/chat/application/service/ChatAppServiceTest.java`
- Modify: `backend/src/main/java/com/graphhire/config/UploadProperties.java`
- Modify: `backend/src/main/resources/application.yml`

- [ ] **Step 1: Add RED tests for oversized/disallowed image uploads**

```java
MockMultipartFile bad = new MockMultipartFile("file", "x.txt", "text/plain", "bad".getBytes());
mockMvc.perform(multipart("/chat/messages/image").file(bad).param("conversationId", "3").header("satoken", personToken))
  .andExpect(jsonPath("$.code").value(400));
```

- [ ] **Step 2: Run targeted tests and verify RED**

Run: `mvn -Dtest=ChatControllerIT test`
Expected: FAIL

- [ ] **Step 3: Implement controller validation using new `app.upload.chat-image` config**

```java
if (file.getSize() > uploadProperties.getChatImage().getMaxFileSize().toBytes()) { ... }
if (!allowedMime.contains(contentType) || !allowedExt.contains(ext)) { ... }
```

- [ ] **Step 4: Re-run tests and verify GREEN**

Run: `mvn -Dtest=ChatControllerIT,ChatAppServiceTest test`
Expected: PASS

### Task 5: Add failing tests for WS/CORS security boundaries

**Files:**
- Modify: `backend/src/test/java/com/graphhire/chat/interfaces/ws/ChatHandshakeInterceptorTest.java` (create)
- Modify: `backend/src/test/java/com/graphhire/config/WebConfigTest.java` (create)
- Modify: `backend/src/main/java/com/graphhire/chat/interfaces/ws/ChatHandshakeInterceptor.java`
- Modify: `backend/src/main/java/com/graphhire/chat/interfaces/ws/ChatWebSocketConfig.java`
- Modify: `backend/src/main/java/com/graphhire/config/WebConfig.java`
- Modify: `backend/src/main/resources/application.yml`

- [ ] **Step 1: Add RED test: query token handshake rejected**

```java
assertFalse(interceptor.beforeHandshake(reqWithQueryTokenOnly, resp, handler, attrs));
```

- [ ] **Step 2: Add RED test: configured origins used, not wildcard**

```java
assertThat(configuredOrigins).contains("http://localhost:8888");
assertThat(configuredOrigins).doesNotContain("*");
```

- [ ] **Step 3: Run targeted tests and verify RED**

Run: `mvn -Dtest=ChatHandshakeInterceptorTest,WebConfigTest test`
Expected: FAIL

- [ ] **Step 4: Implement origin properties + remove query token fallback**

```java
String token = servletRequest.getServletRequest().getHeader("satoken");
if (token == null || token.isBlank()) { return false; }
```

- [ ] **Step 5: Re-run tests and verify GREEN**

Run: `mvn -Dtest=ChatHandshakeInterceptorTest,WebConfigTest test`
Expected: PASS

### Task 6: Add failing tests for performance hot-path optimizations

**Files:**
- Modify: `backend/src/test/java/com/graphhire/match/application/service/MatchAppServiceTest.java`
- Modify: `backend/src/test/java/com/graphhire/resume/infrastructure/persistence/repository/ResumeRepositoryImplTest.java`
- Modify: `backend/src/test/java/com/graphhire/resume/infrastructure/file/RustFSClientTest.java`
- Modify: `backend/src/test/java/com/graphhire/auth/interfaces/controller/it/RoleGuardIT.java` or dedicated unit test for SaTokenConfig
- Modify: `backend/src/main/java/com/graphhire/job/domain/repository/JobRepository.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/JobRepositoryImpl.java`
- Modify: `backend/src/main/java/com/graphhire/match/application/service/MatchAppService.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/ResumeRepositoryImpl.java`
- Modify: `backend/src/main/java/com/graphhire/config/SaTokenConfig.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/file/RustFSClient.java`

- [ ] **Step 1: Add RED test expecting `findPublished()` usage**

```java
verify(jobRepository).findPublished();
verify(jobRepository, never()).findAll();
```

- [ ] **Step 2: Add RED test for no per-insert sequence sync**

```java
verify(resumeMapper, never()).syncResumeIdSequence();
```

- [ ] **Step 3: Add RED test for bucket-check cache behavior**

```java
verify(s3Client, times(1)).headBucket(any(HeadBucketRequest.class));
```

- [ ] **Step 4: Run targeted tests and verify RED**

Run: `mvn -Dtest=MatchAppServiceTest,ResumeRepositoryImplTest,RustFSClientTest test`
Expected: FAIL

- [ ] **Step 5: Implement minimal code to satisfy tests**

```java
private volatile boolean bucketEnsured = false;
if (!bucketEnsured) { ensureBucketExistsInternal(); bucketEnsured = true; }
```

- [ ] **Step 6: Re-run tests and verify GREEN**

Run: `mvn -Dtest=MatchAppServiceTest,ResumeRepositoryImplTest,RustFSClientTest test`
Expected: PASS

### Task 7: Full verification and documentation update

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: Run full backend compile**

Run: `mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 2: Run full backend tests**

Run: `mvn test`
Expected: BUILD SUCCESS, all tests pass

- [ ] **Step 3: Update release notes**

```markdown
- fix: 后端安全与性能加固（skill-tag写权限收紧、resume/match所有权校验、WS/CORS白名单、聊天图片上传校验、匹配与存储热路径优化）
```

- [ ] **Step 4: Prepare commit**

Run:
- `git add docs/superpowers/specs/2026-05-07-094716-backend-security-performance-hardening-design.md`
- `git add docs/superpowers/acceptance/2026-05-07-094716-backend-security-performance-hardening-acceptance.md`
- `git add docs/superpowers/plans/2026-05-07-094716-backend-security-performance-hardening.md`
- `git add backend/src/main backend/src/test RELEASE-NOTES.md`

- [ ] **Step 5: Commit**

```bash
git commit -m "fix: 后端安全与性能加固"
```
