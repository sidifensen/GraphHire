# Backend Security And Performance Hardening Design

## Background
Current backend has multiple security and performance issues: unauthorized writable skill-tag endpoints, resume/match data exposure risks, weak boundary checks in match flows, permissive WebSocket/CORS settings, unsafe chat image upload memory usage, and several hot-path inefficiencies.

## Scope
Included:
- Security hardening for authz/data ownership on resume/match/skill-tag/chat boundaries
- Input-surface hardening for chat image upload + WebSocket + CORS
- Performance optimizations for match queries, role lookup, RustFS bucket checks, resume sequence sync path

Excluded (per user instruction):
- Log content / logging policy changes

## Goals
1. Keep regular user flows available, but force “self-owned data only” semantics.
2. Restrict admin-only operations explicitly.
3. Reduce obvious high-frequency DB/storage overhead in request path.
4. Keep API compatibility where possible; if behavior changes, make it deterministic and test-covered.

## Design

### 1) Authorization Boundary Hardening

#### 1.1 Skill tags
- Keep read endpoints and normalize endpoint public/accessible as before.
- Restrict write endpoints to admin user only:
  - POST /skill-tags
  - PUT /skill-tags/{id}
  - DELETE /skill-tags/{id}
  - POST /skill-tags/{id}/synonyms
  - DELETE /skill-tags/{id}/synonyms/{synonym}

Implementation strategy:
- Keep SaToken base login checks.
- In SkillTagController write methods, assert current user type == ADMIN (via StpUtil + UserRepository), throw Forbidden when not admin.

#### 1.2 Resume list ownership
- Change /resume/list semantics from “global page” to “current user page”.
- ResumeAppService getList API changed to require userId.
- Query path must filter by user_id.
- Response must avoid exposing parseResult for this list endpoint (summary list only).

#### 1.3 Match ownership enforcement
- All /match endpoints must operate within current user ownership constraints.
- Trigger endpoints:
  - Person can only trigger with own resume + published job.
  - Company can only trigger for jobs owned by current company and resumes in allowed matching context.
- Read endpoints:
  - /match/{matchId}/detail: verify current user is owner side of the record.
  - /match/resume/{resumeId}/list: person only for self resumes; company only if authorized by company jobs relation.
  - /match/job/{jobId}/list: company only for own company jobs.

Implementation strategy:
- Controller passes currentUserId and currentUserType into MatchAppService.
- Add ownership-checked methods in MatchAppService; keep existing methods for internal flows only.

### 2) Input Surface Hardening

#### 2.1 Chat image upload safety
- Add dedicated upload config block for chat images:
  - max-file-size
  - allowed-extensions
  - allowed-mime-types
- Validate both extension and MIME in controller.
- Reject over-limit before reading bytes.
- Keep current RustFS byte[] upload interface for now, but only after strict size cap to control heap impact.

#### 2.2 WebSocket security
- Remove query parameter token fallback for WS handshake; header token only.
- Replace WS allowed origins wildcard with configurable whitelist:
  - app.security.websocket.allowed-origins

#### 2.3 Global CORS security
- Replace allowedOrigins("*") with configured whitelist:
  - app.security.cors.allowed-origins
- Preserve methods/headers policy.

### 3) Performance Optimizations

#### 3.1 Match query and list performance
- Add repository method findPublished() in JobRepository to avoid findAll + in-memory filter.
- In match list/detail assembly, reduce repeated point lookups by preloading needed resumes/jobs/personInfos in batch using IN queries where practical.

#### 3.2 Resume insert hot path
- Remove per-insert syncResumeIdSequence() call from ResumeRepositoryImpl.save.
- Keep normal insert using DB sequence.

#### 3.3 Role lookup in SaTokenConfig
- Role check for /admin and /company path:
  - First read userType from session attribute (already written during login).
  - Fallback to DB only if missing or inconsistent.
- This removes repetitive DB query on every guarded request.

#### 3.4 RustFS bucket existence check
- Cache bucket-ready status in RustFSClient instance.
- ensureBucketExists() runs at most once per process (or until explicit failure reset), reducing repeated headBucket requests.

## Error Handling
- Authorization failures return 403 via existing ForbiddenException path.
- Ownership mismatch uses deterministic error messages aligned with existing business exception style.
- Upload validation failures return 400 with existing error contract pattern.

## Compatibility
- /resume/list behavior changes intentionally to current-user scoped data.
- /match endpoints reject previously tolerated cross-user access.
- WS clients passing token in URL must migrate to satoken header.
- CORS/WS origins now need explicit config for each environment.

## Testing Strategy
- Unit tests:
  - SkillTag admin-only write guards
  - Resume list scoped query + parseResult omission
  - Match ownership checks across PERSON/COMPANY roles
  - Chat image upload type/size validation
  - SaTokenConfig session userType fast-path
  - RustFSClient bucket ensure cache behavior
- Integration tests:
  - Non-owner access to match/resume list returns 403 or constrained data
  - WS handshake rejects query token flow
  - Allowed origin behavior for CORS/WS via config
- Build checks:
  - mvn compile
  - mvn test

## Rollout Notes
- Update test resources application.yml with secure default origins suitable for IT execution.
- Add release note entry summarizing security + perf hardening.
