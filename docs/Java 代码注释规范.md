# Java 代码注释规范

> 适用范围：项目所有 Java 代码（不含 License 声明段落）。

---

## 1. 类 Javadoc

### 简单类（接口、VO、枚举等）

一句话概括类职责，可选列出关键字段或方法。

```java
/**
 * 用户服务接口
 * 定义用户管理核心方法：register（注册）、login（登录）、validateToken（Token校验）
 */
public interface UserRepository { ... }
```

### 复杂实现类（ServiceImpl、Manager 等）

使用 `【】` 分块标签，结构化描述类信息。

```java
/**
 * 简历领域模型
 *
 * 【模块说明】管理候选人简历文档的完整生命周期，包括上传、解析、状态流转。
 *
 * 【状态机】
 * - PENDING：待解析
 * - PARSING：解析中
 * - SUCCESS：解析成功
 * - FAILED：解析失败
 *
 * 【事件发布】
 * - upload()：发布 ResumeUploadedEvent
 * - parsed()：发布 ResumeParsedEvent
 *
 * 【关联实体】
 * - userId：上传用户
 * - filePath：存储路径（RustFS）
 * - parseResult：AI解析结果JSON
 */
public class Resume extends BaseAggregateRoot { ... }
```

**分块标签说明：**

| 标签 | 用途 |
|------|------|
| `【模块说明】` | 概述类的职责和功能 |
| `【数据来源】` | 说明数据表或外部依赖 |
| `【方法概览】` | 列出主要方法及作用 |
| `【业务规则】` | 说明核心业务约束或逻辑 |
| `【注意事项】` | 强调特别需要注意的点 |
| `【状态机】` | 说明对象的状态流转 |
| `【事件发布】` | 说明领域事件发布时机 |
| `【关联实体】` | 说明关联的实体字段 |

---

## 2. Controller 方法 Javadoc

```java
/**
 * 用户登录
 * @param request 登录请求（username、password）
 * @return 登录响应（token、userType）
 */
@PostMapping("/login")
public Result<LoginResponse> login(@RequestBody LoginRequest request) { ... }

/**
 * 个人用户注册
 * @param request 注册请求（username、password、email等）
 * @return 登录响应（token、userType）
 */
@PostMapping("/register/person")
public Result<LoginResponse> personRegister(@RequestBody PersonRegisterRequest request) { ... }

/**
 * 发送验证码
 * @param email 邮箱地址
 * @return void
 */
@PostMapping("/send-verify-code")
public Result<Void> sendVerifyCode(@RequestParam String email) { ... }
```

---

## 3. Service 实现方法 Javadoc（最详细）

对于复杂业务逻辑，使用 `【功能说明】` + `【业务步骤】` 结构。

```java
/**
 * 用户登录
 * 【功能说明】验证用户凭据，执行 Sa-Token 登录，返回认证Token。
 *            包含密码校验、登录失败计数、账号锁定检查。
 * 【业务步骤】
 * 步骤1：查询用户，不存在则抛异常
 * 步骤2：检查账号是否已锁定
 * 步骤3：校验密码，失败则记录并抛异常
 * 步骤4：登录成功，重置失败计数
 * 步骤5：执行 Sa-Token 登录，存储用户类型到 Session
 * 步骤6：构建登录响应（token、userType）
 */
public LoginResponse login(String username, String password) {
    // 步骤1：查询用户
    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> Exceptions.BusinessException.of("用户不存在"));

    // 步骤2：检查账号是否锁定
    if (user.isLocked()) {
        throw Exceptions.BusinessException.of("账号已锁定");
    }

    // 步骤3：校验密码
    if (!user.getPassword().matches(password)) {
        user.loginFailed();
        userRepository.save(user);
        throw Exceptions.BusinessException.of("密码错误");
    }

    // 步骤4：登录成功，重置失败计数
    user.loginSuccess();
    userRepository.save(user);

    // 步骤5：Sa-Token 登录
    doLogin(user);
    return buildLoginResponse(user);
}
```

### 业务步骤代码注释对照

方法 Javadoc 中的每个 `步骤X`，在代码中以 `// 步骤X：` 对应标注：

```java
/**
 * 重置密码
 * 【功能说明】通过邮箱验证码重置用户密码。
 * 【业务步骤】
 * 步骤1：校验验证码有效性
 * 步骤2：删除已使用的验证码
 * 步骤3：查询用户并更新密码
 */
public void resetPassword(String username, String code, String newPassword) {
    // 步骤1：校验验证码
    String key = "email_code:" + username + ":forgot_password";
    String storedCode = redisTemplate.opsForValue().get(key);
    if (storedCode == null || !storedCode.equals(code)) {
        throw Exceptions.BusinessException.of("验证码错误或已过期");
    }

    // 步骤2：删除已使用的验证码
    redis.delete(key);

    // 步骤3：查询用户并更新密码
    User user = userRepository.findByUsername(username)...
    user.setPassword(EncryptedPassword.encode(newPassword));
    userRepository.save(user);
}
```

