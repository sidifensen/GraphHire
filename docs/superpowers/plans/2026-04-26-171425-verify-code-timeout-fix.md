# 验证码超时与中文错误提示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复验证码发送超时误报与英文报错，保证前后端错误提示统一中文。

**Architecture:** 通过后端邮件发送失败捕获+SMTP超时配置缩短阻塞时间，前端统一拦截超时错误并提供中文提示，同时单接口放宽超时时间，避免“后端成功但前端先超时”。

**Tech Stack:** Spring Boot, JavaMailSender, Redis, Next.js, Axios, Vitest

---

### Task 1: 前端错误映射（TDD）

**Files:**
- Modify: `frontend/tests/lib/api/client.test.ts`
- Modify: `frontend/src/lib/api/client.ts`

- [ ] Step 1: 新增 timeout 中文映射失败测试
- [ ] Step 2: 运行单测确认失败
- [ ] Step 3: 实现 timeout 错误映射
- [ ] Step 4: 运行单测确认通过

### Task 2: 前端发送验证码接口超时策略（TDD）

**Files:**
- Modify: `frontend/tests/lib/api/auth.test.ts`
- Modify: `frontend/src/lib/api/auth.ts`

- [ ] Step 1: 新增 sendVerifyCode 使用 60000ms 超时失败测试
- [ ] Step 2: 运行单测确认失败
- [ ] Step 3: 实现接口级超时
- [ ] Step 4: 运行单测确认通过

### Task 3: 后端邮件失败中文化与保护（TDD）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/auth/application/service/AuthAppServiceTest.java`
- Modify: `backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java`

- [ ] Step 1: 新增邮件发送失败抛中文业务异常测试
- [ ] Step 2: 运行单测确认失败
- [ ] Step 3: 实现异常捕获与Redis验证码清理
- [ ] Step 4: 运行单测确认通过

### Task 4: 后端SMTP超时配置

**Files:**
- Modify: `backend/src/main/resources/application.yml`

- [ ] Step 1: 增加 SMTP 连接、读、写超时
- [ ] Step 2: 编译验证
