# 任务监控简历解析单类型化设计

**日期**: 2026-04-24  
**状态**: Approved

## 背景与目标

管理端任务监控当前仍保留多任务类型语义（简历解析/职位匹配/导入），与现状不一致。当前系统仅有简历解析任务，且任务列表未完整展示来源ID、错误信息、创建/完成/更新时间等关键字段。

本次目标：

1. 后端任务类型统一收敛为 `RESUME_PARSE`。
2. 数据库注释明确 `parse_task.task_type` 与 `source_id` 均仅对应简历解析语义。
3. 前端“全部类型”筛选仅保留“简历解析”。
4. 任务表格补全字段：来源ID、错误信息（截断+悬浮完整提示）、创建时间、结束时间、更新时间。

## 方案

### 后端

1. `AdminTaskItemResponse` 增加 `sourceId` 与 `updatedAt` 字段，供前端展示。
2. `AdminAppService` 的任务映射逻辑统一返回 `RESUME_PARSE`，不再返回 `JOB_MATCH/IMPORT`。
3. `ParseTaskRepositoryImpl` 的类型过滤仅允许 `RESUME_PARSE` 映射到 `task_type=1`，其他类型不再命中。
4. 任务领域对象补全 `updatedAt` 与 `sourceId` 映射，确保列表响应可用。

### 数据库

新增迁移脚本更新 `parse_task` 注释：

1. `task_type`: “任务类型：1-简历解析（当前仅支持该类型）”
2. `source_id`: “来源ID：简历ID（当前仅关联简历解析任务）”

### 前端

1. `TaskListItem` 类型补充 `sourceId`、`updatedAt`。
2. 任务监控页面 `type` 下拉仅保留“简历解析”选项。
3. 表格列扩展为：任务ID、来源ID、任务类型、重试次数、状态、错误信息、创建时间、结束时间、更新时间、操作。
4. 错误信息展示策略：单元格内截断（超长省略），通过 `title` 展示完整内容。

## 数据流与兼容性

1. 兼容现有 API 路径 `/admin/task/list`，仅扩展响应字段，不破坏调用方式。
2. 旧数据中若时间或错误信息为空，前端展示 `-`。
3. 筛选参数向后兼容：前端仍可传 `type=RESUME_PARSE`，后端仅支持该值。

## 测试策略

1. 后端单测（AdminAppService）：验证任务响应包含 `sourceId`/`updatedAt`，类型恒为 `RESUME_PARSE`。
2. 前端页面测试：验证类型下拉仅有“简历解析”，列表渲染新增列且错误信息可通过 `title` 查看完整文本。
3. 项目级验证按仓库要求执行：前端 build/test，后端 compile/test，最后浏览器 CDP 验证页面。

