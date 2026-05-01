# Job Type 扩展设计（全职/兼职/实习）

**日期**: 2026-05-01  
**范围**: backend + PostgreSQL schema/migration

## 目标

将 `job.job_type` 的可选值统一为：
- `1` 全职
- `2` 兼职
- `3` 实习

并同步后端代码注释、数据库约束、数据库字段注释，以及可执行迁移脚本。

## 现状

- `backend/src/main/resources/db/schema.sql` 中 `chk_job_type` 仅允许 `(1, 2)`。
- `schema.sql` 的 `job.job_type` 注释仅描述 “1-全职 2-兼职”。
- 领域模型 `Job` 注释存在 `0=未知` 与数据库定义不一致。

## 变更方案

1. 保持数据库字段类型 `SMALLINT` 不变。
2. 修改 `schema.sql`：
- `chk_job_type` -> `IN (1, 2, 3)`
- 字段注释 -> `工作类型：1-全职 2-兼职 3-实习`
3. 新增 migration 脚本，对已有库执行：
- drop 旧 `chk_job_type`
- add 新 `chk_job_type`（含 3）
- 更新列注释
4. 同步 Java 代码注释，消除 `0=未知` 说法。

## 风险与兼容性

- 对现有 `job_type=1/2` 数据完全兼容。
- 新增 `3` 后，前端/调用方若直接透传数字，不会破坏现有行为。
- 若数据库历史脏数据存在 `job_type` 非 `1/2/3`，新增约束会失败；当前约束已限制 `1/2`，风险低。

## 验证策略

- 先加测试校验 `schema.sql` 中约束与注释文本（TDD Red）。
- 修改生产 SQL 与注释后测试转绿（Green）。
- 执行后端编译与测试。
- 执行前端编译与测试（按仓库完成验证要求）。
- 通过 CDP 打开页面做浏览器验证。
