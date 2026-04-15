# GraphHire 后端 DDD 多模块架构设计

Date: 2026-04-15
Status: draft

## 1. 架构概览

采用 Maven 多模块结构，按业务限界上下文拆分为 8 个独立 module：

```
graphhire-backend/
├── pom.xml                          # 父 POM，统一版本管理
├── common/                          # 通用层，所有模块依赖
├── auth/                           # 认证上下文
├── resume/                          # 简历上下文
├── job/                            # 职位上下文
├── match/                          # 匹配上下文
├── skill/                          # 技能标签上下文
├── notification/                   # 通知上下文
├── admin/                          # 管理后台上下文
└── infrastructure/                 # 基础设施模块
```

### 模块依赖关系（依赖方向向上）

```
common/
     ↑
     │
auth ─────────────────────────────────────────────────┐
     ↑                                             │
resume ──────────────────────────────────────────┐  │
     ↑                                             │  match
job ───────────────────────────────────────────┐  │  │
     ↑                                        │  │  │
skill                                          │  │  │
     ↑                                        │  │  │
notification ──────────────────────────────────┘  │  │
     ↑                                              │
admin ──────────────────────────────────────────────┴──┴──
     ↑
infrastructure ←──────────────────────────────── 所有模块依赖它
```

---

## 2. common 设计

**职责**：通用代码，所有模块共享，禁止包含业务逻辑。

```
common/
└── src/main/java/com/graphhire/common/
    ├── model/
    │   ├── BaseEntity.java           # id, createTime, updateTime, deleted
    │   └── BaseAggregateRoot.java     # 聚合根基类，含 registerEvent
    ├── vo/
    │   ├── PageQuery.java            # 分页查询基类
    │   ├── PageResult.java           # 分页结果
    │   ├── Result.java               # 统一响应包装 ApiResponse<T>
    │   └── Exceptions.java           # 通用异常（BusinessException）
    ├── util/                         # 工具类
    │   └── BeanCopyUtil.java
    └── constants/                    # 常量
        └── CommonConstants.java
```

关键原则：
- 不引用任何 domain model
- 不引用任何 infrastructure 组件
- 仅包含最底层的通用类型

---

## 3. auth 设计

**职责**：用户注册、登录、JWT Token、登录锁定。

```
auth/
├── src/main/java/com/graphhire/auth/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── User.java            # 用户聚合根（富血）
│   │   │   └── AuthToken.java       # 认证令牌值对象
│   │   ├── vo/
│   │   │   ├── Username.java        # 用户名值对象（邮箱格式校验）
│   │   │   ├── EncryptedPassword.java # 加密密码值对象
│   │   │   └── UserType.java        # PERSON / COMPANY / ADMIN
│   │   ├── service/
│   │   │   └── PasswordEncoder.java  # BCrypt 密码加密
│   │   ├── event/
│   │   │   ├── UserRegisteredEvent.java
│   │   │   └── UserLoginEvent.java
│   │   └── repository/
│   │       └── UserRepository.java  # 接口，基础设施层实现
│   │
│   ├── application/
│   │   ├── service/
│   │   │   └── AuthAppService.java
│   │   ├── command/
│   │   │   ├── PersonRegisterCmd.java
│   │   │   ├── CompanyRegisterCmd.java
│   │   │   └── SendVerifyCodeCmd.java
│   │   └── query/
│   │       └── TokenValidateQuery.java
│   │
│   ├── infrastructure/
│   │   └── persistence/
│   │       ├── mapper/UserMapper.java
│   │       └── repository/UserRepositoryImpl.java
│   │
│   └── interface/
│       ├── controller/AuthController.java
│       └── dto/request/LoginRequest.java
```

**富血模型示例 - User 聚合根**：
```java
public class User extends BaseAggregateRoot {
    private String username;
    private EncryptedPassword password;
    private UserType userType;
    private AuthStatus status;
    private Integer failedLoginCount;  // 登录失败计数
    private LocalDateTime lockedUntil; // 锁定截止时间

    // 业务方法，禁止外部直接修改状态
    public void loginSuccess() {
        this.failedLoginCount = 0;
        this.lockedUntil = null;
        this.registerEvent(new UserLoginEvent(this));
    }

    public void loginFailed() {
        this.failedLoginCount++;
        if (this.failedLoginCount >= 5) {
            this.lockedUntil = LocalDateTime.now().plusMinutes(15);
            this.registerEvent(new UserLockedEvent(this));
        }
    }

    public boolean isLocked() {
        return lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil);
    }
}
```

