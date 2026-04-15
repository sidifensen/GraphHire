# GraphHire 后端 DDD 多模块重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 GraphHire 后端从单模块 flat 结构重构为 9 个 Maven module 的 DDD 多模块架构。

**Architecture:** 按业务限界上下文拆分为 common、auth、resume、job、match、skill、notification、admin、infrastructure 共 9 个 Maven module。每个 module 内部遵循 domain/application/infrastructure/interface 四层 DDD 分层。Domain 层定义 Repository 接口，Infrastructure 层实现，Dependency 方向严格向上。

**Tech Stack:** Maven Multi-Module、Spring Boot 3.x、JDK 21、MyBatis-Plus

---

## 文件结构概览

```
backend/ (现有单模块)
    ↓ 拆分为
backend/
├── pom.xml                          # 父 POM
├── common/pom.xml
├── infrastructure/pom.xml
├── auth/pom.xml
├── skill/pom.xml
├── notification/pom.xml
├── resume/pom.xml
├── job/pom.xml
├── match/pom.xml
└── admin/pom.xml
```

**关键文件变更映射：**

| 现有文件 | 目标位置 |
|----------|----------|
| `domain/model/User.java` | `auth/src/main/java/com/graphhire/auth/domain/model/User.java` |
| `domain/repository/UserRepository.java` | `auth/src/main/java/com/graphhire/auth/domain/repository/UserRepository.java` |
| `domain/service/MatchDomainService.java` (新建) | `match/src/main/java/com/graphhire/match/domain/service/MatchDomainService.java` |
| `web/controller/AuthController.java` | `auth/src/main/java/com/graphhire/auth/interface/controller/AuthController.java` |
| `infrastructure/config/RedisConfig.java` | `infrastructure/src/main/java/com/graphhire/infrastructure/config/RedisConfig.java` |

---

## 任务分解

### Task 1: 创建父 pom.xml 和模块目录结构

**Files:**
- Create: `backend/pom.xml` (新建父 POM，替换现有 pom.xml)
- Create: `backend/common/pom.xml`
- Create: `backend/infrastructure/pom.xml`
- Create: `backend/auth/pom.xml`
- Create: `backend/skill/pom.xml`
- Create: `backend/notification/pom.xml`
- Create: `backend/resume/pom.xml`
- Create: `backend/job/pom.xml`
- Create: `backend/match/pom.xml`
- Create: `backend/admin/pom.xml`
- Create: `backend/common/src/main/java/com/graphhire/common/model/BaseEntity.java`
- Create: `backend/common/src/main/java/com/graphhire/common/model/BaseAggregateRoot.java`
- Create: `backend/common/src/main/java/com/graphhire/common/vo/Result.java`
- Create: `backend/common/src/main/java/com/graphhire/common/vo/PageQuery.java`
- Create: `backend/common/src/main/java/com/graphhire/common/vo/PageResult.java`
- Create: `backend/common/src/main/java/com/graphhire/common/vo/Exceptions.java`
- Create: `backend/common/pom.xml` (骨架)

- [ ] **Step 1: 创建 backend/ 父 pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.graphhire</groupId>
    <artifactId>graphhire-backend</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>
    <name>GraphHire Backend</name>

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

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>com.graphhire</groupId>
                <artifactId>common</artifactId>
                <version>${project.version}</version>
            </dependency>
            <dependency>
                <groupId>com.graphhire</groupId>
                <artifactId>infrastructure</artifactId>
                <version>${project.version}</version>
            </dependency>
            <!-- 其余 module 依赖声明类似 -->
        </dependencies>
    </dependencyManagement>

    <properties>
        <java.version>21</java.version>
        <spring-boot.version>3.4.5</spring-boot.version>
        <mybatis-plus.version>3.5.10</mybatis-plus.version>
    </properties>
</project>
```

- [ ] **Step 2: 创建 common/pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.graphhire</groupId>
        <artifactId>graphhire-backend</artifactId>
        <version>1.0.0</version>
    </parent>
    <artifactId>common</artifactId>
    <packaging>jar</packaging>
</project>
```

- [ ] **Step 3: 创建其余 8 个 module/pom.xml** (骨架，依赖声明在 Task 3 中补全)

- [ ] **Step 4: 创建 common 模块基础类**

```java
// BaseEntity.java
public abstract class BaseEntity {
    private Long id;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Boolean deleted;
    // getters, setters
}

// BaseAggregateRoot.java
public abstract class BaseAggregateRoot {
    private final List<DomainEvent> domainEvents = new ArrayList<>();
    protected void registerEvent(DomainEvent event) { domainEvents.add(event); }
    public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = new ArrayList<>(domainEvents);
        domainEvents.clear();
        return events;
    }
}

// Result.java (统一响应)
public class Result<T> {
    private int code;
    private String message;
    private T data;
    // factory methods: success(), error()
}
```

- [ ] **Step 5: 提交**

```bash
cd backend && git add pom.xml common/pom.xml infrastructure/pom.xml auth/pom.xml skill/pom.xml notification/pom.xml resume/pom.xml job/pom.xml match/pom.xml admin/pom.xml common/src/ && git commit -m "feat: create 9-module Maven structure and parent pom"
```

---

### Task 2: 创建 infrastructure 模块基础设施

