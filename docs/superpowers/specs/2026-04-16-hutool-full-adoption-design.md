# 全面引入 Hutool 工具集重构设计

## 1. 背景与目标

**现状问题：**
- Hutool (v5.8.25) 已引入，但仅使用 `BCrypt` 密码加密
- `DeepSeekClient` 手动解析 JSON 和正则，代码冗长脆弱
- `AuthAppService` 用 `new Random()` 生成验证码，安全性和可读性差
- 各 Repository 实现中 PO/Domain 转换用大量 setter，重复且易错
- `System.out.println` 发送验证码，生产环境不可用
- 日期、字符串、集合等操作分散且不统一

**目标：**
以 Hutool 工具集全面替换手写工具代码，提升代码简洁性、可读性、安全性和可维护性。

**激进程度：** 激进重构 — 覆盖所有可用场景，不止于表面替换。

---

## 2. 改造范围与模块对应

### 2.1 JSON 处理 — `hutool-json`

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| `DeepSeekClient.java` | 手动 `substring` + `split` 解析 JSON | `JSONUtil.parseObj()` + `JSONObject.getStr()` |
| `DeepSeekClient.java` | 手动正则提取 JSON 片段 | `ReUtil` + `JSONUtil` |

### 2.2 字符串处理 — `hutool-core` (text)

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| `Exceptions.java` | 手动异常类定义 | 保留，异常体系需稳定 |
| 各 DTO/PO | 手写 `isBlank()` 判断 | `StrUtil.isBlank()` / `StrUtil.isNotBlank()` |
| 各 Service | 字符串拼接 `+` | `StrUtil.format()` |
| `DeepSeekClient` | `String.format()` | `StrUtil.format()` |

### 2.3 PO/Domain 转换 — `hutool-core` (bean)

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| `NotificationRepositoryImpl` | 逐字段 `setXxx()` | `BeanUtil.copyProperties(src, dest)` |
| 所有 `*RepositoryImpl` | 同上 | 同上 |
| `PersonInfoResponse.toCmd()` | 逐字段手写 | `BeanUtil.toBean()` / `copyProperties()` |

### 2.4 日期处理 — `hutool-core` (date)

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| `BaseEntity` (createdAt/updatedAt) | `new Date()` | `DateUtil.now()` |
| 各 PO/Entity 的 createdAt/updatedAt | 手动 set | `DateUtil.date()` |
| 时间戳计算 | `System.currentTimeMillis()` | `DateUtil.current()` |

### 2.5 验证码生成 — `hutool-crypto`

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| `AuthAppService.sendVerifyCode()` | `new Random().nextInt(999999)` | `SecureUtil.randomNumbers(6)` 或 `IdUtil.randomUUID()` |

### 2.6 HTTP 客户端 — `hutool-http`

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| `DeepSeekClient` | `RestTemplate` | `HttpRequest.post()` + `HttpUtil` |
| 未来 `NotificationAppService` 发送邮件 | 预留 | `MailUtil.send()` |

### 2.7 ID 生成 — `hutool-core` (util)

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| `ParseTask.id` | 数据库自增 | 评估是否切 `IdUtil.getSnowflakeNextId()` |
| 各类 Token/Key | 手动拼接 | `IdUtil.simpleUUID()` |

### 2.8 格式验证 — `hutool-core` (lang)

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| `LoginRequest` / `PersonRegisterRequest` | 无验证 | `Validator.isEmail()` / `Validator.isMobile()` |
| `AuthAppService` 邮箱格式校验 | 手动判断 | `Validator.isEmail()` |

### 2.9 日志 — `hutool-log`

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| `AuthAppService.sendVerifyCode()` | `System.out.println()` | `StaticLog.info()` |
| `ParseAppService` | `RuntimeException` | 统一异常 + `StaticLog` |

### 2.10 集合操作 — `hutool-core` (collection)

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| 各 Repository `selectList` 后 `stream().map().toList()` | 手写 | `CollUtil.emptyIfNull(list).stream().map(...).toList()` |
| 各 `*RepositoryImpl` 列表返回 | `pos.stream().map(this::toDomain).toList()` | 保留但简化 toDomain |

