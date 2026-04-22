# 用户头像 RustFS 联调 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现用户端头像上传到 RustFS，并在用户端全部头像展示位稳定显示。

**Architecture:** 后端将头像文件存储在 RustFS 并在 DB 存储 `s3://` 路径，新增公开头像读取端点供 `<img>` 访问；个人资料接口返回头像 URL。前端在 profile 页面完成上传并同步更新用户 store，Header/Sidebar 统一从 store 读取头像 URL。

**Tech Stack:** Spring Boot, MyBatis-Plus, Sa-Token, AWS S3 SDK, Next.js, Zustand, Vitest

---

### Task 1: 后端持久化与接口红绿测试

**Files:**
- Modify: `backend/src/test/java/com/graphhire/resume/interfaces/controller/PersonControllerTest.java`
- Create: `backend/src/test/java/com/graphhire/resume/interfaces/controller/PersonAvatarControllerTest.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/po/PersonInfoPO.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/PersonInfoRepositoryImpl.java`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/dto/PersonInfoResponse.java`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonController.java`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonAvatarController.java`
- Modify: `backend/src/main/java/com/graphhire/config/SaTokenConfig.java`

- [ ] Step 1: 先补测试，覆盖头像上传保存与资料返回 avatarUrl
- [ ] Step 2: 运行后端单测确认失败（RED）
- [ ] Step 3: 实现最小后端代码使测试通过（GREEN）
- [ ] Step 4: 运行后端单测确认通过

### Task 2: 前端头像上传与展示红绿测试

**Files:**
- Modify: `frontend/tests/pages/profile.test.tsx`
- Modify: `frontend/tests/components/Header.test.tsx`
- Modify: `frontend/tests/components/Sidebar.test.tsx`
- Modify: `frontend/src/lib/stores/auth-store.ts`
- Modify: `frontend/src/lib/api/person.ts`
- Modify: `frontend/src/app/(user)/profile/page.tsx`
- Modify: `frontend/src/components/Header.tsx`
- Modify: `frontend/src/components/Sidebar.tsx`

- [ ] Step 1: 先补前端测试，覆盖上传行为与头像渲染
- [ ] Step 2: 运行前端测试确认失败（RED）
- [ ] Step 3: 实现最小前端代码使测试通过（GREEN）
- [ ] Step 4: 运行前端测试确认通过

### Task 3: 全量验证与真实联调

**Files:**
- No new code files expected

- [ ] Step 1: 运行 `frontend npm run build` 与 `backend mvn compile`
- [ ] Step 2: 运行 `frontend npm run test:run` 与 `backend mvn test`
- [ ] Step 3: 使用 `/web-access` + CDP 打开用户 profile 页面，上传 `D:\user.jpg`
- [ ] Step 4: 验证 profile/Header/Sidebar 三处头像显示与刷新后持久展示
