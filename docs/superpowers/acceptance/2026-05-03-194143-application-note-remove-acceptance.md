# Acceptance Criteria: 投递记录 note 字段移除

**Spec:** `docs/superpowers/specs/2026-05-03-194143-application-note-remove-design.md`
**Date:** 2026-05-03
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | `application` 表不再包含 `note` 字段 | Logic | 已应用最新迁移脚本 | 查询 `information_schema.columns` 中 `table_name='application'` 结果不包含 `note` |
| AC-002 | 基线结构与迁移一致，不再声明 `application.note` | Logic | 打开 `schema.sql` | `CREATE TABLE application` 与字段注释中均不存在 `note` |
| AC-003 | 投递状态更新接口不再接收/写入 `note` | API | 企业端调用 `/company/applications/{id}/status` | 请求仅依赖 `status` 参数即可更新成功，服务层签名不含 `note` |
| AC-004 | 面试邀请流程不再尝试写入投递备注字段 | Logic | 调用 `sendInterviewInvitation` 业务方法 | 持久化更新仅涉及状态与更新时间，不涉及 `note` |
| AC-005 | 应用模块持久化映射与领域对象不再包含 `note` | Logic | 检查 `Application`、`ApplicationPO`、`ApplicationMapper.xml` | 三处均无 `note` 属性映射与 SQL 列引用 |
| AC-006 | 后端编译与测试通过 | Logic | 完成代码修改 | `mvn compile` 与 `mvn test` 退出码均为 0 |