---

## 4. 私有方法 Javadoc

简短描述方法功能，一行或多行。

```java
/** 执行 Sa-Token 登录，存储用户类型到 Session */
private void doLogin(User user) {
    StpUtil.login(user.getId());
    StpUtil.getSession().set("role", user.getUserType().name());
}

/** 构建登录响应，包含 Token、过期时间、用户类型 */
private LoginResponse buildLoginResponse(User user) {
    String token = StpUtil.getTokenValue();
    return new LoginResponse(token, null, 86400L, user.getUserType(), user.getId());
}

/**
 * 根据 refresh token 查找用户ID
 * 从 Redis 中读取 `satoken:refresh:{refreshToken}` 对应的 userId
 */
private Long findUserIdByRefreshToken(String refreshToken) {
    String key = "satoken:refresh:" + refreshToken;
    String userId = redisTemplate.opsForValue().get(key);
    return userId != null ? Long.parseLong(userId) : null;
}
```

---

## 5. 字段/常量注释

字段声明上方，使用行内 `/** */` 注释。

```java
/** 匹配记录方向：求职者投递 */
public static final int DIRECTION_PERSON_APPLIES = 1;
/** 匹配记录方向：企业推荐 */
public static final int DIRECTION_COMPANY_RECOMMENDS = 2;
/** 简历解析成功状态 */
private static final String STATUS_SUCCESS = "SUCCESS";
/** 简历解析失败状态 */
private static final String STATUS_ERROR = "ERROR";
/** 验证码 Redis Key 前缀 */
private static final String EMAIL_CODE_PREFIX = "email_code:";
/** 验证码有效期：15分钟 */
private static final long VERIFY_CODE_TTL_MINUTES = 15L;
```

---

## 6. VO/DTO/Entity 字段 Javadoc

每个字段上方使用行内 `/** */`，说明字段含义。

```java
@Data
@Builder
public class LoginResponse {
    /** Sa-Token 认证 Token */
    private String token;
    /** Refresh Token（用于 Token 续期） */
    private String refreshToken;
    /** Token 过期时间（秒），默认 86400（24小时） */
    private Long expireTime;
    /** 用户类型：PERSON / COMPANY / ADMIN */
    private UserType userType;
    /** 用户ID */
    private Long userId;
}
```

---

## 7. 代码块内部注释

标注当前业务步骤，使用 `// 注释内容` 风格。trivial 代码不需要注释。

```java
// 步骤3：校验密码，失败则记录失败次数并抛异常
if (!user.getPassword().matches(password)) {
    user.loginFailed();
    userRepository.save(user);
    throw Exceptions.BusinessException.of("密码错误");
}

// 步骤5：Sa-Token 登录，存储角色信息
StpUtil.login(user.getId());
StpUtil.getSession().set("role", user.getUserType().name());
```

---

## 8. 代码分段注释（ServiceImpl/ManagerImpl 专用）

使用分隔线 + `【第X部分】` 标题，将实现类划分为多个逻辑章节。

```java
// =====================================================
// 【第一部分】常量定义
// =====================================================

// =====================================================
// 【第二部分】依赖注入
// =====================================================

// =====================================================
// 【第三部分】核心业务方法实现
// =====================================================

// =====================================================
// 【第四部分】私有辅助方法
// =====================================================

// ... 最多到第十三部分
```

- 分隔线：`// =====` 共 58 个等号，两端各留一空格
- 标题格式：`// 【第X部分】名称`
- 每个部分包含一组职责相近的私有方法

---

## 规则汇总

| 位置 | 注释风格 | 格式要求 |
|------|---------|---------|
| 简单类 | Javadoc `/** */` | 一句话概述 + 可选方法列表 |
| 复杂实现类 | Javadoc + `【】` 分块 | 【模块说明】【数据来源】【方法概览】等 |
| Controller 方法 | Javadoc + `@param/@return` | 功能 → 参数 → 返回值 |
| Service 实现方法 | Javadoc + `【功能说明】【业务步骤】` | 详细步骤 + `// 步骤X` 对应 |
| 私有方法 | 单行/多行 Javadoc | 简短描述功能 |
| 常量字段 | 行内 `/** */` | 说明用途/含义/取值 |
| VO/DTO/Entity 字段 | 行内 `/** */` | 说明字段语义/取值示例 |
| 代码块 | `// ` 单行注释 | 标注业务步骤 |
| 代码分段 | `// =====` + `【第X部分】` | Impl 内部逻辑分章 |
