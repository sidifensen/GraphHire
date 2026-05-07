# Acceptance Criteria: Backend Security And Performance Hardening

**Spec:** `docs/superpowers/specs/2026-05-07-094716-backend-security-performance-hardening-design.md`
**Date:** 2026-05-07
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | Non-admin user cannot create skill tag via `POST /skill-tags`. | API | Logged-in PERSON token exists. | Response `code` is `403`; no new skill_tag row created. |
| AC-002 | Non-admin user cannot update or delete skill tag write endpoints. | API | Logged-in COMPANY/PERSON token; target skill tag exists. | Response `code` is `403` for PUT/DELETE/synonym write APIs. |
| AC-003 | Admin user can still use skill-tag write endpoints successfully. | API | Logged-in ADMIN token; valid payload. | Response `code` is `200`; data changes persisted. |
| AC-004 | `/resume/list` returns only current user resumes. | API | At least two users have resumes. | PERSON token sees only own `userId` records; no foreign records in result page. |
| AC-005 | `/resume/list` does not expose parseResult content in list responses. | API | Resume with parseResult exists for current user. | Each list record parseResult is null/absent in response payload. |
| AC-006 | `/match/{matchId}/detail` denies unauthorized owner access. | API | Match record exists for other user/company. | Unauthorized caller gets `403` and no detail data. |
| AC-007 | `/match/resume/{resumeId}/list` is scoped to caller ownership rules. | API | Multiple users with resumes and match records exist. | PERSON can access only own resumeId list; foreign resumeId gets `403`. |
| AC-008 | `/match/job/{jobId}/list` is scoped to company ownership rules. | API | Multiple companies with jobs and match records exist. | COMPANY caller can access only own company jobs; foreign jobId gets `403`. |
| AC-009 | Chat image upload rejects oversized files before service accepts data. | API | Logged-in chat participant token; multipart file > configured max. | Response `code` is `400`; no chat image message persisted. |
| AC-010 | Chat image upload rejects disallowed MIME or extension. | API | Logged-in chat participant token; malformed image file metadata. | Response `code` is `400`; no chat image message persisted. |
| AC-011 | WebSocket handshake does not accept query-parameter token authentication. | Logic | Handshake interceptor receives request without satoken header but with `?token=`. | `beforeHandshake` returns `false`. |
| AC-012 | WebSocket handshake accepts header token flow as before. | Logic | Handshake interceptor receives valid satoken header. | `beforeHandshake` returns `true` and sets `chatUserId`. |
| AC-013 | Global CORS uses configured allowed-origins list instead of wildcard. | Logic | WebConfig loaded with configured origins list. | CORS registry contains configured origins; no `*` wildcard origin. |
| AC-014 | Match resume-trigger flow uses published-job query path without `findAll` filtering. | Logic | MatchAppService invoked for resume trigger. | JobRepository `findPublished()` is called; `findAll()` is not called. |
| AC-015 | Match list/detail response assembly avoids per-record repeated repository lookups. | Logic | MatchAppService list API called with multiple records. | Batch retrieval methods are used; repeated point lookup count does not grow linearly with list size. |
| AC-016 | Resume repository insert path no longer calls `syncResumeIdSequence()` on each save. | Logic | Save new Resume domain object with null id. | Insert succeeds and sequence sync mapper method is never invoked in save path. |
| AC-017 | SaToken role check uses session userType when available. | Logic | Session contains userType attribute and guarded route requested. | Role validation passes/fails based on session userType without mandatory userRepository DB lookup. |
| AC-018 | SaToken role check falls back safely when session userType missing. | Logic | Session userType missing and guarded route requested. | Role check still enforced correctly via repository fallback behavior. |
| AC-019 | RustFS bucket existence check runs once and is cached for subsequent uploads. | Logic | Same RustFSClient instance executes multiple upload calls. | `headBucket`/bucket ensure path executes once; subsequent upload skips repeated bucket existence probe. |
| AC-020 | Backend build and tests pass after hardening changes. | Logic | Code changes complete. | `mvn compile` exits 0 and `mvn test` exits 0. |
