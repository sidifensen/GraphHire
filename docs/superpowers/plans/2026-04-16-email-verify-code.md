# 邮箱验证码注册与忘记密码功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现注册和忘记密码的邮箱验证码功能，通过真实 SMTP 邮件发送验证码。

**Architecture:** 
- 新建 `MailService` 邮件服务组件，封装 JavaMailSender
- 重构 `AuthAppService.sendVerifyCode()` 使用真实邮件发送
- 注册/忘记密码时先校验验证码再执行操作
- Redis 存储验证码（15分钟有效期）

**Tech Stack:** Spring Boot Mail (JavaMailSender), QQ SMTP, Redis, Sa-Token

---

## File Structure

```
backend/src/main/java/com/graphhire/
├── auth/
│   ├── infrastructure/
│   │   └── mail/MailService.java              # [新建] 邮件发送服务
│   └── application/
│       └── service/AuthAppService.java        # [修改] 重构验证码发送和注册逻辑
└── resources/
    └── application.yml                         # [修改] 添加 mail 配置

backend/src/main/java/com/graphhire/auth/interfaces/
├── dto/request/
│   ├── PersonRegisterRequest.java              # [修改] 增加 verifyCode 字段
│   └── CompanyRegisterRequest.java              # [修改] 增加 verifyCode 字段
└── controller/AuthController.java              # [修改] 注册接口接收验证码

backend/src/main/java/com/graphhire/auth/application/command/
├── PersonRegisterCmd.java                      # [修改] 增加 verifyCode 字段
├── CompanyRegisterCmd.java                     # [修改] 增加 verifyCode 字段
└── ForgotPasswordCmd.java                      # [新建] 忘记密码命令
```

---

## Task 1: 添加邮件配置

**Files:**
- Modify: `backend/src/main/resources/application.yml`

- [ ] **Step 1: 添加 mail 配置到 application.yml**

在 `spring:` 节点下添加:

```yaml
  mail:
    host: smtp.qq.com
    port: 465
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
          ssl:
            enable: true
```

---

## Task 2: 创建 MailService

**Files:**
- Create: `backend/src/main/java/com/graphhire/auth/infrastructure/mail/MailService.java`

- [ ] **Step 1: 创建 MailService 类**

```java
package com.graphhire.auth.infrastructure.mail;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * 邮件服务
 * 负责发送验证码邮件，支持纯文本和 HTML 格式
 */
@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromMail;

    /**
     * 发送验证码邮件（纯文本）
     * @param to 收件人邮箱
     * @param subject 邮件主题
     * @param content 邮件内容
     */
    public void sendVerifyCodeMail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromMail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }

    /**
     * 发送 HTML 格式验证码邮件
     * @param to 收件人邮箱
     * @param subject 邮件主题
     * @param htmlContent HTML 内容
     */
    public void sendHtmlMail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromMail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("发送HTML邮件失败", e);
        }
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/main/java/com/graphhire/auth/infrastructure/mail/MailService.java
git add backend/src/main/resources/application.yml
git commit -m "feat: 添加邮件服务基础设施"
```

---

## Task 3: 重构 AuthAppService.sendVerifyCode

**Files:**
- Modify: `backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java`

- [ ] **Step 1: 修改 AuthAppService，注入 MailService 并重构 sendVerifyCode**

在类顶部添加:
```java
@Autowired
private MailService mailService;
```

替换 sendVerifyCode 方法:
```java
public void sendVerifyCode(String username, String type) {
    // 步骤1：生成6位随机验证码
    String code = String.format("%06d", new Random().nextInt(999999));

    // 步骤2：存储到 Redis（15分钟过期）
    String key = "email_code:" + username + ":" + type;
    redisTemplate.opsForValue().set(key, code, 15, TimeUnit.MINUTES);

    // 步骤3：发送邮件
    String subject = "【GraphHire】您的验证码";
    String content = "您的验证码是：" + code + "，15分钟内有效，请勿泄露给他人。";
    mailService.sendVerifyCodeMail(username, subject, content);
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java
git commit -m "feat: 重构sendVerifyCode使用真实邮件发送"
```

---

## Task 4: 修改注册接口增加验证码

