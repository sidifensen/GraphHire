# 后端 API 测试与修复计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** 启动后端服务，测试所有 REST API 接口，发现并修复问题

**Architecture:** 基于 Spring Boot 的 REST API 测试，使用 curl/httpie 或浏览器 DevTools 手动测试关键接口

**Tech Stack:** Spring Boot, Sa-Token, PostgreSQL, Redis

---

## API 清单汇总

| Controller | 接口数 | 路径前缀 |
|------------|--------|----------|
| AuthController | 9 | /auth |
| PasswordController | 2 | /auth |
| ResumeController | 7 | /resume |
| PersonController | 5 | /person |
| CompanyController | 22 | /company |
| MatchController | 4 | /match |
| SkillTagController | 12 | /skill-tags |
| NotificationController | 10 | /notifications |
| AdminController | 15 | /admin |
| PublicJobController | 2 | /public/jobs |
| PersonApplicationController | 6 | /person |
| BatchOperationController | - | /admin/batch |
| CategoryController | - | /admin/category |
| CompanyApplicationController | - | /company |
| PersonAvatarController | - | /person/avatar |

---

## 任务分解

### 任务 1: 启动后端服务

**Files:**
- 检查: `backend/pom.xml`
- 检查: `backend/src/main/resources/application.yml`

- [ ] **Step 1: 检查端口占用**

Run: `netstat -ano | findstr :7777`
Expected: 无输出表示端口可用

- [ ] **Step 2: 启动后端**

Run: `cd backend && mvn spring-boot:run`
Expected: 应用启动日志，显示 "Started GraphhireBackendApplication"

- [ ] **Step 3: 验证健康状态**

Run: `curl -s http://localhost:7777/auth/validate`
Expected: `{"code":200,"msg":"success","data":false}` (未登录返回 false)

---

### 任务 2: 测试公开接口 (无需认证)

**Files:**
- 测试: `PublicJobController` - /public/jobs
- 测试: `SkillTagController` - /skill-tags (部分需登录)

- [ ] **Step 1: 测试获取所有技能标签**

Run: `curl -s http://localhost:7777/skill-tags`
Expected: `{"code":200,"msg":"success","data":[...]}`

- [ ] **Step 2: 测试按分类获取技能标签**

Run: `curl -s "http://localhost:7777/skill-tags/category/PROGRAMMING_LANGUAGE"`
Expected: `{"code":200,"msg":"success","data":[...]}`

- [ ] **Step 3: 测试公开职位搜索**

Run: `curl -s "http://localhost:7777/public/jobs?page=1&size=10"`
Expected: `{"code":200,"msg":"success","data":{"list":[...],"total":0,"page":1,"size":10}}`

- [ ] **Step 4: 测试技能标准化**

Run: `curl -s -X POST http://localhost:7777/skill-tags/normalize -H "Content-Type: application/json" -d '["java","Python","React"]'`
Expected: `{"code":200,"msg":"success","data":[...]}`

---

### 任务 3: 测试认证接口

**Files:**
- 测试: `AuthController` - /auth

- [ ] **Step 1: 测试管理员登录**

Run: `curl -s -X POST http://localhost:7777/admin/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'`
Expected: `{"code":200,"msg":"success","data":{"token":"...","userType":"ADMIN"}}`
问题: 可能返回 500 如果 admin 用户不存在

- [ ] **Step 2: 测试个人用户注册**

Run: `curl -s -X POST http://localhost:7777/auth/register/person -H "Content-Type: application/json" -d '{"username":"testuser001","password":"Test1234"}'`
Expected: `{"code":200,"msg":"success","data":{"token":"...","userType":"PERSON"}}`
问题: 可能返回 500 如果用户名已存在

- [ ] **Step 3: 测试用户登录**

Run: `curl -s -X POST http://localhost:7777/auth/login -H "Content-Type: application/json" -d '{"username":"testuser001","password":"Test1234"}'`
Expected: `{"code":200,"msg":"success","data":{"token":"...","userType":"PERSON"}}`

- [ ] **Step 4: 测试获取当前用户**

使用上一步返回的 token:
Run: `curl -s http://localhost:7777/auth/current -H "satoken: <token>"`
Expected: `{"code":200,"msg":"success","data":<userId>}`

- [ ] **Step 5: 测试 Token 校验**

Run: `curl -s http://localhost:7777/auth/validate -H "satoken: <token>"`
Expected: `{"code":200,"msg":"success","data":true}`