**Files:**
- Create: `infrastructure/pom.xml` (含所有基础设施依赖)
- Create: `infrastructure/src/main/java/com/graphhire/infrastructure/config/AppConfig.java`
- Create: `infrastructure/src/main/java/com/graphhire/infrastructure/config/RedisConfig.java`
- Create: `infrastructure/src/main/java/com/graphhire/infrastructure/config/WebConfig.java`
- Create: `infrastructure/src/main/java/com/graphhire/infrastructure/database/DataSourceConfig.java`
- Create: `infrastructure/src/main/java/com/graphhire/infrastructure/mq/RocketMQConfig.java`
- Create: `infrastructure/src/main/java/com/graphhire/infrastructure/graph/DgraphConfig.java`
- Create: `infrastructure/src/main/java/com/graphhire/infrastructure/ai/AIConfig.java`
- Create: `infrastructure/src/main/java/com/graphhire/infrastructure/file/RustFSConfig.java`
- Create: `infrastructure/src/main/java/com/graphhire/infrastructure/logging/LoggingAspect.java`

- [ ] **Step 1: 创建 infrastructure/pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.graphhire</groupId>
        <artifactId>graphhire-backend</artifactId>
        <version>1.0.0</version>
    </parent>
    <artifactId>infrastructure</artifactId>
    <packaging>jar</packaging>

    <dependencies>
        <dependency>
            <groupId>com.graphhire</groupId>
            <artifactId>common</artifactId>
        </dependency>
        <!-- Redis -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        <!-- RocketMQ -->
        <dependency>
            <groupId>org.apache.rocketmq</groupId>
            <artifactId>rocketmq-spring-boot-starter</artifactId>
            <version>5.5.0</version>
        </dependency>
        <!-- Dgraph -->
        <dependency>
            <groupId>io.dgraph</groupId>
            <artifactId>dgraph4j</artifactId>
            <version>23.1.0</version>
        </dependency>
        <!-- MyBatis-Plus -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
            <version>3.5.10</version>
        </dependency>
        <!-- sa-token -->
        <dependency>
            <groupId>cn.dev33</groupId>
            <artifactId>sa-token-spring-boot3-starter</artifactId>
            <version>1.45.0</version>
        </dependency>
        <!-- Apache Tika -->
        <dependency>
            <groupId>org.apache.tika</groupId>
            <artifactId>tika-core</artifactId>
            <version>3.2.0</version>
        </dependency>
    </dependencies>
</project>
```

- [ ] **Step 2: 创建 DgraphConfig.java**

```java
@Configuration
public class DgraphConfig {
    @Value("${dgraph.url:http://localhost:8080}")
    private String url;
    // DgraphClient bean
}
```

- [ ] **Step 3: 创建 RocketMQConfig.java**

```java
@Configuration
public class RocketMQConfig {
    @Value("${rocketmq.namesrv-addr:localhost:9876}")
    private String namesrvAddr;
    // RocketMQ producer/consumer beans
}
```

- [ ] **Step 4: 创建 RustFSConfig.java (来自现有文件迁移)**

```java
@Configuration
public class RustFSConfig {
    @Value("${rustfs.endpoint}")
    private String endpoint;
    // S3-compatible client bean
}
```

- [ ] **Step 5: 创建 AIConfig.java**

```java
@Configuration
public class AIConfig {
    @Value("${ai.provider:ollama}")
    private String provider; // ollama or deepseek
    @Value("${ai.deepseek.api-key:}")
    private String deepseekApiKey;
    @Value("${ai.ollama.url:http://localhost:11434}")
    private String ollamaUrl;
}
```

- [ ] **Step 6: 提交**

```bash
cd backend && git add infrastructure/pom.xml infrastructure/src/ && git commit -m "feat: create infrastructure module with config classes"
```

---

### Task 3: 配置各模块 pom.xml 依赖声明

**Files:**
- Modify: `auth/pom.xml`
- Modify: `skill/pom.xml`
- Modify: `notification/pom.xml`
- Modify: `resume/pom.xml`
- Modify: `job/pom.xml`
- Modify: `match/pom.xml`
- Modify: `admin/pom.xml`

- [ ] **Step 1: 配置 auth/pom.xml**

```xml
<dependencies>
    <dependency><groupId>com.graphhire</groupId><artifactId>common</artifactId></dependency>
    <dependency><groupId>com.graphhire</groupId><artifactId>infrastructure</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
    <dependency><groupId>cn.dev33</groupId><artifactId>sa-token-spring-boot3-starter</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-mail</artifactId></dependency>