**Files:**
- Modify: `backend/src/main/java/com/graphhire/auth/interfaces/dto/request/PersonRegisterRequest.java`
- Modify: `backend/src/main/java/com/graphhire/auth/interfaces/dto/request/CompanyRegisterRequest.java`
- Modify: `backend/src/main/java/com/graphhire/auth/application/command/PersonRegisterCmd.java`
- Modify: `backend/src/main/java/com/graphhire/auth/application/command/CompanyRegisterCmd.java`

- [ ] **Step 1: 修改 PersonRegisterRequest 增加 verifyCode**

添加字段:
```java
private String verifyCode;
```

添加 getter/setter:
```java
public String getVerifyCode() {
    return verifyCode;
}

public void setVerifyCode(String verifyCode) {
    this.verifyCode = verifyCode;
}
```

修改 toCmd():
```java
public com.graphhire.auth.application.command.PersonRegisterCmd toCmd() {
    com.graphhire.auth.application.command.PersonRegisterCmd cmd = new com.graphhire.auth.application.command.PersonRegisterCmd();
    cmd.setUsername(this.username);
    cmd.setPassword(this.password);
    cmd.setVerifyCode(this.verifyCode);
    return cmd;
}
```

- [ ] **Step 2: 修改 PersonRegisterCmd 增加 verifyCode**

添加字段:
```java
private String verifyCode;
```

添加 getter/setter:
```java
public String getVerifyCode() {
    return verifyCode;
}

public void setVerifyCode(String verifyCode) {
    this.verifyCode = verifyCode;
}
```

- [ ] **Step 3: 同样修改 CompanyRegisterRequest 和 CompanyRegisterCmd**

添加 `verifyCode` 字段、getter/setter、toCmd() 更新

- [ ] **Step 4: 提交**

```bash
git add backend/src/main/java/com/graphhire/auth/interfaces/dto/request/PersonRegisterRequest.java
git add backend/src/main/java/com/graphhire/auth/interfaces/dto/request/CompanyRegisterRequest.java
git add backend/src/main/java/com/graphhire/auth/application/command/PersonRegisterCmd.java
git add backend/src/main/java/com/graphhire/auth/application/command/CompanyRegisterCmd.java
git commit -m "feat: 注册接口增加验证码字段"
```

---

## Task 5: 重构注册逻辑先验证再注册

**Files:**
- Modify: `backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java`

- [ ] **Step 1: 重构 registerPerson 方法**

替换原 registerPerson 方法:
```java
public LoginResponse registerPerson(PersonRegisterCmd cmd) {
    // 步骤1：校验验证码
    validateVerifyCode(cmd.getUsername(), cmd.getVerifyCode(), "register");

    // 步骤2：检查用户名是否已存在
    if (userRepository.findByUsername(cmd.getUsername()).isPresent()) {
        throw com.graphhire.common.vo.Exceptions.BusinessException.of("用户已存在");
    }

    // 步骤3：创建用户并设置类型
    User user = new User();
    user.setUsername(com.graphhire.auth.domain.vo.Username.of(cmd.getUsername()));
    user.setUserType(UserType.PERSON);

    // 步骤4：注册（加密密码、设置状态、发布事件）
    user.register(cmd.getPassword());

    // 步骤5：保存用户
    userRepository.save(user);

    // 步骤6：Sa-Token 登录
    doLogin(user);

    // 步骤7：构建登录响应
    return buildLoginResponse(user);
}
```

- [ ] **Step 2: 重构 registerCompany 方法**

同样逻辑，先 validateVerifyCode，再检查存在性，再创建用户

- [ ] **Step 3: 添加 validateVerifyCode 私有方法**

```java
/**
 * 校验邮箱验证码
 * @param username 邮箱
 * @param code 用户输入的验证码
 * @param type 验证码类型（register/forgot_password）
 */
private void validateVerifyCode(String username, String code, String type) {
    if (code == null || code.isBlank()) {
        throw com.graphhire.common.vo.Exceptions.BusinessException.of("验证码不能为空");
    }
    String key = "email_code:" + username + ":" + type;
    String storedCode = redisTemplate.opsForValue().get(key);
    if (storedCode == null || !storedCode.equals(code)) {
        throw com.graphhire.common.vo.Exceptions.BusinessException.of("验证码错误或已过期");
    }
    // 验证成功后删除验证码（一次性使用）
    redisTemplate.delete(key);
}
```