- [ ] **Step 6: 测试登出**

Run: `curl -s -X POST http://localhost:7777/auth/logout -H "satoken: <token>"`
Expected: `{"code":200,"msg":"success"}`

---

### 任务 4: 测试个人用户接口 (需认证)

**Files:**
- 测试: `PersonController` - /person
- 测试: `ResumeController` - /resume
- 测试: `PersonApplicationController` - /person

前置条件: 需要先登录获取 token

- [ ] **Step 1: 测试获取个人信息**

Run: `curl -s http://localhost:7777/person/info -H "satoken: <token>"`
Expected: `{"code":200,"msg":"success","data":{...}}`
问题: 可能返回错误 "个人信息不存在"

- [ ] **Step 2: 测试更新个人信息**

Run: `curl -s -X PUT http://localhost:7777/person/info -H "Content-Type: application/json" -H "satoken: <token>" -d '{"realName":"张三","city":"北京","education":"本科"}'`
Expected: `{"code":200,"msg":"success"}`

- [ ] **Step 3: 测试获取个人能力图谱**

Run: `curl -s http://localhost:7777/person/graph -H "satoken: <token>"`
Expected: `{"code":200,"msg":"success","data":{...}}`
问题: 可能返回 500 如果图谱不存在

- [ ] **Step 4: 测试获取推荐职位**

Run: `curl -s http://localhost:7777/person/recommend/jobs -H "satoken: <token>"`
Expected: `{"code":200,"msg":"success","data":[...]}`

- [ ] **Step 5: 测试我的投递列表**

Run: `curl -s http://localhost:7777/person/applications -H "satoken: <token>"`
Expected: `{"code":200,"msg":"success","data":[...]}`

- [ ] **Step 6: 测试我的收藏列表**

Run: `curl -s http://localhost:7777/person/favorites -H "satoken: <token>"`
Expected: `{"code":200,"msg":"success","data":[...]}`

---

### 任务 5: 测试简历接口 (需认证)

**Files:**
- 测试: `ResumeController` - /resume

- [ ] **Step 1: 测试获取我的简历列表**

Run: `curl -s http://localhost:7777/resume/my -H "satoken: <token>"`
Expected: `{"code":200,"msg":"success","data":[...]}`

- [ ] **Step 2: 测试简历上传**

创建测试文件:
Run: `echo "Test Resume Content" > /tmp/test_resume.pdf`
Run: `curl -s -X POST http://localhost:7777/resume/my/upload -H "satoken: <token>" -F "file=@/tmp/test_resume.pdf"`
Expected: `{"code":200,"msg":"success","data":{"id":...}}`
问题: 可能返回 500 如果文件处理失败

- [ ] **Step 3: 测试简历列表 (管理员/公开)**

Run: `curl -s "http://localhost:7777/resume/list?page=1&size=10"`
Expected: `{"code":200,"msg":"success","data":{"list":[...],"total":...}}`

---

### 任务 6: 测试企业管理接口 (需认证)

**Files:**
- 测试: `CompanyController` - /company

前置条件: 需要企业用户登录

- [ ] **Step 1: 测试获取公司信息**

Run: `curl -s http://localhost:7777/company/info -H "satoken: <companyToken>"`
Expected: `{"code":200,"msg":"success","data":{...}}`
问题: 可能返回错误 "非企业用户"

- [ ] **Step 2: 测试获取职位列表**

Run: `curl -s http://localhost:7777/company/job/list -H "satoken: <companyToken>"`
Expected: `{"code":200,"msg":"success","data":[...]}`

- [ ] **Step 3: 测试获取企业推荐简历**

Run: `curl -s http://localhost:7777/company/recommend/resumes -H "satoken: <companyToken>"`
Expected: `{"code":200,"msg":"success","data":[...]}`

---

### 任务 7: 测试匹配接口 (需认证)

**Files:**
- 测试: `MatchController` - /match

- [ ] **Step 1: 测试触发匹配**

Run: `curl -s -X POST http://localhost:7777/match/trigger -H "Content-Type: application/json" -H "satoken: <token>" -d '{"resumeId":1,"jobId":1}'`
Expected: `{"code":200,"msg":"success","data":{...}}`
问题: 可能返回 500 如果 resumeId/jobId 不存在

- [ ] **Step 2: 测试获取简历匹配列表**

