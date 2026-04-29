# 企业头像后端改造设计说明

**日期：** 2026-04-29  
**主题：** company-avatar-backend

## 背景与目标

当前项目中，企业资料 `company` 表没有头像字段，公开公司列表接口也没有头像返回值。现有用户头像实现将数据库中的 RustFS 路径代理为后端二进制输出，但这条链路会让 Java 服务承担图片转发成本，不符合公开头像资源的主流交付方式。

本次改造只覆盖后端，目标如下：

- 为 `company` 表增加头像字段，并通过 SQL migration 与本地数据库变更保持一致。
- 企业头像上传到 RustFS 的 `resumes` bucket 下的 `avatar/` 目录。
- 所有后续新上传到 RustFS 的文件对象名统一使用 Hutool 雪花算法生成的唯一 ID，并保留原扩展名。
- 数据库存储稳定的对象标识，不存前端最终展示 URL。
- 后端在返回企业资料与公开公司列表时，拼好可直接访问的完整头像 URL 给前端。
- 公开头像资源由浏览器直连 RustFS 公网地址，不再由 Java 代理二进制。

## 范围

- 后端：
  - `company` 表增加头像路径字段。
  - RustFS 上传 key 生成策略统一改造。
  - 增加企业头像上传接口。
  - 扩展企业资料接口与公开公司接口，返回 `avatarUrl`。
  - 增加 RustFS 公网访问基地址配置。
- 数据库：
  - 在 `backend/src/main/resources/db/migration/` 新增迁移脚本。
  - 在 `backend/src/main/resources/db/schema.sql` 同步补齐字段定义。
  - 执行阶段允许使用 PostgreSQL MCP 直接校验本地表结构变更。
- 不包含：
  - 前端页面改造。
  - 历史 RustFS 对象重命名。
  - 旧数据回填头像。

## 现状问题

1. `company` 表当前无头像列，企业无法维护独立头像资源。
2. `PublicCompanyCardResponse` 当前只返回文本信息，用户端公司列表无法展示头像。
3. `RustFSClient.upload` 当前 key 规则为 `时间戳 + "_" + fileName`，不满足统一雪花 ID 命名要求。
4. 现有用户头像读取方式由 Java 服务下载并回传图片二进制，对公开头像场景来说不是最优链路。
5. `application.yml` 当前只有 RustFS endpoint/ak/sk/bucket 配置，没有独立的公网访问基地址配置，无法稳定拼装直连 URL。

## 方案对比

### 方案 A：数据库存对象路径，后端返回直连 URL，前端直连 RustFS

- 数据库保存 `avatar/<random>.<ext>` 这类稳定路径。
- 后端返回业务 DTO 时，基于配置项拼装完整访问 URL。
- 浏览器直接请求 RustFS 或其前置静态域名。

优点：
- 符合公开头像场景的主流方案。
- Java 服务不承担图片二进制代理带宽。
- 数据库存储与访问域名解耦，后续替换域名/CDN/签名策略时改动面小。

缺点：
- 需要补充公网访问基地址配置。
- 如果未来切换私有桶与签名 URL，需在返回 DTO 处统一组装访问地址。

### 方案 B：数据库存对象路径，后端代理图片二进制

- 数据库保存 `s3://bucket/key`。
- 前端请求 `/company/avatar/public/{companyId}`。
- Java 后端从 RustFS 下载图片并回传二进制。

优点：
- 控制力强，前端完全不知道 RustFS 访问地址。

缺点：
- Java 服务增加一跳 I/O 和带宽压力。
- 对公开头像这种高频静态资源不够主流。

### 结论

采用方案 A。数据库保留稳定对象路径，后端返回可直接访问的完整 URL，浏览器直连 RustFS。

## 设计方案

### 1) company 表与领域模型扩展

- `company` 表新增字段：
  - `avatar_path VARCHAR(500)`，允许为空。
- `backend/src/main/resources/db/migration/` 新增迁移脚本，例如：
  - `V2026_04_29_013__add_company_avatar_path.sql`
- `backend/src/main/resources/db/schema.sql` 中同步补充：
  - `avatar_path VARCHAR(500)`
  - 对应中文注释“企业头像对象路径”
- `Company` 领域模型新增字段：
  - `private String avatarPath;`
- `CompanyPO` 增加 `avatarPath` -> `avatar_path` 映射。
- `CompanyRepositoryImpl` 增加 `avatarPath` 的 Domain/PO 双向映射。

### 2) RustFS 对象名与目录策略

- 所有后续新上传对象统一使用：
  - `<folder>/<snowflakeId>.<ext>`
- 企业头像目录固定为：
  - `avatar/<snowflakeId>.<ext>`
- 由于 bucket 固定为 `resumes`，最终对象落点为：
  - `s3://resumes/avatar/<snowflakeId>.<ext>`
- 唯一 ID 使用 Hutool 雪花算法生成：
  - 例如 `IdUtil.getSnowflakeNextIdStr()`
- 扩展名沿用上传原文件扩展名，空扩展名回退为 `jpg`。

统一收口规则：

- `RustFSClient.upload` 不再强制在 key 前拼接时间戳。
- 业务方负责传入最终 key，例如 `avatar/1987654321098767360.png`。
- 这样后续简历、执照、头像等所有新上传场景都可以复用同一雪花 ID 命名规则，而不会叠加旧的时间戳前缀。

### 3) RustFS 公网访问 URL 组装

- 新增配置项，例如：
  - `rustfs.public-base-url`
- 本地开发可配置为类似：
  - `http://localhost:9000`