- [ ] **Step 4: 提交**

```bash
git add backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java
git commit -m "feat: 重构注册流程为先验证再注册"
```

---

## Task 6: 重构忘记密码流程

**Files:**
- Modify: `backend/src/main/java/com/graphhire/auth/interfaces/controller/AuthController.java`
- Modify: `backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java`
- Create: `backend/src/main/java/com/graphhire/auth/application/command/ForgotPasswordCmd.java`

- [ ] **Step 1: 创建 ForgotPasswordCmd**

```java
package com.graphhire.auth.application.command;

public class ForgotPasswordCmd {
    private String username;
    private String verifyCode;
    private String newPassword;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getVerifyCode() {
        return verifyCode;
    }

    public void setVerifyCode(String verifyCode) {
        this.verifyCode = verifyCode;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
```

- [ ] **Step 2: 修改 AuthController.forgotPassword 接口**

修改为接收 JSON Body:

```java
@PostMapping("/forgot-password")
public Result<Void> forgotPassword(@RequestBody ForgotPasswordCmd cmd) {
    authService.forgotPassword(cmd);
    return Result.success();
}
```

修改 AuthAppService.forgotPassword 方法:
```java
public void forgotPassword(ForgotPasswordCmd cmd) {
    // 步骤1：校验验证码
    validateVerifyCode(cmd.getUsername(), cmd.getVerifyCode(), "forgot_password");

    // 步骤2：查询用户
    User user = userRepository.findByUsername(cmd.getUsername())
            .orElseThrow(() -> com.graphhire.common.vo.Exceptions.BusinessException.of("用户不存在"));

    // 步骤3：更新密码
    user.setPassword(com.graphhire.auth.domain.vo.EncryptedPassword.encode(cmd.getNewPassword()));
    userRepository.save(user);
}
```

删除原有的 `forgotPassword(String username)` 和 `resetPassword(String username, String code, String newPassword)` 方法

- [ ] **Step 3: 提交**

```bash
git add backend/src/main/java/com/graphhire/auth/application/command/ForgotPasswordCmd.java
git add backend/src/main/java/com/graphhire/auth/interfaces/controller/AuthController.java
git add backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java
git commit -m "feat: 重构忘记密码流程为验证码+新密码"
```

---

## Task 7: 验证实现

- [ ] **Step 1: 启动后端服务**

```bash
cd backend && mvn spring-boot:run
```

- [ ] **Step 2: 测试发送验证码**

```bash
curl -X POST "http://localhost:7777/auth/send-verify-code?email=test@example.com"
```

检查日志确认邮件发送成功（需要配置正确的 MAIL_USERNAME/MAIL_PASSWORD 环境变量）

- [ ] **Step 3: 测试注册流程**

```bash
# 1. 发送验证码
curl -X POST "http://localhost:7777/auth/send-verify-code?email=newuser@example.com"

# 2. 使用验证码注册（验证码从邮件中获取）
curl -X POST "http://localhost:7777/auth/register/person" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser@example.com","password":"test123","verifyCode":"123456"}'
```

- [ ] **Step 4: 测试忘记密码流程**

```bash
# 1. 发送验证码
curl -X POST "http://localhost:7777/auth/send-verify-code?email=existinguser@example.com"

# 2. 使用验证码重置密码
curl -X POST "http://localhost:7777/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"username":"existinguser@example.com","verifyCode":"123456","newPassword":"newpass123"}'
```

---

## Self-Review Checklist

1. **Spec coverage:** 
   - [x] 注册验证码 - Task 4, 5
   - [x] 忘记密码验证码 - Task 6
   - [x] 真实邮件发送 - Task 2, 3
   - [x] QQ SMTP 配置 - Task 1

2. **Placeholder scan:** 无 TBD/TODO，代码完整

3. **Type consistency:** 
   - `validateVerifyCode` 方法名一致
   - `PersonRegisterCmd.verifyCode` / `CompanyRegisterCmd.verifyCode` 类型一致
   - Redis key 格式一致：`email_code:{username}:{type}`