</dependencies>
```

- [ ] **Step 2: 配置 skill/pom.xml** (依赖 common + infrastructure)

- [ ] **Step 3: 配置 notification/pom.xml** (依赖 common + infrastructure)

- [ ] **Step 4: 配置 resume/pom.xml** (依赖 common + infrastructure + auth + skill)

- [ ] **Step 5: 配置 job/pom.xml** (依赖 common + infrastructure + auth + skill)

- [ ] **Step 6: 配置 match/pom.xml** (依赖 common + infrastructure + auth + resume + job + skill)

- [ ] **Step 7: 配置 admin/pom.xml** (依赖 common + infrastructure + auth + resume + job)

- [ ] **Step 8: 提交**

```bash
cd backend && git add */pom.xml && git commit -m "feat: configure all module pom.xml dependencies"
```

---

### Task 4: 创建 auth 模块完整 DDD 结构

**Files:**
- Create: `auth/src/main/java/com/graphhire/auth/domain/model/User.java`
- Create: `auth/src/main/java/com/graphhire/auth/domain/vo/Username.java`
- Create: `auth/src/main/java/com/graphhire/auth/domain/vo/EncryptedPassword.java`
- Create: `auth/src/main/java/com/graphhire/auth/domain/vo/UserType.java`
- Create: `auth/src/main/java/com/graphhire/auth/domain/vo/AuthStatus.java`
- Create: `auth/src/main/java/com/graphhire/auth/domain/service/PasswordEncoder.java`
- Create: `auth/src/main/java/com/graphhire/auth/domain/event/UserRegisteredEvent.java`
- Create: `auth/src/main/java/com/graphhire/auth/domain/event/UserLoginEvent.java`
- Create: `auth/src/main/java/com/graphhire/auth/domain/event/UserLockedEvent.java`
- Create: `auth/src/main/java/com/graphhire/auth/domain/repository/UserRepository.java`
- Create: `auth/src/main/java/com/graphhire/auth/application/service/AuthAppService.java`
- Create: `auth/src/main/java/com/graphhire/auth/application/command/PersonRegisterCmd.java`
- Create: `auth/src/main/java/com/graphhire/auth/application/command/CompanyRegisterCmd.java`
- Create: `auth/src/main/java/com/graphhire/auth/application/command/SendVerifyCodeCmd.java`
- Create: `auth/src/main/java/com/graphhire/auth/application/query/TokenValidateQuery.java`
- Create: `auth/src/main/java/com/graphhire/auth/infrastructure/persistence/mapper/UserMapper.java`
- Create: `auth/src/main/java/com/graphhire/auth/infrastructure/persistence/repository/UserRepositoryImpl.java`
- Create: `auth/src/main/java/com/graphhire/auth/interface/controller/AuthController.java`
- Create: `auth/src/main/java/com/graphhire/auth/interface/dto/request/LoginRequest.java`
- Create: `auth/src/main/java/com/graphhire/auth/interface/dto/request/PersonRegisterRequest.java`
- Create: `auth/src/main/java/com/graphhire/auth/interface/dto/request/CompanyRegisterRequest.java`
- Create: `auth/src/main/java/com/graphhire/auth/interface/dto/response/LoginResponse.java`
- Modify: `auth/pom.xml` (添加 MyBatis-Plus 依赖)

- [ ] **Step 1: 创建富血模型 User.java**

```java
package com.graphhire.auth.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.auth.domain.vo.*;

public class User extends BaseAggregateRoot {
    private Long id;
    private Username username;
    private EncryptedPassword password;
    private UserType userType;
    private AuthStatus status;
    private Integer failedLoginCount = 0;
    private LocalDateTime lockedUntil;

    // 业务方法 - 禁止外部直接修改状态
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

    public void register(String rawPassword) {
        this.password = EncryptedPassword.encode(rawPassword);
        this.status = AuthStatus.PENDING_VERIFY;
        this.registerEvent(new UserRegisteredEvent(this));
    }

    // getters, setters
}
```

- [ ] **Step 2: 创建 Username 值对象**

```java
package com.graphhire.auth.domain.vo;

public final class Username {
    private final String value;

    private Username(String value) {
        if (!value.matches("^[\\w.-]+@[\\w.-]+\\.\\w+$")) {
            throw new IllegalArgumentException("Invalid email format");
        }
        this.value = value;
    }

    public static Username of(String value) {
        return new Username(value);
    }

    public String getValue() { return value; }
}
```

- [ ] **Step 3: 创建 EncryptedPassword 值对象**

```java
package com.graphhire.auth.domain.vo;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public final class EncryptedPassword {
    private final String value;

    private EncryptedPassword(String encoded) {
        this.value = encoded;
    }

    public static EncryptedPassword encode(String raw) {
        return new EncryptedPassword(new BCryptPasswordEncoder().encode(raw));
    }

    public boolean matches(String raw) {
        return new BCryptPasswordEncoder().matches(raw, this.value);
    }

    public String getValue() { return value; }
}
```

- [ ] **Step 4: 创建 UserType 和 AuthStatus 枚举**

```java
// UserType.java
public enum UserType {
    PERSON, COMPANY, ADMIN
}

// AuthStatus.java
public enum AuthStatus {
    PENDING_VERIFY, VERIFIED, LOCKED, DISABLED
}
```

- [ ] **Step 5: 创建领域事件**

```java
// UserRegisteredEvent.java
public class UserRegisteredEvent extends DomainEvent {
    private final User user;
    public UserRegisteredEvent(User user) { this.user = user; }
    public User getUser() { return user; }
}

// UserLoginEvent.java
public class UserLoginEvent extends DomainEvent {
    private final User user;
    public UserLoginEvent(User user) { this.user = user; }
    public User getUser() { return user; }
}

// UserLockedEvent.java
public class UserLockedEvent extends DomainEvent {
    private final User user;
    public UserLockedEvent(User user) { this.user = user; }
    public User getUser() { return user; }
}
```

- [ ] **Step 6: 创建 UserRepository 接口**

```java
package com.graphhire.auth.domain.repository;

public interface UserRepository {
    Optional<User> findById(Long id);
    Optional<User> findByUsername(String username);
    User save(User user);
    void delete(User user);
}
```

- [ ] **Step 7: 创建 UserMapper 和 UserRepositoryImpl**

```java
// UserMapper.java (MyBatis-Plus)
@Mapper
public interface UserMapper extends BaseMapper<UserPO> {}

