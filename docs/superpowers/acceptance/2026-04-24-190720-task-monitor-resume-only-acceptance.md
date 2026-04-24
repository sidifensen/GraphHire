# Acceptance Criteria: 任务监控简历解析单类型化

**Spec:** `docs/superpowers/specs/2026-04-24-190720-task-monitor-resume-only-design.md`  
**Date:** 2026-04-24  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 管理端任务列表接口返回的任务类型统一为 `RESUME_PARSE` | Logic | 构造 `ParseTask` 记录并调用 `AdminAppService.getTaskList` | 返回列表项 `type` 字段全部为 `RESUME_PARSE` |
| AC-002 | 管理端任务列表接口返回来源ID与更新时间字段 | Logic | 构造包含 `sourceId`、`updateTime` 的任务并调用 `AdminAppService.getTaskList` | 响应 `list[*].sourceId`、`list[*].updatedAt` 与输入一致 |
| AC-003 | 任务类型筛选仅支持简历解析 | Logic | 调用 `ParseTaskRepository.findPage` 的类型过滤逻辑（经服务层调用） | `type=RESUME_PARSE` 可命中；其他类型不命中 |
| AC-004 | 数据库字段注释明确仅支持简历解析语义 | Logic | 查看新增 migration 脚本 | 脚本包含 `parse_task.task_type` 与 `parse_task.source_id` 注释更新语句且内容为“仅简历解析” |
| AC-005 | 前端任务监控类型下拉仅展示“简历解析” | UI interaction | 打开管理端任务监控页面 | 类型下拉展开后仅有“全部类型”和“简历解析”两个选项 |
| AC-006 | 前端任务表格展示来源ID、错误信息、创建时间、结束时间、更新时间 | UI interaction | 打开管理端任务监控页面并存在任务数据 | 表格存在对应列并渲染出接口返回值 |
| AC-007 | 错误信息长文本在表格中截断并可悬浮查看完整内容 | UI interaction | 任务数据包含长错误信息 | 单元格表现为省略显示，元素 `title` 为完整错误信息 |

