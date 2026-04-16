# Hutool 全面引入实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 以 Hutool 工具集全面替换项目中手写的工具代码（P0/P1 优先级），提升代码简洁性、安全性和可维护性。

**架构：** 激进重构 — 覆盖 JSON处理、验证码生成、PO/Domain转换、日志、HTTP客户端、字符串/日期工具等场景。按 P0（必须）/P1（重要）/P2（可选）分批执行，每批相互独立。

**技术栈：** Hutool v5.8.25 (hutool-all)，Java 21，Spring Boot 3.4.5，MyBatis-Plus 3.5.10

---

## 文件变更总览

| 批次 | 文件 | 改造内容 |
|------|------|---------|
| P0-A | `DeepSeekClient.java` | JSONUtil + HttpRequest 替换手写解析和 RestTemplate |
| P0-B | `AuthAppService.java` | SecureUtil.randomNumbers() + StaticLog |
| P0-C | 9个 `*RepositoryImpl` | BeanUtil.copyProperties() 简化 PO/Domain 转换 |
| P0-D | `ParseAppService.java` | RuntimeException → 统一异常 + StaticLog |
| P1-A | `DocumentParser.java` | FileUtil/NioUtil 替换文件操作 |
| P1-B | `BaseEntity.java` | DateUtil.now() 替换 new Date() |
| P1-C | `Exceptions.java` | 保留，新增 `ExceptionUtil.getMessage()` 辅助 |
| P1-D | DTO/Request 类 | StrUtil.isBlank + Validator.isEmail 验证 |
| P1-E | `NotificationRepositoryImpl` | BeanUtil.copyProperties + StrUtil |
| P2-A | `IdUtil` 评估 | 各 Service 中的 UUID/ID 生成 |
| P2-B | `CollUtil` | RepositoryImpl 列表返回空安全处理 |

---

## 批次 P0-A：DeepSeekClient — JSON + HTTP

**文件：** `backend/src/main/java/com/graphhire/match/infrastructure/ai/DeepSeekClient.java`

**改动说明：**
- `RestTemplate` → `HttpRequest.post()` (hutool-http)
- 手写 JSON 解析 (`substring`+`split`) → `JSONUtil.parseObj()` + `JSONObject.getStr()` (hutool-json)
- `String.format()` → `StrUtil.format()` (hutool-core text)
- 手写正则 → `ReUtil` 或直接用 `JSONUtil`
- 移除 `new HashMap<>()` 显式声明 → `Map.of()` (JDK) 或直接 `JSONObject`

### 核心改造点

**改造前：**
```java
private final RestTemplate restTemplate = new RestTemplate();
// ...
try {
    String response = restTemplate.postForObject(endpoint, requestBody, String.class);
    return parseDeepSeekResponse(response);
} catch (Exception e) { ... }

// 手写解析:
int start = response.indexOf("{");
int end = response.lastIndexOf("}");
String json = response.substring(start, end + 1);
```

**改造后：**
```java
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import cn.hutool.core.text.StrUtil;
import cn.hutool.core.util.ReUtil;
// ...
HttpResponse httpResponse = HttpRequest.post(endpoint)
    .header("Content-Type", "application/json")
    .body(JSONUtil.toJsonStr(requestBody))
    .timeout(30000)
    .execute();
String response = httpResponse.body();
// JSON解析:
JSONObject jsonObj = JSONUtil.parseObj(response);
JSONObject choices = jsonObj.getJSONArray("choices").getJSONObject(0);
JSONObject message = choices.getJSONObject("message");
String content = message.getStr("content");
```

### 详细步骤

- [ ] **Step 1: 替换 import，移除 RestTemplate，引入 Hutool HTTP/JSON/StrUtil**

```java
// 新增 import（保留 RestTemplate 引用以便对比，下一步移除）
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import cn.hutool.core.text.StrUtil;
```