// UserRepositoryImpl.java
@Repository
public class UserRepositoryImpl implements UserRepository {
    @Autowired private UserMapper userMapper;

    @Override
    public Optional<User> findById(Long id) {
        UserPO po = userMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    private User toDomain(UserPO po) {
        // convert PO to Domain
    }
}
```

- [ ] **Step 8: 创建 AuthAppService (应用层)**

```java
@Service
public class AuthAppService {
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginCmd cmd) {
        User user = userRepository.findByUsername(cmd.getUsername())
            .orElseThrow(() -> new BusinessException("用户不存在"));
        if (user.isLocked()) {
            throw new BusinessException("账号已锁定");
        }
        if (!user.getPassword().matches(cmd.getPassword())) {
            user.loginFailed();
            userRepository.save(user);
            throw new BusinessException("密码错误");
        }
        user.loginSuccess();
        userRepository.save(user);
        String token = generateToken(user);
        return new LoginResponse(token, user.getUserType());
    }
}
```

- [ ] **Step 9: 创建 AuthController (接口层)**

```java
@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired private AuthAppService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest request) {
        return Result.success(authService.login(request.toCmd()));
    }

    @PostMapping("/person/register")
    public Result<LoginResponse> personRegister(@RequestBody PersonRegisterRequest request) {
        return Result.success(authService.registerPerson(request.toCmd()));
    }

    @PostMapping("/company/register")
    public Result<LoginResponse> companyRegister(@RequestBody CompanyRegisterRequest request) {
        return Result.success(authService.registerCompany(request.toCmd()));
    }

    @PostMapping("/send-verify-code")
    public Result<Void> sendVerifyCode(@RequestParam String email) {
        authService.sendVerifyCode(email);
        return Result.success();
    }

    @PostMapping("/reset-password")
    public Result<Void> resetPassword(@RequestParam String email,
            @RequestParam String code, @RequestParam String newPassword) {
        authService.resetPassword(email, code, newPassword);
        return Result.success();
    }
}
```

- [ ] **Step 10: 提交**

```bash
cd backend && git add auth/src/ && git commit -m "feat: complete auth module DDD structure with rich domain model"
```

---

### Task 5: 创建 resume 模块完整 DDD 结构

**Files:**
- Create: `resume/src/main/java/com/graphhire/resume/domain/model/Resume.java`
- Create: `resume/src/main/java/com/graphhire/resume/domain/model/PersonInfo.java`
- Create: `resume/src/main/java/com/graphhire/resume/domain/model/ParseTask.java`
- Create: `resume/src/main/java/com/graphhire/resume/domain/vo/ParseStatus.java`
- Create: `resume/src/main/java/com/graphhire/resume/domain/service/ResumeDomainService.java`
- Create: `resume/src/main/java/com/graphhire/resume/domain/event/ResumeUploadedEvent.java`
- Create: `resume/src/main/java/com/graphhire/resume/domain/event/ResumeParsedEvent.java`
- Create: `resume/src/main/java/com/graphhire/resume/domain/repository/ResumeRepository.java`
- Create: `resume/src/main/java/com/graphhire/resume/domain/repository/ParseTaskRepository.java`
- Create: `resume/src/main/java/com/graphhire/resume/application/service/ResumeAppService.java`
- Create: `resume/src/main/java/com/graphhire/resume/application/service/ParseAppService.java`
- Create: `resume/src/main/java/com/graphhire/resume/application/command/UploadResumeCmd.java`
- Create: `resume/src/main/java/com/graphhire/resume/infrastructure/file/RustFSClient.java`
- Create: `resume/src/main/java/com/graphhire/resume/infrastructure/mq/ResumeMQProducer.java`
- Create: `resume/src/main/java/com/graphhire/resume/infrastructure/ai/DocumentParser.java`
- Create: `resume/src/main/java/com/graphhire/resume/infrastructure/persistence/mapper/ResumeMapper.java`
- Create: `resume/src/main/java/com/graphhire/resume/infrastructure/persistence/mapper/PersonInfoMapper.java`
- Create: `resume/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/ResumeRepositoryImpl.java`
- Create: `resume/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/ParseTaskRepositoryImpl.java`
- Create: `resume/src/main/java/com/graphhire/resume/interface/controller/ResumeController.java`
- Create: `resume/src/main/java/com/graphhire/resume/interface/controller/PersonController.java`
- Modify: `resume/pom.xml`

- [ ] **Step 1: 创建 Resume 聚合根（富血）**

```java
public class Resume extends BaseAggregateRoot {
    private Long id;
    private Long userId;
    private String fileName;
    private String filePath;
    private ParseStatus status;
    private ParseResult parseResult;
    private Integer retryCount = 0;

    public void upload(String filePath, String fileName) {
        this.filePath = filePath;
        this.fileName = fileName;
        this.status = ParseStatus.PENDING;
        this.registerEvent(new ResumeUploadedEvent(this));
    }

    public void markParsing() {
        this.status = ParseStatus.PARSING;
    }

    public void parsed(ParseResult result) {
        this.parseResult = result;
        this.status = ParseStatus.SUCCESS;
        this.registerEvent(new ResumeParsedEvent(this));
    }

    public void parseFailed(String errorMessage) {
        this.status = ParseStatus.FAILED;
        this.retryCount++;
        if (this.retryCount >= 3) {
            throw new RuntimeException("重试次数已达上限");
        }
    }

