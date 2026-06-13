# Init Seed Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 清理 `init.sql` 中非初始化数据，按当前数据库重新导出关键基础数据，并彻底移除已废弃的 `favorite` 收藏功能残留。简历、简历解析任务和匹配记录属于用户上传/运行态数据，禁止进入初始化脚本。

**Architecture:** 数据库基线以 `schema.sql` + `migration` 保持一致，`init.sql` 从当前 `graphhire` 库导出基础数据：行业、职位类型、职位技能画像、技能标签、用户、公司、公司员工、个人资料和职位。前端同步移除收藏统计空壳，避免 UI 展示不可用功能。

**Tech Stack:** PostgreSQL SQL seed/migration, Spring Boot + JUnit static SQL tests, Next.js/TypeScript.

---

### Task 1: SQL seed and obsolete favorite guard

**Files:**
- Create: `backend/src/test/java/com/graphhire/job/infrastructure/persistence/InitSeedSqlTest.java`
- Modify: `backend/src/main/resources/db/init.sql`
- Modify: `backend/src/main/resources/db/schema.sql`
- Create: `backend/src/main/resources/db/migration/V2026_06_12_034__drop_obsolete_favorite_table.sql`

- [x] **Step 1: Write failing static SQL test**

Create a JUnit test that reads SQL resources and asserts:
- `init.sql` contains current static seeds for `industry`, `position_type`, and `position_type_skill_profile`.
- `init.sql` no longer seeds `notification`, `chat_conversation`, `chat_message`, `chat_message_resume`, or `chat_message_interview_invite`.
- `schema.sql` no longer defines the obsolete `favorite` table.
- a migration exists to drop `favorite`.

Run: `cd backend && mvn -Dtest=InitSeedSqlTest test`
Expected: FAIL before implementation because key `position_type` seed/profile seed and drop migration are missing from `init.sql`/migration.

- [x] **Step 2: Update database SQL files**

Update `init.sql` to:
- use current `industry` columns (`id`, `name`, `enabled`, `sort`, `parent_id`, `level`, timestamps, `deleted`);
- include the current DB's full `position_type` and `position_type_skill_profile` data;
- include current DB seed data for `skill_tag`, `sys_user`, `company`, `company_staff`, `person_info`, `resume`, `job`, and `match_record`;
- preserve `owner_user_id`, numeric `education`, `position_type_id`, arrays, JSONB, and timestamps from the current database;
- remove notification/chat sample inserts and their sequence resets.
- remove resume and match_record sample inserts plus their sequence resets, because they can contain uploaded personal data and matching derivatives.

Update `schema.sql` to remove any `favorite` table/index remnants if present.

Add migration:

```sql
-- favorite 收藏功能没有后端读写实现，清理历史残表避免新环境误以为功能可用。
DROP TABLE IF EXISTS favorite;
```

- [x] **Step 3: Verify SQL static test passes**

Run: `cd backend && mvn -Dtest=InitSeedSqlTest test`
Expected: PASS.

### Task 2: Frontend favorite shell removal

**Files:**
- Modify: `frontend/src/lib/api/person.ts`
- Modify: `frontend/src/app/(user)/profile/page.tsx`

- [x] **Step 1: Remove frontend favorite API/types**

Remove `FavoriteJob`, `Favorite`, and `personApi.getFavorites()` because no backend implementation exists and the table is being dropped.

- [x] **Step 2: Remove profile favorite statistic**

Update profile stats to only track conversation and unread counts. Remove the "收藏" count UI block and `favoriteCount` state updates.

- [x] **Step 3: Type-check/build verification**

Run: `cd frontend && npm run build`
Expected: PASS.

### Task 3: Final verification and commit

**Files:**
- All changed files from Task 1 and Task 2.

- [x] **Step 1: Backend verification**

Run: `cd backend && mvn -Dtest=InitSeedSqlTest test`
Expected: PASS.

Run: `cd backend && mvn compile`
Expected: PASS.

- [x] **Step 2: Frontend verification**

Run: `cd frontend && npm run build`
Expected: PASS.

- [x] **Step 3: DBX verification**

Use DBX to confirm current database has `favorite` as obsolete zero-row table before migration and that `position_type` / `position_type_skill_profile` key rows used in seed exist in current production-like data.

- [x] **Step 4: Commit**

```bash
git add backend/src/main/resources/db/init.sql backend/src/main/resources/db/schema.sql backend/src/main/resources/db/migration/V2026_06_12_034__drop_obsolete_favorite_table.sql backend/src/test/java/com/graphhire/job/infrastructure/persistence/InitSeedSqlTest.java frontend/src/lib/api/person.ts "frontend/src/app/(user)/profile/page.tsx" docs/superpowers/plans/2026-06-12-232900-init-seed-cleanup.md
git commit -m "chore: 清理初始化数据和收藏残留"
```

**Verification notes:**
- `mvn compile` passed.
- `mvn test` passed: 384 tests, 0 failures.
- `npm run build` passed.
- `npm run test:run -- user-profile-auth-info user-profile-links user-workbench-layout-consistency` passed: 6 tests, 0 failures.
- `npm run test:run` still has 2 unrelated existing failures in `user-job-detail-page.test.tsx` and `user-resume-manage-page.test.tsx`.
- DBX confirmed the regenerated seed row counts and `favorite_exists = false`.
- JDBC transaction validation executed `init.sql` successfully and rolled back.

**Privacy remediation addendum:**
- Removed `resume` and `match_record` seed blocks from `init.sql`.
- Removed resume/match_record sequence reset statements from `init.sql`.
- Replaced leaked resume-derived personal values in `sys_user` / `person_info` seed with demo placeholders.
- DBX cleanup removed local `resume` rows, resume parse tasks, and `match_record` rows.
