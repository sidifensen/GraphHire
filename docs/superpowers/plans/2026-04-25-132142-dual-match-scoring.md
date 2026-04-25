# Dual Match Scoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement dual-track matching (技能匹配 + 岗位要求匹配) and unify frontend display on 综合匹配度。

**Architecture:** `match_record` 精简为三类分值（`skill_score`、`requirement_score`、`overall_score`）+ 基础关联字段。岗位要求匹配由本地规则计算（城市/薪资/学历），综合分由技能分与要求分加权得到。AI 原始返回不入主表。

**Tech Stack:** Spring Boot (Java), Hutool, PostgreSQL, Next.js, JUnit + Vitest.

---

## Confirmed Decisions (Locked)

- 删除 `match_record.is_read(viewed)` 字段。
- 删除 `match_detail` 存储字段（如有独立字段/JSON列）。
- `match_record` 仅保留核心分值：
  - `skill_score`
  - `requirement_score`
  - `overall_score`
- 前端匹配度主展示改为 `overall_score`（综合匹配度）。
- 技能匹配是否 AI：保留 `AI优先 + 本地兜底`，但不保存 AI 原始结果到主业务表。

---

### Task 1: Database Schema Simplification (Migration First)

**Files:**
- Modify/Create: `backend/src/main/resources/db/migration/*_match_record_simplify.sql`
- Modify: `backend/src/main/java/com/graphhire/match/infrastructure/persistence/po/MatchRecordPO.java`
- Modify: `backend/src/main/java/com/graphhire/match/infrastructure/persistence/mapper/MatchRecordMapper.java`
- Modify: `backend/src/main/java/com/graphhire/match/infrastructure/persistence/repository/MatchRecordRepositoryImpl.java`
- Test: `backend/src/test/java/com/graphhire/match/infrastructure/persistence/repository/MatchRecordRepositoryImplTest.java`

- [ ] Step 1: 写失败测试，验证 PO/Mapper 仅映射三类分值与基础字段。
- [ ] Step 2: 执行测试确认失败。
- [ ] Step 3: 编写迁移 SQL：删除 `viewed/is_read`、删除 `match_detail` 列、删除旧分项列（exp/city/edu/sal），新增 `requirement_score`（若不存在）。
- [ ] Step 4: 更新 PO/Mapper/Repository 读写逻辑，仅处理 `skill_score`、`requirement_score`、`overall_score`。
- [ ] Step 5: 复跑测试并通过。

### Task 2: Local Requirement Scoring Engine

**Files:**
- Create: `backend/src/main/resources/geo/cn-province-city.json`
- Create: `backend/src/main/java/com/graphhire/match/domain/service/CityProvinceResolver.java`
- Create: `backend/src/main/java/com/graphhire/match/domain/service/CityMatchScorer.java`
- Create: `backend/src/main/java/com/graphhire/match/domain/service/SalaryMatchScorer.java`
- Create: `backend/src/main/java/com/graphhire/match/domain/service/EducationMatchScorer.java`
- Test: `backend/src/test/java/com/graphhire/match/domain/service/*ScorerTest.java`

- [ ] Step 1: 写失败测试：同城100、同省70、异省30。
- [ ] Step 2: 写失败测试：薪资/学历评分规则。
- [ ] Step 3: 实现本地评分器与标准化。
- [ ] Step 4: 复跑测试并通过。

### Task 3: Dual-Track Aggregation Algorithm

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/domain/service/MatchDomainService.java`
- Modify: `backend/src/main/java/com/graphhire/match/domain/service/MatchGraphServiceImpl.java`
- Modify: `backend/src/main/java/com/graphhire/match/domain/vo/MatchScore.java`
- Modify: `backend/src/main/java/com/graphhire/match/interfaces/vo/GraphMatchVO.java`
- Test: `backend/src/test/java/com/graphhire/match/domain/service/MatchDomainServiceTest.java`

- [ ] Step 1: 写失败测试：`overall_score = w1*skill_score + w2*requirement_score`。
- [ ] Step 2: 实现 `requirement_score = city/salary/education` 加权（建议 0.4/0.3/0.3）。
- [ ] Step 3: 实现综合分（建议 `0.6*skill + 0.4*requirement`）。
- [ ] Step 4: 复跑测试并通过。

### Task 4: API Contract Refactor (Backend + Frontend)

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/interfaces/dto/response/MatchDetailResponse.java`
- Modify: `backend/src/main/java/com/graphhire/match/interfaces/vo/GraphMatchVO.java`
- Modify: `frontend/src/lib/api/match.ts`
- Modify: `frontend/src/lib/api/person.ts`
- Test: `frontend/src/tests/pages/user-job-detail-inline-match.test.tsx`

- [ ] Step 1: 写失败测试，断言前端消费新结构（skill/requirement/overall）。
- [ ] Step 2: 后端响应去除已删除字段，输出三类分值与必要说明。
- [ ] Step 3: 前端 API 类型同步改造。
- [ ] Step 4: 复跑测试并通过。

### Task 5: Frontend Display Strategy Update

**Files:**
- Modify: `frontend/src/app/(user)/jobs/[id]/page.tsx`
- Test: `frontend/src/tests/pages/user-job-detail-inline-match.test.tsx`

- [ ] Step 1: 写失败测试：主卡展示“综合匹配度”。
- [ ] Step 2: 页面展示规则调整：
  - 主展示：`综合匹配度 overall_score`
  - 辅助展示：`技能匹配度 skill_score`、`岗位要求匹配度 requirement_score`
- [ ] Step 3: 移除对废弃字段的依赖。
- [ ] Step 4: 复跑测试并通过。

### Task 6: Full Verification + Browser Validation

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] Step 1: `cd backend && mvn compile && mvn test`
- [ ] Step 2: `cd frontend && npm run build && npm run test:run`
- [ ] Step 3: 使用 `/web-access` + CDP 验证 `/jobs/{id}` 匹配展示（综合/技能/要求）。
- [ ] Step 4: 更新 `RELEASE-NOTES.md` 并提交。

## Discussion Notes for Next Round

- 前端是否仅显示综合分，还是同时展示细分分值（建议：综合为主，细分可展开）。
- `match_reason` 是否继续保留（建议保留，便于解释性）。
- AI 原始结果是否进入调试日志通道（建议仅 debug 开关下采样记录，不入主表）。

### Task 7: Invalidate Match Cache on Default Resume Switch

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/application/service/ResumeAppService.java`
- Modify: `backend/src/main/java/com/graphhire/match/application/service/MatchAppService.java`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/ResumeController.java` (if needed)
- Test: `backend/src/test/java/com/graphhire/resume/application/service/ResumeAppServiceTest.java`
- Test: `backend/src/test/java/com/graphhire/match/application/service/MatchAppServiceTest.java`

- [ ] Step 1: 写失败测试：当用户切换默认简历时，旧默认简历的匹配缓存被清理。
- [ ] Step 2: 写失败测试：切换后触发匹配查询，不再复用旧简历缓存。
- [ ] Step 3: 实现策略：
  - 更新默认简历成功后，调用 `matchAppService.clearMatchCacheForResume(oldDefaultResumeId)`
  - 并清理新默认简历的历史缓存 `clearMatchCacheForResume(newDefaultResumeId)`（防止结构升级后的脏缓存）
- [ ] Step 4: 如需保证一致性，可在默认简历切换事务内完成“默认状态更新 + 缓存清理”。
- [ ] Step 5: 复跑测试并通过。

