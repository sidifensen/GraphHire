# Controller 集成测试设计方案

## 1. 目标

为 GraphHire 后端所有 Controller 接口编写完整的集成测试类，覆盖全部 HTTP 端点，实现：
- **A) 开发调试辅助** — 手动测试接口，验证功能
- **B) 回归测试自动化** — `mvn test` 一键跑所有接口
- **C) API 文档化** — 通过测试代码呈现接口契约

## 2. 技术方案

### 2.1 测试框架

- `@SpringBootTest` + `@AutoConfigureMockMvc` — 完整 Spring 容器启动
- `@Transactional` — 每个测试方法结束后自动回滚，不污染数据库
- Sa-Token 认证 — 通过 HTTP Header `Sat-Token` 传递 token

### 2.2 测试类位置

```
backend/src/test/java/com/graphhire/{module}/interfaces/controller/
```

| 测试类 | 对应 Controller | 依赖 |
|---|---|---|
| AuthControllerTest | AuthController | 无 |
| AdminControllerTest | AdminController | 管理员账号 |
| PersonControllerTest | PersonController | 个人用户 |
| CompanyControllerTest | CompanyController | 企业用户 |
| ResumeControllerTest | ResumeController | Person |
| MatchControllerTest | MatchController | Resume + Job |
| NotificationControllerTest | NotificationController | 相关用户 |
| SkillTagControllerTest | SkillTagController | 无 |

## 3. 基类设计

### 3.1 BaseControllerTest

```java
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public abstract class BaseControllerTest {

    @Autowired
    protected MockMvc mockMvc;

    protected static String personToken;
    protected static String companyToken;
    protected static String adminToken;

    protected HttpHeaders personHeaders;
    protected HttpHeaders companyHeaders;
    protected HttpHeaders adminHeaders;

    @BeforeAll
    static void loginAndGetTokens() {
        // 调用 /auth/login 预置账号，拿到 token 并持有
    }

    @BeforeEach
    void setupHeaders() {
        // 每个请求自动附加 Sat-Token header
    }
}
```

### 3.2 预置测试账号

| 账号类型 | username | password | 用途 |
|---|---|---|---|
| 个人用户 | `test_person@graphhire.com` | `Test123456` | Person/Resume 相关测试 |
| 企业用户 | `test_company@graphhire.com` | `Test123456` | Company/Job 相关测试 |
| 管理员 | `test_admin@graphhire.com` | `Test123456` | Admin 相关测试 |

> 测试类内部处理账号不存在时的情况（可注册后登录）

## 4. 各 Controller 测试方法

### 4.1 AuthControllerTest

- `POST /auth/login` — 登录成功/失败
- `POST /auth/register/person` — 个人注册
- `POST /auth/register/company` — 企业注册
- `POST /auth/admin/login` — 管理员登录
- `POST /auth/send-verify-code` — 发送验证码
- `POST /auth/forgot-password` — 忘记密码
- `POST /auth/logout` — 登出
- `GET /auth/current` — 获取当前用户
- `POST /auth/refresh-token` — 刷新 Token
- `GET /auth/validate` — 校验 Token

### 4.2 AdminControllerTest

- `POST /admin/login` — 管理员登录
- `GET /admin/dashboard/stats` — 仪表盘统计
- `GET /admin/user/list` — 用户列表
- `GET /admin/resume/list` — 简历列表
- `GET /admin/job/list` — 职位列表
- `GET /admin/skill/list` — 技能标签列表
- `GET /admin/task/list` — 任务列表
- `POST /admin/task/{id}/retry` — 重试任务
- `GET /admin/company/auth/list` — 企业认证列表
- `GET /admin/company/pending` — 待审批公司
- `POST /admin/company/{id}/approve` — 审批通过
- `POST /admin/company/{id}/reject` — 审批拒绝
- `PUT /admin/user/{id}/status` — 修改用户状态
- `PUT /admin/company/auth/{id}` — 企业认证授权

### 4.3 PersonControllerTest

- `GET /person/info` — 获取个人信息
- `PUT /person/info` — 更新个人信息
- `GET /person/graph` — 获取能力图谱
- `GET /person/recommend/jobs` — 推荐职位
- `GET /person/match/{jobId}` — 匹配详情

