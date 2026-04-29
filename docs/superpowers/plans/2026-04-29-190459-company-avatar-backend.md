# 企业头像后端改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为企业资料增加头像存储与返回能力，落地 `company.avatar_path`、RustFS `resumes/avatar/` 上传、Hutool 雪花对象名，以及面向前端的完整 `avatarUrl` 返回。

**Architecture:** 后端以 `company.avatar_path` 保存稳定对象 key，上传时使用 Hutool 雪花算法生成 `avatar/<snowflakeId>.<ext>`，由 `RustFSClient` 原样写入 RustFS。企业资料与公开公司接口通过新增 URL 组装逻辑返回完整 `avatarUrl`，浏览器后续直接访问 RustFS 公网地址，不再依赖 Java 二进制代理。

**Tech Stack:** Spring Boot, MyBatis-Plus, PostgreSQL, Hutool, AWS S3 SDK, JUnit 5, Mockito, MockMvc

---

### Task 1: 先补数据库与仓储映射失败测试

**Files:**
- Modify: `backend/src/test/java/com/graphhire/job/infrastructure/persistence/repository/CompanyRepositoryImplTest.java`
- Modify: `backend/src/main/java/com/graphhire/job/domain/model/Company.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/po/CompanyPO.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyRepositoryImpl.java`

- [ ] Step 1: 在 `CompanyRepositoryImplTest` 增加 `avatarPath` 映射断言，覆盖 `findById` 和 `save` 两个方向
- [ ] Step 2: 运行 `mvn -Dtest=CompanyRepositoryImplTest test` 确认因缺少 `avatarPath` 字段或映射而失败
- [ ] Step 3: 在 `Company`、`CompanyPO`、`CompanyRepositoryImpl` 中补齐 `avatarPath` 字段和双向映射的最小实现
- [ ] Step 4: 重新运行 `mvn -Dtest=CompanyRepositoryImplTest test` 确认仓储测试通过

### Task 2: 先补 RustFS key 策略失败测试

**Files:**
- Create: `backend/src/test/java/com/graphhire/resume/infrastructure/file/RustFSClientTest.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/file/RustFSClient.java`

- [ ] Step 1: 新增 `RustFSClientTest`，断言 `upload(bytes, "avatar/123.png")` 最终写入 S3 的 key 仍为 `avatar/123.png`
- [ ] Step 2: 运行 `mvn -Dtest=RustFSClientTest test` 确认当前实现因自动追加时间戳前缀而失败
- [ ] Step 3: 将 `RustFSClient.upload` 改为原样使用调用方传入 key，同时保持 bucket 检查与 content-type 推断逻辑不变
- [ ] Step 4: 重新运行 `mvn -Dtest=RustFSClientTest test` 确认测试通过

### Task 3: 先补企业头像上传与资料 DTO 失败测试

**Files:**
- Modify: `backend/src/test/java/com/graphhire/job/interfaces/controller/CompanyControllerTest.java`
- Create: `backend/src/main/java/com/graphhire/job/interfaces/dto/response/CompanyProfileResponse.java`
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`
- Modify: `backend/src/main/java/com/graphhire/job/application/service/CompanyAppService.java`

- [ ] Step 1: 在 `CompanyControllerTest` 增加企业头像上传成功、非图片失败、超限失败、`getCompanyInfo` 返回 `avatarUrl` 的用例
- [ ] Step 2: 运行 `mvn -Dtest=CompanyControllerTest test` 确认新增用例失败
- [ ] Step 3: 最小实现 `POST /company/avatar`、`CompanyProfileResponse`、雪花 key 生成、`GET /company/info` DTO 化返回
- [ ] Step 4: 重新运行 `mvn -Dtest=CompanyControllerTest test` 确认控制器测试通过

### Task 4: 先补公开公司头像返回失败测试

**Files:**
- Modify: `backend/src/test/java/com/graphhire/publicapi/interfaces/controller/it/PublicCompanyControllerIT.java`
- Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/dto/response/PublicCompanyCardResponse.java`
- Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicCompanyController.java`

- [ ] Step 1: 在 `PublicCompanyControllerIT` 为列表和详情增加 `avatarUrl` 断言，并覆盖无头像时返回 `null`
- [ ] Step 2: 运行 `mvn -Dtest=PublicCompanyControllerIT test` 确认因 DTO 缺字段或未组装 URL 而失败
- [ ] Step 3: 扩展 `PublicCompanyCardResponse` 与 `PublicCompanyController.toCard(...)`，按配置拼接完整 `avatarUrl`
- [ ] Step 4: 重新运行 `mvn -Dtest=PublicCompanyControllerIT test` 确认公开接口测试通过

### Task 5: 先补配置与 URL 组装失败测试

**Files:**
- Create: `backend/src/test/java/com/graphhire/job/interfaces/dto/response/CompanyAvatarUrlResolverTest.java`
- Create: `backend/src/main/java/com/graphhire/job/interfaces/dto/response/CompanyAvatarUrlResolver.java`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `backend/src/main/java/com/graphhire/config/RustFSConfig.java`

- [ ] Step 1: 新增 URL 组装测试，覆盖 `avatar/<id>.png` 转完整 URL、空路径返回 `null`、兼容 `s3://bucket/key` 解析三种行为
- [ ] Step 2: 运行 `mvn -Dtest=CompanyAvatarUrlResolverTest test` 确认失败
- [ ] Step 3: 新建 URL 组装组件，加入 `rustfs.public-base-url` 配置，并让公司资料与公开公司接口统一复用它
- [ ] Step 4: 重新运行 `mvn -Dtest=CompanyAvatarUrlResolverTest test` 确认通过

### Task 6: 落地数据库 schema 与 migration

**Files:**
- Modify: `backend/src/main/resources/db/schema.sql`
- Create: `backend/src/main/resources/db/migration/V2026_04_29_013__add_company_avatar_path.sql`

- [ ] Step 1: 先写 migration SQL，为 `company` 表新增 `avatar_path` 字段及注释
- [ ] Step 2: 同步更新 `schema.sql` 中的 `company` 表结构和字段注释
- [ ] Step 3: 使用 PostgreSQL MCP 或测试 SQL 校验 `company.avatar_path` 字段定义与 migration/schema 一致
- [ ] Step 4: 复核 migration 文件编号与当前目录现有版本不冲突

### Task 7: 汇总后端专项测试

**Files:**
- No new code files expected

- [ ] Step 1: 运行 `mvn -Dtest=CompanyRepositoryImplTest,RustFSClientTest,CompanyControllerTest,PublicCompanyControllerIT,CompanyAvatarUrlResolverTest test`
- [ ] Step 2: 若有失败，按失败点回到对应任务最小修复并重跑上述命令
- [ ] Step 3: 确认专项测试全部通过且覆盖 AC-003 至 AC-015 的核心后端行为

### Task 8: 全量验证与浏览器联调

**Files:**
- No new code files expected

- [ ] Step 1: 运行 `mvn compile`
- [ ] Step 2: 运行 `mvn test`
- [ ] Step 3: 运行 `npm run build`
- [ ] Step 4: 运行 `npm run test:run`
- [ ] Step 5: 按 AGENTS 要求通过 `/web-access` + CDP 打开相关页面，验证企业头像接口返回的 `avatarUrl` 可被页面正常加载
- [ ] Step 6: 检查 `git diff`、整理变更并准备进入代码评审与收尾流程