- [ ] **Step 2: 改造 `generateMatchReason()` — HTTP → HttpRequest，JSON → JSONUtil**

- [ ] **Step 3: 改造 `calculateMatch()` — 整个 HTTP 调用和响应解析链**

- [ ] **Step 4: 改造 `fallbackCalculateMatch()` — StrUtil.format 替换 String.format**

- [ ] **Step 5: 改造 `parseDeepSeekResponse()` — JSONUtil.parseObj 替换 substring/split**

- [ ] **Step 6: 改造 `parseResume()` 和 `parseJob()` — HttpRequest + JSONUtil**

- [ ] **Step 7: 移除 RestTemplate 字段声明 `private final RestTemplate restTemplate = new RestTemplate();`**

- [ ] **Step 8: 编译验证 — `cd backend && mvn compile -q`**

---

## 批次 P0-B：AuthAppService — 验证码 + 日志

**文件：** `backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java`

### 改动1：验证码生成

**改造前：**
```java
String code = String.format("%06d", new Random().nextInt(999999));
```

**改造后：**
```java
import cn.hutool.crypto.SecureUtil;
// ...
String code = SecureUtil.randomNumbers(6); // 生成6位纯数字随机字符串
```

### 改动2：System.out.println → StaticLog

**改造前：**
```java
System.out.println("Sending verification code " + code + " to " + username);
```

**改造后：**
```java
import cn.hutool.log.StaticLog;
// ...
StaticLog.info("发送验证码: code={}, to={}", code, username);
```

### 详细步骤

- [ ] **Step 1: 新增 import：`cn.hutool.crypto.SecureUtil` 和 `cn.hutool.log.StaticLog`**

- [ ] **Step 2: `sendVerifyCode()` 中的 `new Random()` → `SecureUtil.randomNumbers(6)`**

- [ ] **Step 3: `System.out.println` → `StaticLog.info`**

- [ ] **Step 4: 移除废弃的 `import java.util.Random`**

- [ ] **Step 5: 编译验证 — `cd backend && mvn compile -q`**

---

## 批次 P0-C：RepositoryImpl PO/Domain 转换 — BeanUtil

**涉及文件（9个）：**
1. `backend/src/main/java/com/graphhire/notification/infrastructure/persistence/repository/NotificationRepositoryImpl.java`
2. `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/JobRepositoryImpl.java`
3. `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/ResumeRepositoryImpl.java`
4. `backend/src/main/java/com/graphhire/skill/infrastructure/persistence/repository/SkillTagRepositoryImpl.java`
5. `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyRepositoryImpl.java`
6. `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyStaffRepositoryImpl.java`
7. `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/JobSkillRepositoryImpl.java`
8. `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/ParseTaskRepositoryImpl.java`
9. `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/PersonInfoRepositoryImpl.java`

**重要原则：** PO/Domain 字段名一致且类型相同的才能用 `BeanUtil.copyProperties`。涉及枚举转换、字段名映射、类型转换的地方仍需保留手动转换。

### 改造策略

**可以直接用 BeanUtil.copyProperties 的场景（字段名和类型完全一致）：**

- `CompanyStaffRepositoryImpl.toDomain/toPO` — 字段完全对应
- `JobSkillRepositoryImpl.toDomain/toPO` — 字段完全对应
- `ParseTaskRepositoryImpl.toDomain/toPO` — 字段完全对应（但需保留 Date 引用同一对象）
- `NotificationRepositoryImpl.toDomain/toPO` — 字段完全对应（需注意 NotificationType enum 映射）

**需要 CopyOptions 精细控制的场景：**

- `CompanyRepositoryImpl` — `companyName`(PO) ↔ `name`(Domain)，`licensePath`(PO) ↔ `licenseUrl`(Domain)

**需要保留手动转换的场景（类型/枚举不一致）：**

