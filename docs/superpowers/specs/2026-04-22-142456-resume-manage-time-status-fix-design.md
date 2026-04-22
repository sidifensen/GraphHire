# Resume Manage Time/Status Fix Design

**Date:** 2026-04-22
**Scope:** 用户端简历管理页 `Invalid Date` 与状态误显示修复

## 背景
当前用户端 `/resume/manage` 页面存在两个已复现问题：
1. 时间显示为 `Invalid Date`
2. 已解析成功的简历状态显示为“待解析”

## 根因
1. 前端以 `createdAt` 字段渲染时间；后端 `/resume/my` 返回领域模型 `Resume`，未携带 `createTime/updateTime`。
2. 前端状态文案逻辑使用 `COMPLETED/PROCESSING`；后端返回 `SUCCESS/PARSING`（以及可能的 `parseStatus` 数值）。

## 目标
1. 简历管理页稳定显示上传时间（无效时间时显示 `-`，不再出现 `Invalid Date`）。
2. 状态文案统一为：`待解析 / 解析中 / 解析成功 / 解析失败`。
3. 不破坏现有上传/轮询链路。

## 方案
### 后端
- 在 `Resume` 领域模型补充 `createTime`、`updateTime` 字段并提供 getter/setter。
- 复用仓储层 `BeanUtil.copyProperties`，让 `ResumePO` 的时间字段自然透传到 `/resume/my` 响应。

### 前端
- 在 `resumeApi` 增加响应标准化函数：
  - 时间字段兼容 `createdAt/createTime` 与 `updatedAt/updateTime`
  - 状态兼容 `PENDING/PARSING/SUCCESS/FAILED`、`PENDING/PROCESSING/COMPLETED/FAILED`、`parseStatus(0~3)`
- `manage/page.tsx` 统一通过安全格式化函数渲染时间，非法值显示 `-`。
- `manage/page.tsx` 状态文案按用户指定中文展示。

## 测试策略（TDD）
1. 前端先写失败测试：`resumeApi.getMyResumes` 遇到 `createTime + SUCCESS` 需映射为 `createdAt + COMPLETED`。
2. 后端先写失败测试：`ResumeRepositoryImpl` 从 `ResumePO` 转领域对象后应包含 `createTime/updateTime`。
3. 实现最小代码使测试通过。
4. 回归已有页面测试与后端仓储测试。

## 风险与回滚
- 风险低，变更集中在字段透传与前端映射。
- 如异常可快速回滚到修复前提交，不影响数据表结构。