    public boolean canRetry() {
        return this.retryCount < 3;
    }
}
```

- [ ] **Step 2: 创建 ParseTask 实体**

```java
public class ParseTask extends BaseEntity {
    private Long id;
    private Long resumeId;
    private TaskStatus status;
    private String errorMessage;
    private Integer retryCount = 0;
    private String rawText;
    private String parseResult;

    public void schedule() {
        this.status = TaskStatus.PENDING;
    }

    public void markProcessing() {
        this.status = TaskStatus.PROCESSING;
    }

    public void markSuccess(String result) {
        this.parseResult = result;
        this.status = TaskStatus.SUCCESS;
    }

    public void markFailed(String error) {
        this.errorMessage = error;
        this.status = TaskStatus.FAILED;
        this.retryCount++;
    }
}
```

- [ ] **Step 3: 创建 ResumeAppService 和 ParseAppService**

```java
@Service
public class ResumeAppService {
    @Autowired private ResumeRepository resumeRepository;
    @Autowired private RustFSClient rustFSClient;
    @Autowired private ResumeMQProducer mqProducer;

    @Transactional
    public Resume uploadResume(UploadResumeCmd cmd) {
        // 1. 上传文件到 RustFS
        String filePath = rustFSClient.upload(cmd.getFileBytes(), cmd.getFileName());
        // 2. 创建简历聚合根
        Resume resume = new Resume();
        resume.upload(filePath, cmd.getFileName());
        // 3. 保存
        Resume saved = resumeRepository.save(resume);
        // 4. 发送 MQ 消息触发解析
        mqProducer.sendResumeUploadedEvent(saved);
        return saved;
    }
}
```

- [ ] **Step 4: 创建 ResumeController 和 PersonController**

```java
@RestController
@RequestMapping("/resume")
public class ResumeController {
    @Autowired private ResumeAppService resumeService;

    @PostMapping("/upload")
    public Result<Long> uploadResume(@RequestParam("file") MultipartFile file) {
        UploadResumeCmd cmd = new UploadResumeCmd(file);
        Long resumeId = resumeService.uploadResume(cmd).getId();
        return Result.success(resumeId);
    }

    @GetMapping("/{id}/detail")
    public Result<ResumeDetailResponse> getDetail(@PathVariable Long id) {
        return Result.success(resumeService.getDetail(id));
    }

    @GetMapping("/list")
    public Result<List<ResumeDetailResponse>> getList() {
        return Result.success(resumeService.getList());
    }
}
```

- [ ] **Step 5: 提交**

```bash
cd backend && git add resume/src/ && git commit -m "feat: complete resume module DDD structure"
```

---

### Task 6: 创建 job 模块完整 DDD 结构

**Files:**
- Create: `job/src/main/java/com/graphhire/job/domain/model/Job.java`
- Create: `job/src/main/java/com/graphhire/job/domain/model/Company.java`
- Create: `job/src/main/java/com/graphhire/job/domain/vo/JobStatus.java`
- Create: `job/src/main/java/com/graphhire/job/domain/vo/SalaryRange.java`
- Create: `job/src/main/java/com/graphhire/job/domain/vo/Location.java`
- Create: `job/src/main/java/com/graphhire/job/domain/service/JobDomainService.java`
- Create: `job/src/main/java/com/graphhire/job/domain/event/JobPublishedEvent.java`
- Create: `job/src/main/java/com/graphhire/job/domain/repository/JobRepository.java`
- Create: `job/src/main/java/com/graphhire/job/domain/repository/CompanyRepository.java`
- Create: `job/src/main/java/com/graphhire/job/application/service/JobAppService.java`
- Create: `job/src/main/java/com/graphhire/job/application/service/CompanyAppService.java`
- Create: `job/src/main/java/com/graphhire/job/application/command/PublishJobCmd.java`
- Create: `job/src/main/java/com/graphhire/job/infrastructure/persistence/mapper/JobMapper.java`
- Create: `job/src/main/java/com/graphhire/job/infrastructure/persistence/repository/JobRepositoryImpl.java`
- Create: `job/src/main/java/com/graphhire/job/infrastructure/file/RustFSClient.java`
- Create: `job/src/main/java/com/graphhire/job/infrastructure/mq/JobMQProducer.java`
- Create: `job/src/main/java/com/graphhire/job/interface/controller/JobController.java`
- Create: `job/src/main/java/com/graphhire/job/interface/controller/CompanyController.java`
- Modify: `job/pom.xml`

- [ ] **Step 1: 创建 Job 聚合根（富血）**

```java
public class Job extends BaseAggregateRoot {
    private Long id;
    private Long companyId;
    private String title;
    private String department;
    private Integer headcount;
    private Location location;
    private SalaryRange salaryRange;
    private List<String> requiredSkills;
    private List<String> preferredSkills;
    private JobStatus status;
    private String description;

    public void publish() {
        if (this.status != JobStatus.DRAFT && this.status != JobStatus.CLOSED) {
            throw new IllegalStateException("只能发布草稿或已关闭的职位");
        }
        this.status = JobStatus.PUBLISHED;
        this.registerEvent(new JobPublishedEvent(this));
    }

    public void close() {
        this.status = JobStatus.CLOSED;
    }