---

## 4. resume 设计

**职责**：简历上传、DOC/PDF 解析、PersonInfo 管理、解析任务队列。

```
resume/
├── src/main/java/com/graphhire/resume/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Resume.java           # 简历聚合根
│   │   │   ├── PersonInfo.java     # 个人信息（姓名/城市/学历等）
│   │   │   └── ParseTask.java       # 解析任务实体
│   │   ├── vo/
│   │   │   ├── ParseStatus.java    # 待解析/解析中/成功/失败
│   │   │   ├── WorkExperience.java
│   │   │   └── EducationInfo.java
│   │   ├── service/
│   │   │   └── ResumeDomainService.java # 简历业务逻辑
│   │   ├── event/
│   │   │   ├── ResumeUploadedEvent.java
│   │   │   └── ResumeParsedEvent.java
│   │   └── repository/
│   │       ├── ResumeRepository.java
│   │       └── ParseTaskRepository.java
│   │
│   ├── application/
│   │   ├── service/ResumeAppService.java
│   │   ├── service/ParseAppService.java
│   │   ├── command/
│   │   │   └── UploadResumeCmd.java
│   │   └── query/
│   │       └── ResumeDetailQuery.java
│   │
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── mapper/
│   │   │   │   ├── ResumeMapper.java
│   │   │   │   ├── PersonInfoMapper.java
│   │   │   │   └── ParseTaskMapper.java
│   │   │   └── repository/
│   │   │       └── ResumeRepositoryImpl.java
│   │   ├── file/
│   │   │   └── RustFSClient.java   # 文件存储 S3 兼容
│   │   ├── mq/
│   │   │   └── ResumeMQProducer.java # 发送解析任务到 RocketMQ
│   │   └── ai/
│   │       └── DocumentParser.java  # Tika 文本提取 + LLM 解析
│   │
│   └── interface/
│       ├── controller/ResumeController.java
│       └── dto/request/ResumeUploadRequest.java
```

---

## 5. job 设计

**职责**：企业信息、职位发布/编辑、职位技能要求。

```
job/
├── src/main/java/com/graphhire/job/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Job.java             # 职位聚合根
│   │   │   ├── Company.java        # 企业实体
│   │   │   └── JobSkill.java       # 职位技能关联
│   │   ├── vo/
│   │   │   ├── JobStatus.java     # DRAFT / PUBLISHED / CLOSED
│   │   │   ├── SalaryRange.java    # 薪资范围值对象（min/max/unit）
│   │   │   └── Location.java       # 城市/区县/地址
│   │   ├── service/
│   │   │   └── JobDomainService.java
│   │   ├── event/
│   │   │   └── JobPublishedEvent.java
│   │   └── repository/
│   │       ├── JobRepository.java
│   │       └── CompanyRepository.java
│   │
│   ├── application/
│   │   ├── service/JobAppService.java
│   │   ├── command/PublishJobCmd.java
│   │   └── query/JobListQuery.java
│   │
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── mapper/
│   │   │   │   ├── JobMapper.java
│   │   │   │   └── CompanyMapper.java
│   │   │   └── repository/
│   │   │       └── JobRepositoryImpl.java
│   │   ├── file/
│   │   │   └── RustFSClient.java
│   │   ├── mq/
│   │   │   └── JobMQProducer.java
│   │   └── ai/
│   │       └── JobDocumentParser.java
│   │
│   └── interface/
│       ├── controller/
│       │   ├── JobController.java   # 公开：职位列表/详情
│       │   └── CompanyController.java # 企业内部职位管理
│       └── dto/request/JobPublishRequest.java
```

---

## 6. match 设计

**职责**：双向智能匹配、推荐算法、匹配结果。

