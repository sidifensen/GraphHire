# 验证码发送链路稳定性修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复验证码发送接口阻塞与误判失败问题，优化冷却期重复点击体验。

**Architecture:** 后端接口改为“写入验证码 + 异步发信 + 立即返回”；冷却限流由抛错改为静默成功，仅保留小时限额硬限制；邮件服务移除应用层超时封装，减少误判。

**Tech Stack:** Spring Boot, Redis, JavaMailSender, JUnit5, Mockito

---

### Task 1: 先写失败测试（TDD-RED）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/auth/application/service/AuthAppServiceTest.java`

- [ ] **Step 1: 增加“邮件异常不阻塞主流程”测试**
- [ ] **Step 2: 增加“冷却期重复请求静默成功”测试**
- [ ] **Step 3: 运行 `mvn -q -Dtest=AuthAppServiceTest test` 并确认失败**

### Task 2: 最小实现（TDD-GREEN）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java`
- Modify: `backend/src/main/java/com/graphhire/auth/infrastructure/mail/MailService.java`

- [ ] **Step 1: 将验证码发送改为异步执行，接口立即返回**
- [ ] **Step 2: 冷却期内重复请求改为静默成功**
- [ ] **Step 3: 异步失败时回滚验证码与限流计数**
- [ ] **Step 4: 去掉 MailService 应用层超时包装，使用 JavaMailSender 直发**
- [ ] **Step 5: 运行 `mvn -q -Dtest=AuthAppServiceTest test` 确认通过**

### Task 3: 全量验证与浏览器验收

**Files:**
- Verify only

- [ ] **Step 1: 前端编译 `npm run build`**
- [ ] **Step 2: 前端测试 `npm run test:run`**
- [ ] **Step 3: 后端编译 `mvn compile`**
- [ ] **Step 4: 后端测试 `mvn test`**
- [ ] **Step 5: 使用 CDP 浏览器验证注册页验证码交互**