- `JobRepositoryImpl` — `status` 是 JobStatus 枚举
- `ResumeRepositoryImpl` — `parseStatus` 是 ParseStatus 枚举 ordinal
- `SkillTagRepositoryImpl` — `category` 是 SkillCategory 枚举
- `UserRepositoryImpl` — `userType`/`status` 枚举映射太复杂，保留
- `MatchRecordRepositoryImpl` — MatchScore 复合对象 + BigDecimal，保留
- `PersonInfoRepositoryImpl` — 字段完全对应，可用 BeanUtil

### 详细步骤

**Task P0-C-1: CompanyStaffRepositoryImpl**

- [ ] **Step 1: 新增 import：`cn.hutool.core.bean.BeanUtil`**
- [ ] **Step 2: toDomain() — 逐字段 set 替换为 `BeanUtil.copyProperties(po, staff, CopyOptions.create().ignoreNullValue().get())`**
- [ ] **Step 3: toPO() — 同样替换**
- [ ] **Step 4: 编译验证**

**Task P0-C-2: JobSkillRepositoryImpl**

- [ ] **Step 1: 新增 import：`cn.hutool.core.bean.BeanUtil`**
- [ ] **Step 2: toDomain() — BeanUtil.copyProperties 替换逐字段 set**
- [ ] **Step 3: toPO() — 同样替换**
- [ ] **Step 4: 编译验证**

**Task P0-C-3: ParseTaskRepositoryImpl**

- [ ] **Step 1: 新增 import：`cn.hutool.core.bean.BeanUtil`，注意保留 Date 字段单独处理**
- [ ] **Step 2: toDomain() — BeanUtil.copyProperties，但 createdAt/startedAt/completedAt 需保留手动赋值（因为类型一致但来源是 PO 同一引用）**
- [ ] **Step 3: toPO() — 同上**
- [ ] **Step 4: 编译验证**

**Task P0-C-4: NotificationRepositoryImpl**

- [ ] **Step 1: 新增 import：`cn.hutool.core.bean.BeanUtil`，注意 NotificationType 是枚举需单独处理**
- [ ] **Step 2: toDomain() — BeanUtil.copyProperties，但 type 字段（NotificationType）需手动 set**
- [ ] **Step 3: toPO() — BeanUtil.copyProperties，但 type 字段需手动 fromDomain().getValue()**
- [ ] **Step 4: 编译验证**

**Task P0-C-5: CompanyRepositoryImpl**

- [ ] **Step 1: 新增 import：`cn.hutool.core.bean.BeanUtil` 和 `cn.hutool.core.bean.CopyOptions`**
- [ ] **Step 2: toDomain() — BeanUtil.copyProperties，用 CopyOptions 设置字段映射 `companyName→name`、`licensePath→licenseUrl`**
- [ ] **Step 3: toPO() — BeanUtil.copyProperties，用 CopyOptions 设置反向映射**
- [ ] **Step 4: 编译验证**

**Task P0-C-6: PersonInfoRepositoryImpl**

- [ ] **Step 1: 新增 import：`cn.hutool.core.bean.BeanUtil`**
- [ ] **Step 2: toDomain() — BeanUtil.copyProperties 替换逐字段 set**
- [ ] **Step 3: toPO() — 同样替换**
- [ ] **Step 4: 编译验证**

**Task P0-C-7: JobRepositoryImpl — 部分改造**

- [ ] **Step 1: 新增 import：`cn.hutool.core.bean.BeanUtil`**
- [ ] **Step 2: toDomain() — BeanUtil.copyProperties 简化基础字段复制，status 枚举仍保留手动转换**
- [ ] **Step 3: toPO() — 同上**
- [ ] **Step 4: 编译验证**

**Task P0-C-8: ResumeRepositoryImpl — 部分改造**

- [ ] **Step 1: 新增 import：`cn.hutool.core.bean.BeanUtil`**
- [ ] **Step 2: toDomain() — BeanUtil.copyProperties，parseStatus ordinal 枚举转换保留**
- [ ] **Step 3: toPO() — 同上**
- [ ] **Step 4: 编译验证**