- 当 bucket 采用 path-style 公开访问时，最终访问 URL 规则为：
  - `<public-base-url>/<bucket>/<key>`
  - 例如 `http://localhost:9000/resumes/avatar/AbC123....png`

后端新增统一的 URL 组装方法：

- 输入：数据库中的 `avatarPath`
- 输出：完整 `avatarUrl`
- 若 `avatarPath` 为空，则返回 `null`
- 若配置缺失，则抛出明确异常或在启动检查中告警，避免返回不可用 URL

### 4) 企业头像上传接口

新增接口：

- `POST /company/avatar`

行为：

- 仅登录企业用户可调用。
- 校验文件大小（建议沿用 2MB 上限）。
- 校验 MIME 类型必须为 `image/*`。
- 生成 `avatar/<snowflakeId>.<ext>` 形式的 key。
- 调用 `RustFSClient.upload(bytes, key)` 上传。
- 将 `Company.avatarPath` 更新为该 key。
- 返回当前企业头像完整访问 URL。

关于旧头像：

- 本次不强制删除旧对象，避免上传失败与回滚耦合。
- 数据库只保留最新 `avatarPath`。
- 后续如需垃圾对象清理，可另开任务。

### 5) 企业资料接口返回值改造

当前 `GET /company/info` 直接返回领域模型 `Company`，不适合继续裸露内部存储字段。

本次改为引入专用 DTO，例如 `CompanyProfileResponse`，包含：

- `id`
- `userId`
- `name`
- `unifiedSocialCreditCode`
- `authStatus`
- `licenseUrl`
- `contactName`
- `contactPhone`
- `contactEmail`
- `description`
- `website`
- `industry`
- `scale`
- `address`
- `avatarUrl`

规则：

- 不向前端暴露内部 `avatarPath`
- `avatarUrl` 由后端基于 `avatarPath` 和 `rustfs.public-base-url` 组装

### 6) 公开公司列表与详情接口扩展

`PublicCompanyCardResponse` 增加：

- `String avatarUrl`

接口：

- `GET /public/companies`
- `GET /public/companies/{id}`

返回规则：

- 企业存在头像路径时，返回完整可访问头像 URL。
- 企业无头像时，返回 `null`。
- 仍然只返回已认证企业。

这样用户端公司列表和管理端企业审核列表在未来接入时，无需理解 RustFS 结构，只需消费 `avatarUrl`。

### 7) 数据库存储格式选择

本次数据库推荐只存对象 key：

- `avatar/<snowflakeId>.<ext>`

而不是完整 URL，也不是必须存 `s3://resumes/avatar/...`。

原因：

- key 更稳定，最不依赖当前访问域名。
- bucket 与访问域名由配置统一控制。
- 如果后续切换 CDN、代理域名或签名 URL，只需调整组装逻辑。
- 雪花 ID 具备全局唯一和时间有序特性，便于排障和对象追踪。

如果项目后续需要兼容旧值，可在 URL 组装器中兼容：

- 纯 key
- `s3://bucket/key`

但本次新写入统一采用纯 key。

### 8) 数据库变更执行策略

正式实现时同时做两件事：

1. 新增 migration SQL 到 `backend/src/main/resources/db/migration/`
2. 同步更新 `backend/src/main/resources/db/schema.sql`

开发校验时：

- 可以使用 PostgreSQL MCP 直接检查 `company` 表字段是否已新增
- 但代码库中的正式变更依据仍然是 migration SQL 与 schema 文件

## 错误处理

- 上传文件非图片：返回明确错误“只能上传图片文件”
- 上传文件超出限制：返回明确错误“文件大小不能超过2MB”
- 企业不存在或当前用户未绑定企业：返回业务异常
- RustFS 上传失败：返回“上传企业头像失败”
- `rustfs.public-base-url` 缺失：返回配置错误或启动告警，避免 silent failure
- 公开公司接口无头像时：`avatarUrl = null`，不视为错误

## 测试策略

### 后端单元测试

- `CompanyControllerTest`
  - 上传企业头像时校验类型、大小、上传调用与持久化更新
  - `GET /company/info` 返回 `avatarUrl` 而不是内部路径
- `CompanyRepositoryImplTest`
  - `avatarPath` 在 Domain/PO 双向映射中不丢失
- `RustFSClient` 相关测试
  - 上传时不再追加时间戳前缀
  - 传入雪花 ID key 可原样成为对象 key

### 后端集成测试

- `PublicCompanyControllerIT`
  - 公开公司列表返回 `avatarUrl`
  - 公开公司详情返回 `avatarUrl`
- 若已有控制器集成测试基类可复用，则新增企业头像上传 IT 覆盖真实控制器链路

### 数据库验证

- 校验 migration 可为 `company` 表新增 `avatar_path`
- 校验 `schema.sql` 与 migration 保持一致
- 可用 PostgreSQL MCP 或测试库 SQL 断言字段存在

## 验收口径

- `company` 表存在 `avatar_path` 字段，且 schema/migration 均已更新
- 企业用户可上传头像到 `resumes` bucket 下的 `avatar/` 目录
- 新上传对象 key 使用 Hutool 雪花 ID，不再使用时间戳加原文件名
- `GET /company/info` 返回 `avatarUrl`
- `GET /public/companies` 与 `GET /public/companies/{id}` 返回 `avatarUrl`
- 返回给前端的是完整可访问 URL，前端无需通过 Java 二进制代理读取头像
- 历史对象不迁移，但后续新上传全部遵循新命名策略