### 2.11 反射操作 — `hutool-core` (reflect)

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| PO/Domain 转换中字段反射 | 通过 `setFieldValue()` | `BeanUtil.copyProperties` 已封装 |

### 2.12 文件操作 — `hutool-core` (io)

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| `DocumentParser.extractText()` | `Files.newInputStream()` + `Paths.get()` | `FileUtil.readBytes()` / `NioUtil` |
| 临时文件创建/删除 | `new File()` + `deleteOnExit()` | `FileUtil.createTempFile()` / `FileUtil.del()` |

### 2.13 异常处理 — `hutool-core` (util)

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| 各 Service 中 `e.getMessage()` | 直接透出 | `ExceptionUtil.getMessage()` |
| 各 Service 捕获异常后处理 | `catch (Exception e) {}` | `catch (RuntimeException e) {}` + `StaticLog` |

### 2.14 JWT — `hutool-jwt`

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| `AuthAppService.refreshToken()` | Sa-Token 自有机制 | JWT 补充（可选，Sa-Token 已够用则保留） |

### 2.15 缓存 — `hutool-cache`

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| `AuthAppService` 邮箱验证码 | `StringRedisTemplate` | 保留 Redis，但可用 `CacheUtil.newTimedCache()` 做本地防刷 |

### 2.16 加密摘要 — `hutool-crypto`

| 文件 | 当前实现 | 改造后 |
|------|---------|--------|
| `PasswordEncoder` | 已有 `BCrypt` | 扩展增加 `SecureUtil.md5Hex()` 辅助方法 |
| 其他散列需求 | 无 | 评估 `DigestUtil` |

---

## 3. 不纳入本次改造的范围

| 范围 | 原因 |
|------|------|
| MyBatis-Plus 查询（`LambdaQueryWrapper`） | MyBatis-Plus 自身已是成熟方案，与 Hutool 定位不重叠 |
| Sa-Token 认证 | Sa-Token 是专用的认证框架，替换为 Hutool JWT 意义不大 |
| `Result<T>` 统一响应类 | 已是成熟的基础设施，且 Hutool 无对应物 |
| `PageQuery` / `PageResult` | 分页模型稳定，Hutool 的 `Page` 需评估兼容性 |
| Spring Data Redis 操作 | `StringRedisTemplate` 已是标准，已通过 Hutool BCrypt 验证可用 |
| 数据库事务（`@Transactional`） | Spring 基础设施，与 Hutool 无关 |

---

## 4. 改造优先级

**P0（必须，高频使用）：**
1. `DeepSeekClient` JSON 解析 → `JSONUtil`
2. `AuthAppService` 验证码生成 → `SecureUtil.randomNumbers(6)`
3. 所有 `*RepositoryImpl` PO/Domain 转换 → `BeanUtil.copyProperties()`
4. `System.out.println` → `StaticLog`

**P1（重要，改善明显）：**
5. `StrUtil` 替换字符串操作
6. `DateUtil` 替换日期创建/格式化
7. `Validator` 邮箱/手机号格式验证
8. `HttpUtil` / `HttpRequest` 替换 `RestTemplate`

**P2（可选，长期收益）：**
9. `IdUtil` 评估 ID 生成方案
10. `FileUtil` / `NioUtil` 统一文件操作
11. `CollUtil` 集合空安全处理
12. `CacheUtil` 本地防刷缓存

---

## 5. 改造原则

1. **不动业务逻辑** — 只替换工具代码，不改变任何业务行为
2. **逐文件改造** — 一个文件改完验证后再改下一个
3. **测试覆盖** — 关键逻辑改造后通过实际调用验证
4. **向后兼容** — PO/Domain 字段名不一致时用 `CopyOptions` 精细控制
5. **渐进式** — 不强求一次全部改完，按优先级分批提交

---

## 6. 预期收益

| 维度 | 改善 |
|------|------|
| 代码行数 | PO/Domain 转换减少约 40% 重复代码 |
| 可读性 | `BeanUtil.copyProperties()` 一行替代 15 行 setter |
| 安全性 | 验证码从 `Random` 升级为 `SecureUtil` |
| 健壮性 | `JSONUtil.parseObj()` 替代手写正则，无解析崩溃风险 |
| 一致性 | 日期/字符串/集合操作全部统一到 Hutool |