**Task P0-C-9: SkillTagRepositoryImpl — 部分改造**

- [ ] **Step 1: 新增 import：`cn.hutool.core.bean.BeanUtil`**
- [ ] **Step 2: toDomain() — BeanUtil.copyProperties，category 枚举转换保留**
- [ ] **Step 3: toPO() — 同上**
- [ ] **Step 4: 编译验证**

---

## 批次 P0-D：ParseAppService — 日志 + 异常

**文件：** `backend/src/main/java/com/graphhire/resume/application/service/ParseAppService.java`

### 改动1：RuntimeException → 统一异常 + StaticLog

**改造前：**
```java
} catch (Exception e) {
    task.markFailed(e.getMessage());
    parseTaskRepository.save(task);
    resume.parseFailed(e.getMessage());
    resumeRepository.save(resume);
}
```

**改造后：**
```java
import cn.hutool.log.StaticLog;
import cn.hutool.core.exceptions.ExceptionUtil;
// ...
} catch (RuntimeException e) {
    StaticLog.error("简历解析失败: resumeId={}, error={}", resumeId, ExceptionUtil.getMessage(e));
    task.markFailed(ExceptionUtil.getMessage(e));
    parseTaskRepository.save(task);
    resume.parseFailed(ExceptionUtil.getMessage(e));
    resumeRepository.save(resume);
}
```

### 详细步骤

- [ ] **Step 1: 新增 import：`cn.hutool.log.StaticLog` 和 `cn.hutool.core.exceptions.ExceptionUtil`**
- [ ] **Step 2: catch (Exception e) → catch (RuntimeException e)**
- [ ] **Step 3: e.getMessage() → ExceptionUtil.getMessage(e)**
- [ ] **Step 4: 添加 StaticLog.error 记录异常日志**
- [ ] **Step 5: 编译验证**

---

## 批次 P1-A：DocumentParser — 文件操作

**文件：** `backend/src/main/java/com/graphhire/resume/infrastructure/ai/DocumentParser.java`

**改造前：**
```java
Path path = Paths.get(filePath);
if (Files.exists(path)) {
    try (InputStream stream = Files.newInputStream(path)) {
        return tika.parseToString(stream);
    }
}
```

**改造后：**
```java
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.nio.NioUtil;
// ...
// 步骤1：尝试作为本地文件读取
if (FileUtil.exist(filePath)) {
    byte[] bytes = NioUtil.readBytes(FileUtil.getInputStream(filePath));
    return tika.parseToString(new ByteArrayInputStream(bytes));
}
```

- [ ] **Step 1: 新增 import：`cn.hutool.core.io.FileUtil`、`cn.hutool.core.nio.NioUtil`**
- [ ] **Step 2: 改造 extractText() 中的 Files/Paths 调用为 FileUtil/NioUtil**
- [ ] **Step 3: 编译验证**

---

## 批次 P1-B：BaseEntity — DateUtil

**文件：** `backend/src/main/java/com/graphhire/common/model/BaseEntity.java`

### 改造前：
```java
this.createdAt = new Date();
this.updatedAt = new Date();
```

### 改造后：
```java
import cn.hutool.core.date.DateUtil;
// ...
this.createdAt = DateUtil.date();  // 等价于 new Date() 但性能更好
this.updatedAt = DateUtil.date();
```

- [ ] **Step 1: 新增 import：`cn.hutool.core.date.DateUtil`**
- [ ] **Step 2: 替换 new Date() → DateUtil.date()**
- [ ] **Step 3: 编译验证**

---

## 批次 P1-C：Exceptions — 异常辅助

**文件：** `backend/src/main/java/com/graphhire/common/vo/Exceptions.java`

**原则：** 不改现有异常类结构，新增 Hutool 辅助。

