# Acceptance Criteria: 企业头像后端改造

**Spec:** `docs/superpowers/specs/2026-04-29-190459-company-avatar-backend-design.md`
**Date:** 2026-04-29
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | `company` 表新增 `avatar_path` 字段且允许为空 | API | 已执行本次 migration SQL 或在测试库加载最新 schema | 通过 SQL 查询 `information_schema.columns` 能查到 `company.avatar_path`，类型为字符型且默认不要求非空 |
| AC-002 | `schema.sql` 中的 `company` 表定义与迁移脚本一致包含 `avatar_path` | Logic | 代码库包含最新 `backend/src/main/resources/db/schema.sql` 与 migration 文件 | 代码审查可见 `company` 建表语句与 migration 都包含 `avatar_path` 字段及对应注释 |
| AC-003 | 企业头像上传接口只接受图片文件 | API | 已登录企业用户，准备一个 `text/plain` 文件发往 `POST /company/avatar` | 接口返回失败，错误信息明确指出只能上传图片文件 |
| AC-004 | 企业头像上传接口限制文件大小不超过 2MB | API | 已登录企业用户，准备一个大于 2MB 的图片文件发往 `POST /company/avatar` | 接口返回失败，错误信息明确指出文件大小不能超过 2MB |
| AC-005 | 企业头像上传成功后对象 key 位于 `resumes` bucket 的 `avatar/` 目录 | Logic | `CompanyController` 上传测试中 mock `RustFSClient.upload` 并捕获传入 key | 捕获到的 key 以 `avatar/` 开头，且未包含原有时间戳前缀拼接逻辑 |
| AC-006 | 企业头像上传成功后对象名使用 Hutool 雪花算法生成的 ID 并保留原扩展名 | Logic | `CompanyController` 上传测试中捕获传入 key，上传文件名包含合法扩展名 | 捕获到的 key 形如 `avatar/<纯数字雪花ID>.<ext>`，文件扩展名与上传源文件一致；无扩展名时回退为 `jpg` |
| AC-007 | `RustFSClient.upload` 使用调用方传入的 key 作为最终对象 key，不再自动追加时间戳前缀 | Logic | 针对 `RustFSClient.upload` 的单元测试传入固定 key | S3 putObject 的 key 与传入 key 完全一致，不额外追加 `System.currentTimeMillis()` 前缀 |
| AC-008 | 企业头像上传成功后会把 `avatar_path` 保存到企业资料中 | Logic | `CompanyController` 上传测试中 mock 当前用户所属企业并捕获仓储保存对象 | 保存后的 `Company.avatarPath` 与上传 key 一致 |
| AC-009 | `GET /company/info` 返回 `avatarUrl`，不暴露内部 `avatarPath` | API | 已登录企业用户，数据库中该企业有 `avatar_path` 值且配置了 `rustfs.public-base-url` | 响应 JSON 含 `avatarUrl` 完整访问地址，不包含 `avatarPath` 字段 |
| AC-010 | `GET /company/info` 在企业无头像时返回 `avatarUrl = null` | API | 已登录企业用户，数据库中该企业 `avatar_path` 为空 | 响应成功且 `avatarUrl` 字段为 `null` |
| AC-011 | `GET /public/companies` 为已认证企业返回可直接访问的 `avatarUrl` | API | 测试库中存在已认证企业、设置了 `avatar_path`、并配置了 `rustfs.public-base-url` | 列表响应的企业卡片包含完整 `avatarUrl`，值形如 `<public-base-url>/resumes/avatar/<snowflakeId>.<ext>` |
| AC-012 | `GET /public/companies/{id}` 为已认证企业返回可直接访问的 `avatarUrl` | API | 测试库中存在已认证企业、设置了 `avatar_path`、并配置了 `rustfs.public-base-url` | 详情响应包含完整 `avatarUrl`，值与企业头像 key 正确对应 |
| AC-013 | 公开公司接口在企业无头像时返回 `avatarUrl = null` | API | 测试库中存在已认证企业但 `avatar_path` 为空 | 列表和详情响应仍成功，且 `avatarUrl` 字段为 `null` |
| AC-014 | 公开公司接口仍然只暴露已认证企业，即使存在头像也不会返回未认证企业 | API | 测试库中同时存在已认证和未认证企业，均可设置头像路径 | `GET /public/companies` 与 `GET /public/companies/{id}` 只返回已认证企业；未认证企业详情请求返回失败 |
| AC-015 | 企业头像返回给前端的是完整可访问 URL，而不是 `s3://` 路径或 Java 二进制代理地址 | API | 已配置 `rustfs.public-base-url` 并为企业写入头像路径 | `/company/info` 与公开公司接口中的 `avatarUrl` 以 HTTP(S) 地址返回，不是 `s3://...`，也不是 `/company/avatar/public/...` 之类代理路径 |
| AC-016 | 后续新上传企业头像不影响历史 RustFS 对象命名，也不要求迁移旧对象 | Logic | 代码审查本次实现和 migration 设计 | 实现中没有批量重命名历史对象的逻辑，上传逻辑只影响新写入对象 |
