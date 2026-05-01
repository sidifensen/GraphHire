# Acceptance Criteria: Job Type 扩展（全职/兼职/实习）

**Spec:** `docs/superpowers/specs/2026-05-01-155048-job-type-intern-design.md`  
**Date:** 2026-05-01  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | `schema.sql` 的 `job_type` 约束允许 1/2/3 | Logic | 读取 `backend/src/main/resources/db/schema.sql` | 文件包含 `CONSTRAINT chk_job_type CHECK (job_type IN (1, 2, 3))` |
| AC-002 | `schema.sql` 的 `job.job_type` 注释包含实习类型 | Logic | 读取 `backend/src/main/resources/db/schema.sql` | 文件包含 `COMMENT ON COLUMN job.job_type IS '工作类型：1-全职 2-兼职 3-实习';` |
| AC-003 | 存量数据库可通过 migration 更新约束与注释 | Logic | 读取新增 migration SQL | migration 中显式 drop/add `chk_job_type` 且更新 `job.job_type` 注释到三种类型 |
| AC-004 | 后端 `Job`/`JobPO` 对 `jobType` 的注释与数据库一致 | Logic | 读取 Java 源码 | 注释仅描述 `1=全职 2=兼职 3=实习`，不再出现 `0=未知` |
| AC-005 | 后端项目编译与测试通过 | Logic | 在 `backend` 执行 `mvn compile` 与 `mvn test` | 两个命令均退出码为 0 |
| AC-006 | 全仓完成验证通过（前端编译+测试+浏览器验证） | UI interaction | 前后端可启动并可用 CDP 访问页面 | `npm run build`、`npm run test:run` 通过，CDP 打开页面可正常加载职位列表/详情接口相关页面 |