    public void updateSalary(SalaryRange newRange) {
        if (newRange.getMin() > newRange.getMax()) {
            throw new IllegalArgumentException("最低薪资不能大于最高薪资");
        }
        this.salaryRange = newRange;
    }
}
```

- [ ] **Step 2: 创建 SalaryRange 值对象**

```java
public final class SalaryRange {
    private final Integer min;
    private final Integer max;
    private final String unit; // 月/小时/年

    private SalaryRange(Integer min, Integer max, String unit) {
        if (min > max) throw new IllegalArgumentException("min cannot greater than max");
        this.min = min;
        this.max = max;
        this.unit = unit;
    }

    public static SalaryRange of(Integer min, Integer max, String unit) {
        return new SalaryRange(min, max, unit);
    }

    public boolean isInRange(Integer salary) {
        return salary >= min && salary <= max;
    }

    public Integer getMin() { return min; }
    public Integer getMax() { return max; }
    public String getUnit() { return unit; }
}
```

- [ ] **Step 3: 创建 Company 实体和 JobAppService**

```java
// Company.java (富血实体)
public class Company extends BaseAggregateRoot {
    private Long id;
    private String name;
    private String unifiedSocialCreditCode;
    private AuthStatus authStatus;
    private String licenseUrl;

    public void approve() {
        this.authStatus = AuthStatus.APPROVED;
    }

    public void reject() {
        this.authStatus = AuthStatus.REJECTED;
    }
}
```

- [ ] **Step 4: 提交**

```bash
cd backend && git add job/src/ && git commit -m "feat: complete job module DDD structure"
```

---

### Task 7: 创建 match 模块完整 DDD 结构

**Files:**
- Create: `match/src/main/java/com/graphhire/match/domain/model/MatchRecord.java`
- Create: `match/src/main/java/com/graphhire/match/domain/vo/MatchScore.java`
- Create: `match/src/main/java/com/graphhire/match/domain/vo/SkillMatchResult.java`
- Create: `match/src/main/java/com/graphhire/match/domain/vo/MatchLevel.java`
- Create: `match/src/main/java/com/graphhire/match/domain/service/MatchDomainService.java`
- Create: `match/src/main/java/com/graphhire/match/domain/service/SkillNormalizationService.java`
- Create: `match/src/main/java/com/graphhire/match/domain/event/MatchCompletedEvent.java`
- Create: `match/src/main/java/com/graphhire/match/domain/repository/MatchRecordRepository.java`
- Create: `match/src/main/java/com/graphhire/match/application/service/MatchAppService.java`
- Create: `match/src/main/java/com/graphhire/match/application/command/TriggerMatchCmd.java`
- Create: `match/src/main/java/com/graphhire/match/application/query/MatchDetailQuery.java`
- Create: `match/src/main/java/com/graphhire/match/infrastructure/graph/DgraphGraphClient.java`
- Create: `match/src/main/java/com/graphhire/match/infrastructure/ai/DeepSeekClient.java`
- Create: `match/src/main/java/com/graphhire/match/infrastructure/ai/OllamaClient.java`
- Create: `match/src/main/java/com/graphhire/match/infrastructure/mq/MatchMQConsumer.java`
- Create: `match/src/main/java/com/graphhire/match/infrastructure/persistence/repository/MatchRecordRepositoryImpl.java`
- Create: `match/src/main/java/com/graphhire/match/interface/controller/MatchController.java`
- Create: `match/src/main/java/com/graphhire/match/interface/dto/response/MatchDetailResponse.java`
- Modify: `match/pom.xml`

- [ ] **Step 1: 创建 MatchScore 值对象**

```java
public final class MatchScore {
    private final double total;       // 0-100
    private final double skillScore;  // 权重 50%
    private final double expScore;    // 权重 20%
    private final double cityScore;   // 权重 15%
    private final double eduScore;    // 权重 10%
    private final double salScore;    // 权重 5%

    private MatchScore(double skill, double exp, double city, double edu, double sal) {
        this.skillScore = skill;
        this.expScore = exp;
        this.cityScore = city;
        this.eduScore = edu;
        this.salScore = sal;
        this.total = skill * 0.5 + exp * 0.2 + city * 0.15 + edu * 0.1 + sal * 0.05;
    }

    public static MatchScore of(double skill, double exp, double city, double edu, double sal) {
        return new MatchScore(skill, exp, city, edu, sal);
    }

    public MatchLevel getLevel() {
        if (total >= 80) return MatchLevel.HIGH;
        if (total >= 50) return MatchLevel.MEDIUM;
        return MatchLevel.LOW;
    }
}
```

- [ ] **Step 2: 创建 MatchDomainService (核心匹配逻辑)**

```java
@DomainService
public class MatchDomainService {
    @Autowired private ResumeRepository resumeRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private SkillTagRepository skillTagRepository;
    @Autowired private SkillNormalizationService normalizationService;
    @Autowired private DeepSeekClient deepSeekClient;