```
match/
├── src/main/java/com/graphhire/match/
│   ├── domain/
│   │   ├── model/
│   │   │   └── MatchRecord.java    # 匹配记录聚合根
│   │   ├── vo/
│   │   │   ├── MatchScore.java    # 综合分（0-100）
│   │   │   ├── SkillMatchResult.java
│   │   │   └── MatchLevel.java    # HIGH/MEDIUM/LOW
│   │   ├── service/
│   │   │   ├── MatchDomainService.java      # 核心匹配逻辑
│   │   │   └── SkillNormalizationService.java # 技能归一化
│   │   ├── event/
│   │   │   └── MatchCompletedEvent.java
│   │   └── repository/
│   │       └── MatchRecordRepository.java
│   │
│   ├── application/
│   │   ├── service/MatchAppService.java
│   │   ├── command/TriggerMatchCmd.java
│   │   └── query/MatchDetailQuery.java
│   │
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   └── repository/
│   │   │       └── MatchRecordRepositoryImpl.java
│   │   ├── mq/
│   │   │   └── MatchMQConsumer.java  # 消费解析完成事件触发匹配
│   │   ├── graph/
│   │   │   └── DgraphGraphClient.java # 图数据库查询技能关系
│   │   └── ai/
│   │       ├── DeepSeekClient.java   # 大模型匹配计算
│   │       └── OllamaClient.java     # 本地模型备选
│   │
│   └── interface/
│       ├── controller/MatchController.java
│       └── dto/response/MatchDetailResponse.java
```

**MatchDomainService 核心匹配逻辑**：
```java
@DomainService
public class MatchDomainService {
    // 技能匹配 50% + 经验 20% + 城市 15% + 学历 10% + 薪资 5%
    public MatchScore calculateMatch(Resume resume, Job job) {
        double skillScore = calculateSkillScore(resume, job);     // 50%
        double expScore   = calculateExperienceScore(resume, job); // 20%
        double cityScore  = calculateCityScore(resume, job);        // 15%
        double eduScore  = calculateEducationScore(resume, job);   // 10%
        double salScore  = calculateSalaryScore(resume, job);      // 5%
        return MatchScore.of(skillScore, expScore, cityScore, eduScore, salScore);
    }
}
```

---

## 7. skill 设计

**职责**：技能标签管理、技能归一化映射、技能图谱。

```
skill/
├── src/main/java/com/graphhire/skill/
│   ├── domain/
│   │   ├── model/
│   │   │   └── SkillTag.java       # 技能标签聚合根
│   │   ├── vo/
│   │   │   └── SkillCategory.java  # 技术/软技能/框架/工具
│   │   ├── service/
│   │   │   └── SkillTagDomainService.java
│   │   └── repository/
│   │       └── SkillTagRepository.java
│   │
│   ├── application/
│   │   ├── service/SkillTagAppService.java
│   │   └── command/
│   │       ├── CreateSkillTagCmd.java
│   │       └── UpdateSkillTagCmd.java
│   │
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   └── repository/
│   │   │       └── SkillTagRepositoryImpl.java
│   │   └── graph/
│   │       └── SkillGraphClient.java # 技能图谱查询
│   │
│   └── interface/
│       └── controller/SkillTagController.java
```

---

## 8. notification 设计

**职责**：站内通知、邮件通知、领域事件消费。

```
notification/
├── src/main/java/com/graphhire/notification/
│   ├── domain/
│   │   ├── model/
│   │   │   └── Notification.java
│   │   ├── vo/
│   │   │   └── NotificationType.java
│   │   └── repository/
│   │       └── NotificationRepository.java
│   │
│   ├── application/
│   │   └── service/NotificationAppService.java
│   │
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   └── repository/
│   │   │       └── NotificationRepositoryImpl.java
│   │   └── mq/
│   │       └── NotificationEventSubscriber.java # 订阅各领域事件
│   │
│   └── interface/
│       └── controller/NotificationController.java
```

**事件驱动通知示例**：
```java
// 事件订阅：解析完成 → 通知用户
@EventListener
public void onResumeParsed(ResumeParsedEvent event) {
    notificationService.create(
        event.getResume().getUserId(),
        NotificationType.RESUME_PARSED,
        "您的简历已解析完成"
    );
}
```