Run: `curl -s http://localhost:7777/match/resume/1/list -H "satoken: <token>"`
Expected: `{"code":200,"msg":"success","data":[...]}`

- [ ] **Step 3: 测试获取职位匹配列表**

Run: `curl -s http://localhost:7777/match/job/1/list -H "satoken: <token>"`
Expected: `{"code":200,"msg":"success","data":[...]}`

---

### 任务 8: 测试管理员接口 (需 admin token)

**Files:**
- 测试: `AdminController` - /admin

- [ ] **Step 1: 测试获取仪表盘统计**

Run: `curl -s http://localhost:7777/admin/dashboard/stats -H "satoken: <adminToken>"`
Expected: `{"code":200,"msg":"success","data":{"userCount":...,"jobCount":...,"resumeCount":...}}`

- [ ] **Step 2: 测试获取用户列表**

Run: `curl -s -X POST http://localhost:7777/admin/user/list -H "Content-Type: application/json" -H "satoken: <adminToken>" -d '{"page":1,"size":10}'`
Expected: `{"code":200,"msg":"success","data":[...]}`

- [ ] **Step 3: 测试获取简历列表**

Run: `curl -s "http://localhost:7777/admin/resume/list?page=1&size=10" -H "satoken: <adminToken>"`
Expected: `{"code":200,"msg":"success","data":{"list":[...],"total":...}}`

- [ ] **Step 4: 测试获取职位列表**

Run: `curl -s "http://localhost:7777/admin/job/list?page=1&size=10" -H "satoken: <adminToken>"`
Expected: `{"code":200,"msg":"success","data":{"list":[...],"total":...}}`

- [ ] **Step 5: 测试获取待审批公司列表**

Run: `curl -s http://localhost:7777/admin/company/pending -H "satoken: <adminToken>"`
Expected: `{"code":200,"msg":"success","data":[...]}`

- [ ] **Step 6: 测试获取技能标签列表**

Run: `curl -s http://localhost:7777/admin/skill/list -H "satoken: <adminToken>"`
Expected: `{"code":200,"msg":"success","data":[...]}`

---

### 任务 9: 测试通知接口 (需认证)

**Files:**
- 测试: `NotificationController` - /notifications

- [ ] **Step 1: 测试获取用户通知**

Run: `curl -s http://localhost:7777/notifications/user/1 -H "satoken: <token>"`
Expected: `{"code":200,"msg":"success","data":[...]}`

- [ ] **Step 2: 测试获取未读通知数**

Run: `curl -s http://localhost:7777/notifications/user/1/unread-count -H "satoken: <token>"`
Expected: `{"code":200,"msg":"success","data":0}`

- [ ] **Step 3: 测试标记通知为已读**

Run: `curl -s -X PUT http://localhost:7777/notifications/1/read -H "satoken: <token>"`
Expected: `{"code":200,"msg":"success"}`

---

### 任务 10: 问题汇总与修复

**Files:**
- 问题记录文件: `backend/TEST_REPORT.md`

- [ ] **Step 1: 汇总所有发现的错误**

记录每个接口的错误类型:
- 认证类错误 (401/403)
- 业务逻辑错误 (500)
- 数据不存在错误 (404)
- 参数校验错误 (400)

- [ ] **Step 2: 分析根因**

对于每个 500 错误:
- 检查日志输出
- 确认数据库表是否存在
- 确认必要数据是否初始化

- [ ] **Step 3: 修复问题**

根据发现的问题:
- 如果是数据缺失 → 初始化测试数据
- 如果是代码 bug → 修复代码
- 如果是配置问题 → 修复配置

- [ ] **Step 4: 回归测试**

重新测试之前失败的接口，确认修复有效

---

## 预期问题与解决方案

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| admin 登录失败 | admin 用户不存在 | 创建初始 admin 用户或允许自动创建 |
| 个人信息不存在 | person_info 表无记录 | 修改代码自动创建空记录 |
| 能力图谱返回 500 | 图谱数据未构建 | 返回空图谱而非报错 |
| 简历上传失败 | 文件解析服务未启动 | 跳过文件解析，返回基本信息 |
| 企业用户返回"非企业用户" | company_staff 表无记录 | 完善注册流程自动创建 |

---

## 执行策略

1. **串行执行**: 任务 1 (启动) → 任务 2-9 (分组测试)
2. **分组并行**: 使用子代理并行测试不同 Controller
3. **修复优先**: 发现问题立即修复，避免积累