    public MatchRecord calculateMatch(Long resumeId, Long jobId) {
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new BusinessException("简历不存在"));
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new BusinessException("职位不存在"));

        // 技能匹配
        List<String> resumeSkills = normalizationService.normalize(resume.getSkills());
        List<String> jobSkills = normalizationService.normalize(job.getRequiredSkills());
        double skillScore = calculateSkillScore(resumeSkills, jobSkills);

        // 经验匹配
        double expScore = calculateExperienceScore(resume, job);

        // 城市匹配
        double cityScore = calculateCityScore(resume, job);

        // 学历匹配
        double eduScore = calculateEducationScore(resume, job);

        // 薪资匹配
        double salScore = calculateSalaryScore(resume, job);

        MatchScore score = MatchScore.of(skillScore, expScore, cityScore, eduScore, salScore);
        return MatchRecord.create(resumeId, jobId, score);
    }

    private double calculateSkillScore(List<String> resumeSkills, List<String> jobSkills) {
        Set<String> resumeSet = new HashSet<>(resumeSkills);
        Set<String> jobSet = new HashSet<>(jobSkills);
        Set<String> intersection = new HashSet<>(resumeSet);
        intersection.retainAll(jobSet);
        if (jobSet.isEmpty()) return 0;
        return (double) intersection.size() / jobSet.size() * 100;
    }
}
```

- [ ] **Step 3: 创建 MatchRecord 聚合根**

```java
public class MatchRecord extends BaseAggregateRoot {
    private Long id;
    private Long resumeId;
    private Long jobId;
    private MatchScore score;
    private MatchLevel level;
    private String matchReason;
    private Boolean isRead = false;

    public static MatchRecord create(Long resumeId, Long jobId, MatchScore score) {
        MatchRecord record = new MatchRecord();
        record.resumeId = resumeId;
        record.jobId = jobId;
        record.score = score;
        record.level = score.getLevel();
        record.registerEvent(new MatchCompletedEvent(record));
        return record;
    }

    public void markAsRead() {
        this.isRead = true;
    }
}
```

- [ ] **Step 4: 创建 MatchMQConsumer (消费解析完成事件)**

```java
@Component
public class MatchMQConsumer {
    @Autowired private MatchAppService matchAppService;

    @RocketMQMessageListener(topic = "resume-parsed", consumerGroup = "match-consumer")
    public void onResumeParsed(ResumeParsedEvent event) {
        matchAppService.triggerMatchForResume(event.getResume().getId());
    }

    @RocketMQMessageListener(topic = "job-published", consumerGroup = "match-consumer")
    public void onJobPublished(JobPublishedEvent event) {
        matchAppService.triggerMatchForJob(event.getJob().getId());
    }
}
```

- [ ] **Step 5: 提交**

```bash
cd backend && git add match/src/ && git commit -m "feat: complete match module DDD structure with MatchDomainService"
```

---

### Task 8: 创建 skill 和 notification 模块完整 DDD 结构

**Files (skill):**
- Create: `skill/src/main/java/com/graphhire/skill/domain/model/SkillTag.java`
- Create: `skill/src/main/java/com/graphhire/skill/domain/vo/SkillCategory.java`
- Create: `skill/src/main/java/com/graphhire/skill/domain/service/SkillTagDomainService.java`
- Create: `skill/src/main/java/com/graphhire/skill/domain/repository/SkillTagRepository.java`
- Create: `skill/src/main/java/com/graphhire/skill/application/service/SkillTagAppService.java`
- Create: `skill/src/main/java/com/graphhire/skill/application/command/CreateSkillTagCmd.java`
- Create: `skill/src/main/java/com/graphhire/skill/infrastructure/persistence/repository/SkillTagRepositoryImpl.java`
- Create: `skill/src/main/java/com/graphhire/skill/infrastructure/graph/SkillGraphClient.java`
- Create: `skill/src/main/java/com/graphhire/skill/interface/controller/SkillTagController.java`

**Files (notification):**
- Create: `notification/src/main/java/com/graphhire/notification/domain/model/Notification.java`
- Create: `notification/src/main/java/com/graphhire/notification/domain/vo/NotificationType.java`
- Create: `notification/src/main/java/com/graphhire/notification/domain/repository/NotificationRepository.java`
- Create: `notification/src/main/java/com/graphhire/notification/application/service/NotificationAppService.java`
- Create: `notification/src/main/java/com/graphhire/notification/infrastructure/persistence/repository/NotificationRepositoryImpl.java`
- Create: `notification/src/main/java/com/graphhire/notification/infrastructure/mq/NotificationEventSubscriber.java`
- Create: `notification/src/main/java/com/graphhire/notification/interface/controller/NotificationController.java`

- [ ] **Step 1: 创建 SkillTag 聚合根（富血）**

```java
public class SkillTag extends BaseAggregateRoot {
    private Long id;
    private String name;
    private SkillCategory category;
    private Set<String> synonyms;

    public void addSynonym(String synonym) {
        this.synonyms.add(synonym);
    }

    public void removeSynonym(String synonym) {
        this.synonyms.remove(synonym);
    }

    public void updateCategory(SkillCategory newCategory) {
        this.category = newCategory;
    }
}
```

- [ ] **Step 2: 创建 SkillTagDomainService (技能归一化)**

```java
@DomainService
public class SkillTagDomainService {
    @Autowired private SkillTagRepository repository;

    public List<String> normalize(List<String> rawSkills) {
        Set<String> normalized = new HashSet<>();
        for (String skill : rawSkills) {
            SkillTag tag = repository.findByName(skill)
                .orElseGet(() -> repository.findBySynonym(skill).orElse(null));
            if (tag != null) {
                normalized.add(tag.getName());
            } else {
                normalized.add(skill); // 未找到则保留原名
            }
        }
        return new ArrayList<>(normalized);
    }
}
```

- [ ] **Step 3: 创建 Notification 聚合根和 NotificationEventSubscriber**

```java
// Notification.java
public class Notification extends BaseAggregateRoot {
    private Long id;
    private Long userId;
    private NotificationType type;
    private String content;
    private Boolean isRead = false;