### 4.4 ResumeControllerTest

- `POST /resume/my/upload` — 上传简历
- `GET /resume/my` — 获取我的简历列表
- `GET /resume/{id}/detail` — 简历详情
- `DELETE /resume/{id}` — 删除简历
- `PUT /resume/{id}/default` — 设置默认简历
- `POST /resume/{id}/parse` — 重新解析简历

### 4.5 CompanyControllerTest

- `GET /company/info` — 获取公司信息
- `PUT /company/info` — 更新公司信息
- `POST /company/auth` — 提交认证材料
- `POST /company/job` — 发布职位
- `GET /company/job/list` — 职位列表
- `GET /company/job/{id}` — 职位详情
- `PUT /company/job/{id}` — 更新职位
- `PUT /company/job/{id}/status` — 切换职位状态
- `POST /company/job/{id}/publish` — 发布职位
- `POST /company/job/{id}/close` — 关闭职位
- `PUT /company/job/{id}/salary` — 更新薪资
- `DELETE /company/job/{id}` — 删除职位
- `POST /company/job/{id}/parse` — 重新解析
- `GET /company/job/{id}/graph` — 职位图谱
- `GET /company/match/{resumeId}` — 匹配详情
- `GET /company/recommend/resumes` — 推荐简历
- `POST /company/staff/create` — 创建员工

### 4.6 MatchControllerTest

- `POST /match/trigger` — 触发匹配
- `GET /match/{matchId}/detail` — 匹配详情
- `GET /match/resume/{resumeId}/list` — 简历匹配列表
- `GET /match/job/{jobId}/list` — 职位匹配列表

### 4.7 NotificationControllerTest

- `GET /notifications/{id}` — 获取通知
- `GET /notifications/user/{userId}` — 用户通知列表
- `GET /notifications/user/{userId}/unread` — 未读通知
- `GET /notifications/user/{userId}/type/{type}` — 按类型
- `GET /notifications/user/{userId}/unread-count` — 未读数量
- `PUT /notifications/{id}/read` — 标记已读
- `PUT /notifications/{id}/unread` — 标记未读
- `PUT /notifications/user/{userId}/read-all` — 全部已读
- `DELETE /notifications/{id}` — 删除通知

### 4.8 SkillTagControllerTest

- `POST /skill-tags` — 创建标签
- `GET /skill-tags/{id}` — 获取标签
- `GET /skill-tags/name/{name}` — 按名称查询
- `GET /skill-tags` — 所有标签
- `GET /skill-tags/category/{category}` — 按分类
- `PUT /skill-tags/{id}` — 更新标签
- `POST /skill-tags/{id}/synonyms` — 添加同义词
- `DELETE /skill-tags/{id}/synonyms/{synonym}` — 移除同义词
- `PUT /skill-tags/{id}/category` — 更新分类
- `POST /skill-tags/normalize` — 标准化技能
- `DELETE /skill-tags/{id}` — 删除标签

## 5. 实现顺序

### 第一批
1. BaseControllerTest 基类
2. AuthControllerTest
3. AdminControllerTest

### 第二批
4. SkillTagControllerTest
5. PersonControllerTest
6. CompanyControllerTest

### 第三批
7. ResumeControllerTest
8. MatchControllerTest
9. NotificationControllerTest

## 6. 特殊处理

### 6.1 文件上传测试
`ResumeController.uploadResume` 需要准备测试文件（classpath 下放置一个小的测试 PDF/TXT 文件）

### 6.2 NotificationController 的 userId
userId 通过登录后的 `StpUtil.getLoginIdAsLong()` 动态获取，不是固定值

### 6.3 数据依赖处理
- `@BeforeEach` 中先调用创建接口（如 `PersonControllerTest` 先调用 `POST /person/info` 创建数据）
- 测试方法 `@Transactional` 自动回滚，无需手动清理

## 7. 验收标准

- 所有 8 个 Controller 的所有接口都有对应测试方法
- 每个测试方法至少覆盖：正常成功场景 + 常见异常场景
- `mvn test` 可完整跑通所有测试，无数据库污染
- Token 复用机制正常，所有需认证接口都能拿到正确响应
