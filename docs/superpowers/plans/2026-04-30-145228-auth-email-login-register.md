# 登录注册页样式替换与邮箱认证统一 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户端新页面登录/注册样式替换到主站认证页，并完成邮箱登录注册语义统一、后端联调与自动填充测试账号。  
**Architecture:** 保留现有 `/login` 与 `/register` 路由及认证 API，前端仅替换 UI 结构并补足交互测试；后端仅收敛 `LoginRequest` 为邮箱语义校验。通过前后端单测、编译构建与 CDP 验证完成闭环。  
**Tech Stack:** Next.js 16 + React 19 + Tailwind + Vitest；Spring Boot + Jakarta Validation + Maven。

---

### Task 1: 登录页样式替换与自动填充

**Files:**
- Modify: `frontend/src/app/login/page.tsx`
- Test: `frontend/src/tests/pages/login.test.tsx`

- [ ] **Step 1: 先写失败测试（RED）**

```ts
// login.test.tsx 中新增/更新断言
// 1) 占位符为“请输入邮箱”
// 2) 角色切换后自动填充两套测试账号
```

- [ ] **Step 2: 运行单测确认失败**

Run: `npm run test:run -- src/tests/pages/login.test.tsx`  
Expected: FAIL（旧页面文案或交互不满足新断言）

- [ ] **Step 3: 实现最小代码使测试通过（GREEN）**

```tsx
// page.tsx
// 迁移 docs 用户端登录页视觉结构
// 表单字段改为 email 语义，保留 login API 和角色分流
// DEV_ACCOUNTS 按角色自动填充
```

- [ ] **Step 4: 再次运行登录页测试**

Run: `npm run test:run -- src/tests/pages/login.test.tsx`  
Expected: PASS

### Task 2: 注册页样式替换与邮箱验证码流程

**Files:**
- Modify: `frontend/src/app/register/page.tsx`
- Add: `frontend/src/tests/pages/register.test.tsx`

- [ ] **Step 1: 先写失败测试（RED）**

```ts
// register.test.tsx
// 1) 默认字段为空（不自动填充）
// 2) 招聘者角色显示企业字段
// 3) 发送验证码调用 sendVerifyCode(email, 'register')
```

- [ ] **Step 2: 运行注册页测试确认失败**

Run: `npm run test:run -- src/tests/pages/register.test.tsx`  
Expected: FAIL（文件不存在或断言不满足）

- [ ] **Step 3: 实现最小代码使测试通过（GREEN）**

```tsx
// page.tsx
// 迁移 docs 用户端注册页视觉结构
// 保留现有后端联调逻辑（person/company register + send verify code）
```

- [ ] **Step 4: 再次运行注册页测试**

Run: `npm run test:run -- src/tests/pages/register.test.tsx`  
Expected: PASS

### Task 3: 后端登录请求邮箱语义校验

**Files:**
- Modify: `backend/src/main/java/com/graphhire/auth/interfaces/dto/request/LoginRequest.java`
- Add: `backend/src/test/java/com/graphhire/auth/interfaces/dto/request/LoginRequestTest.java`

- [ ] **Step 1: 先写失败测试（RED）**

```java
// LoginRequestTest
// 校验空值与非法邮箱触发 violations
```

- [ ] **Step 2: 运行后端单测确认失败**

Run: `mvn -Dtest=LoginRequestTest test`  
Expected: FAIL

- [ ] **Step 3: 修改 DTO 校验注解（GREEN）**

```java
@NotBlank
@Email
private String username;
```

- [ ] **Step 4: 再次运行对应单测**

Run: `mvn -Dtest=LoginRequestTest test`  
Expected: PASS

### Task 4: 全量验证与浏览器验收

**Files:**
- Verify only

- [ ] **Step 1: 前端构建**

Run: `npm run build`  
Expected: PASS

- [ ] **Step 2: 前端测试**

Run: `npm run test:run`  
Expected: PASS

- [ ] **Step 3: 后端编译**

Run: `mvn compile`  
Expected: PASS

- [ ] **Step 4: 后端测试**

Run: `mvn test`  
Expected: PASS

- [ ] **Step 5: CDP 浏览器验证**

```text
打开 /login 与 /register，验证角色切换自动填充、邮箱验证码入口、企业字段显隐。
```

- [ ] **Step 6: 更新 RELEASE-NOTES 并提交**

Run:
```bash
git add <changed-files>
git commit -m "feat: 替换登录注册新样式并统一邮箱认证流程"
```