---

## 9. admin 设计

**职责**：管理员面板、用户管理、企业认证审核、统计面板。

```
admin/
├── src/main/java/com/graphhire/admin/
│   ├── domain/
│   │   ├── service/
│   │   │   └── AdminDomainService.java
│   │   └── repository/
│   │       └── AdminRepository.java
│   │
│   ├── application/
│   │   └── service/AdminAppService.java
│   │
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   └── mapper/
│   │   │       └── AdminMapper.java
│   │   └── config/
│   │       └── AdminSecurityConfig.java
│   │
│   └── interface/
│       ├── controller/AdminController.java
│       └── dto/response/DashboardStatsResponse.java
```

---

## 10. infrastructure 设计

**职责**：全局基础设施配置，被所有模块依赖实现。

```
infrastructure/
├── src/main/java/com/graphhire/infrastructure/
│   ├── config/
│   │   ├── AppConfig.java          # 主配置
│   │   ├── WebConfig.java
│   │   └── YamlPropertySourceFactory.java
│   ├── database/
│   │   ├── DataSourceConfig.java   # PostgreSQL
│   │   └── RedisConfig.java        # 会话缓存
│   ├── mq/
│   │   └── RocketMQConfig.java    # RocketMQ 全局配置
│   ├── graph/
│   │   └── DgraphConfig.java       # Dgraph 图数据库
│   ├── ai/
│   │   └── AIConfig.java          # DeepSeek / Ollama 配置
│   ├── file/
│   │   └── RustFSConfig.java     # S3 兼容存储
│   └── logging/
│       └── LoggingAspect.java
```

---

## 11. 关键 DDD 模式

### 11.1 聚合根富血模型

所有聚合根（User、Resume、Job、MatchRecord）必须：
- 包含业务行为方法（不允许外部直接修改内部状态）
- 发布领域事件（`registerEvent`）
- 状态变更通过方法而非 setter

### 11.2 依赖倒置

```
Domain Layer 定义 Repository 接口
Infrastructure Layer 实现 Repository 接口
Application Layer 依赖 Domain 接口（不直接依赖实现）
```

### 11.3 领域事件驱动

```
ResumeUploadedEvent → MQ → ParseAppService 消费 → ResumeParsedEvent
                                          ↓
                              NotificationEventSubscriber → 通知用户
                                          ↓
                              MatchMQConsumer → 触发匹配
```

### 11.4 CQRS 读写分离

- Command（写）：通过 AppService → Domain 聚合根
- Query（读）：通过 AppService → Repository 直接查询 DTO

---

## 12. 包依赖规则

| 模块 | 可依赖 |
|------|--------|
| common | 无 |
| auth | common |
| skill | common |
| notification | common |
| resume | common, auth, skill |
| job | common, auth, skill |
| match | common, auth, resume, job, skill |
| admin | common, auth, resume, job |
| infrastructure | common（所有模块 depend on it provided） |

---

## 13. pom.xml 父模块配置

```xml
<project>
    <groupId>com.graphhire</groupId>
    <artifactId>graphhire-backend</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <modules>
        <module>common</module>
        <module>infrastructure</module>
        <module>auth</module>
        <module>skill</module>
        <module>notification</module>
        <module>resume</module>
        <module>job</module>
        <module>match</module>
        <module>admin</module>
    </modules>
</project>
```

---

## 14. 与当前代码的差异

| 项目 | 当前代码 | 设计方案 |
|------|----------|----------|
| 模块结构 | 单模块 flat | 9 个 Maven module |
| Domain Service | 缺失 | 每个 module 有 domain/service |
| 富血模型 | 贫血（getter/setter） | 聚合根含业务方法 |
| 领域事件 | POJO 无实际发布 | 通过 ApplicationEventPublisher |
| Repository | 仅 5 个实现 | 每个 domain repo 都有实现 |
| 基础设施 | 仅有 config | infrastructure/ai/mq/graph/file |
| 接口层 | web/controller | interface/controller |