    public void markAsRead() {
        this.isRead = true;
    }
}

// NotificationEventSubscriber.java (订阅各领域事件)
@Component
public class NotificationEventSubscriber {
    @Autowired private NotificationAppService notificationService;

    @EventListener
    public void onResumeParsed(ResumeParsedEvent event) {
        notificationService.create(event.getResume().getUserId(),
            NotificationType.RESUME_PARSED, "您的简历已解析完成");
    }

    @EventListener
    public void onMatchCompleted(MatchCompletedEvent event) {
        notificationService.create(event.getMatchRecord().getJobId(),
            NotificationType.NEW_CANDIDATE, "有新的候选人匹配");
    }
}
```

- [ ] **Step 4: 提交**

```bash
cd backend && git add skill/src/ notification/src/ && git commit -m "feat: complete skill and notification module DDD structure"
```

---

### Task 9: 创建 admin 模块完整 DDD 结构

**Files:**
- Create: `admin/src/main/java/com/graphhire/admin/domain/service/AdminDomainService.java`
- Create: `admin/src/main/java/com/graphhire/admin/domain/repository/AdminRepository.java`
- Create: `admin/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Create: `admin/src/main/java/com/graphhire/admin/application/command/AuthCompanyCmd.java`
- Create: `admin/src/main/java/com/graphhire/admin/application/command/DisableUserCmd.java`
- Create: `admin/src/main/java/com/graphhire/admin/application/query/UserListQuery.java`
- Create: `admin/src/main/java/com/graphhire/admin/infrastructure/config/AdminSecurityConfig.java`
- Create: `admin/src/main/java/com/graphhire/admin/interface/controller/AdminController.java`
- Create: `admin/src/main/java/com/graphhire/admin/interface/dto/response/DashboardStatsResponse.java`
- Modify: `admin/pom.xml`

- [ ] **Step 1: 创建 AdminAppService (Dashboard 统计)**

```java
@Service
public class AdminAppService {
    @Autowired private UserRepository userRepository;
    @Autowired private ResumeRepository resumeRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private MatchRecordRepository matchRecordRepository;

    public DashboardStatsResponse getDashboardStats() {
        long personCount = userRepository.countByType(UserType.PERSON);
        long companyCount = userRepository.countByType(UserType.COMPANY);
        long resumeCount = resumeRepository.count();
        long jobCount = jobRepository.countByStatus(JobStatus.PUBLISHED);
        long matchCount = matchRecordRepository.count();
        return new DashboardStatsResponse(personCount, companyCount, resumeCount, jobCount, matchCount);
    }

    public void authCompany(Long companyId, AuthCompanyCmd cmd) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new BusinessException("企业不存在"));
        if (cmd.isApproved()) {
            company.approve();
        } else {
            company.reject();
        }
        companyRepository.save(company);
    }
}
```

- [ ] **Step 2: 提交**

```bash
cd backend && git add admin/src/ && git commit -m "feat: complete admin module DDD structure"
```

---

### Task 10: 删除旧结构文件，验证编译

**Files:**
- Delete: `backend/src/main/java/com/graphhire/web/` (旧 controller 目录，移至各 module)
- Delete: `backend/src/main/java/com/graphhire/domain/` (旧 domain 目录，移至各 module)
- Delete: `backend/src/main/java/com/graphhire/application/` (旧 application 目录)
- Delete: `backend/src/main/java/com/graphhire/infrastructure/persistence/` (保留 config，迁移 mapper)
- Delete: `backend/src/main/java/com/graphhire/infrastructure/config/` (迁移至 infrastructure module)
- Modify: `backend/pom.xml` (现为父 POM)
- Delete: `backend/pom.xml` (旧单模块 pom.xml，替换为父 POM)

- [ ] **Step 1: 删除旧目录前先确认所有文件已迁移**

```bash
# 检查是否有遗漏
find backend/src/main/java/com/graphhire -name "*Controller.java" | grep -v "interface/controller"
# 预期输出为空
```

- [ ] **Step 2: 删除旧目录**

```bash
rm -rf backend/src/main/java/com/graphhire/web
rm -rf backend/src/main/java/com/graphhire/domain
rm -rf backend/src/main/java/com/graphhire/application
# 保留 infrastructure/config 中的部分配置迁移后删除
```

- [ ] **Step 3: 执行全量编译验证**

```bash
cd backend && mvn clean compile -DskipTests
# 预期：所有 9 个 module 编译成功
```

- [ ] **Step 4: 提交**

```bash
cd backend && git add -A && git commit -m "refactor: remove old flat structure, complete DDD multi-module migration"
```

---

### Task 11: 最终验证 - 运行 mvn package

- [ ] **Step 1: 执行全量打包**

```bash
cd backend && mvn clean package -DskipTests
```

- [ ] **Step 2: 验证每个 module jar 生成**

```bash
ls -la */target/*.jar
# 预期：common-1.0.0.jar, infrastructure-1.0.0.jar, auth-1.0.0.jar, skill-1.0.0.jar, notification-1.0.0.jar, resume-1.0.0.jar, job-1.0.0.jar, match-1.0.0.jar, admin-1.0.0.jar
```

- [ ] **Step 3: 提交最终状态**

```bash
cd backend && git add -A && git commit -m "feat: complete DDD multi-module refactoring - all modules building successfully"
```
