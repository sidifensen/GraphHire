# Acceptance Criteria: 删除 position_type.code 字段

**Spec:** `docs/superpowers/specs/2026-05-06-152122-drop-position-type-code-design.md`
**Date:** 2026-05-06
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 数据库迁移执行后 `position_type` 表不再包含 `code` 列 | API | 应用按最新迁移启动并完成 Flyway 执行 | `information_schema.columns` 查询 `position_type.code` 计数为 `0` |
| AC-002 | `schema.sql` 基线中 `position_type` 定义不再包含 `code` 字段与其注释 | Logic | 代码已更新到本次变更版本 | `schema.sql` 检索不到 `position_type.code` 定义/注释 |
| AC-003 | 后端职位类型领域与持久化模型不再暴露 `code`，新增职位类型流程不依赖 `nextCode` | Logic | 后端代码编译通过 | `PositionType/PositionTypePO/PositionTypeRepository/PositionTypeMapper/PositionTypeAppService` 不含 `code/nextCode` 相关成员 |
| AC-004 | 管理端职位类型接口类型与页面不再使用或展示 `code` | Logic | 前端代码构建通过 | `AdminPositionTypeItem` 不含 `code`，职位类型详情区不再显示编码行 |
| AC-005 | 职位类型 seed SQL 仍保持幂等导入能力 | Logic | 代码已更新到本次变更版本 | seed SQL 使用 `ON CONFLICT (id)`，且不再插入 `code` 列 |
| AC-006 | 回归验证通过 | Logic | 本地依赖正常 | 后端 `mvn compile`、`mvn test`；前端 `npm run build`、`npm run test:run` 全部通过 |