- [ ] **Step 1: 新增 import：`cn.hutool.core.exceptions.ExceptionUtil`**
- [ ] **Step 2: BusinessException 等异常类中不改动，但 Service 层 catch 后统一用 `ExceptionUtil.getMessage(e)` 提取消息**
- [ ] **Step 3: （此文件本身不做大改，Exceptions 是稳定的基础设施）**

---

## 批次 P1-D：DTO/Request — 验证注解

**涉及文件：**
1. `backend/src/main/java/com/graphhire/auth/interfaces/dto/request/LoginRequest.java`
2. `backend/src/main/java/com/graphhire/auth/interfaces/dto/request/PersonRegisterRequest.java`
3. `backend/src/main/java/com/graphhire/auth/interfaces/dto/request/CompanyRegisterRequest.java`
4. `backend/src/main/java/com/graphhire/job/interfaces/dto/request/CreateStaffRequest.java`
5. `backend/src/main/java/com/graphhire/job/interfaces/dto/request/StatusChangeRequest.java`
6. `backend/src/main/java/com/graphhire/resume/interfaces/dto/request/PersonUpdateRequest.java`

### 改造策略

Hutool Validator 用于**编程式校验**（在 Service 层调用），而非替换 Jakarta Validation 注解。两者结合：
- 已有 `@NotBlank`/`@Email` 等注解的字段，继续用注解
- 需要**更灵活的业务规则校验**（如手机号格式、URL有效性），在 Service 层用 `Validator.isMobile()` / `Validator.isEmail()`

**AuthAppService 中增加邮箱格式校验：**
```java
import cn.hutool.core.lang.Validator;
// 在 sendVerifyCode/forgotPassword 中:
if (!Validator.isEmail(username)) {
    throw Exceptions.BusinessException.of("邮箱格式不正确");
}
```

- [ ] **Step 1: AuthAppService 中增加 `Validator.isEmail()` 校验**
- [ ] **Step 2: 编译验证**

---

## 批次 P2-A：IdUtil 评估

**涉及文件（待定）：**
- `backend/src/main/java/com/graphhire/auth/application/command/SendVerifyCodeCmd.java` — 当前 key 拼接方式
- `backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java` — refreshToken key

**评估策略：** 检查当前 ID/Token 生成方式，评估是否需要从拼接方案改为 `IdUtil.simpleUUID()`。如果当前方案（如 Redis key 拼接）工作正常，可不改。

- [ ] **Step 1: 审计当前 ID/Token 生成代码**
- [ ] **Step 2: 如果需要改，再引入 IdUtil**

---

## 批次 P2-B：CollUtil 集合空安全

**涉及文件：** 各 `*RepositoryImpl` 的 `findAll()` / `findByXxx()` 返回空列表场景

**改造策略：** 当 `selectList` 返回可能为 null 时，用 `CollUtil.emptyIfNull()` 包装：

```java
import cn.hutool.core.collection.CollUtil;
// ...
List<Job> jobs = CollUtil.emptyIfNull(jobMapper.selectList(wrapper))
    .stream().map(this::toDomain).toList();
```

- [ ] **Step 1: 审计各 RepositoryImpl 中的 `selectList` 返回是否存在 null 风险**
- [ ] **Step 2: 对有风险的点引入 CollUtil.emptyIfNull()**

---

## 编译验证命令

所有批次完成后，执行总体验证：

```bash
cd backend && mvn compile -q
```

若编译通过，再启动应用验证：

```bash
cd backend && mvn spring-boot:run
```

---

## 提交策略

每完成 2-3 个 Task 即提交一次，commit message 格式：
```
refactor: 使用 Hutool 简化 [模块名]

- JSON解析改用 JSONUtil
- 验证码生成改用 SecureUtil.randomNumbers
- PO/Domain转换改用 BeanUtil.copyProperties
```

总完成后创建 PR。
