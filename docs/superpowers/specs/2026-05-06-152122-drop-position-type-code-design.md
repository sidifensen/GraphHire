# 删除 position_type.code 字段设计

## 背景
当前岗位与职位类型关联已经统一使用 `position_type.id`（`job.position_type_id`），`position_type.code` 不再承担主关联职责。
现状中 `code` 仍残留在数据库结构、后端模型、管理端返回与前端展示中，形成重复标识与维护成本。

## 目标
1. 从数据库结构中删除 `position_type.code` 字段及相关唯一约束语义。
2. 清理后端领域/持久化/接口层对 `code` 的依赖。
3. 清理管理端前端类型与页面“编码”展示。
4. 保持职位类型树查询、新增、编辑、启停、排序行为不变。

## 非目标
1. 不调整 `position_type.id` 及其在 `job.position_type_id` 的关联语义。
2. 不改动职位类型树层级、排序、启停规则。
3. 不引入新的外部编码字段替代 `code`。

## 方案

### 1. 数据库变更
- 新增迁移脚本：删除 `position_type.code` 字段。
- 同步更新 `backend/src/main/resources/db/schema.sql`：移除 `code` 字段定义与注释。
- 同步更新已有注释迁移 `V2026_05_06_027__add_position_type_comments.sql`：删除 `code` 注释语句，避免迁移执行报错。

### 2. 职位类型 seed 脚本调整
- 更新 `V2026_05_02_019__seed_position_type_from_boss_json.sql`：
  - `INSERT` 字段从 `(id, code, name, ...)` 改为 `(id, name, ...)`。
  - 幂等冲突条件从 `ON CONFLICT (code)` 改为 `ON CONFLICT (id)`。
- 更新生成脚本 `script/dev/generate-position-type-seed.ps1`，与上述 SQL 结构保持一致。

### 3. 后端代码调整
- 删除领域模型 `PositionType` 的 `code` 属性。
- 删除持久化对象 `PositionTypePO` 的 `code` 属性。
- 删除 `PositionTypeMapper#nextCode` 与 `PositionTypeRepository#nextCode` 及实现。
- 删除 `PositionTypeAppService` 中 `resolveNextCode` 逻辑及 `item.setCode(...)`。
- 删除管理端响应 DTO `AdminPositionTypeTreeItemResponse` 的 `code` 字段。
- 删除 `AdminAppService#toAdminPositionTypeTreeItem` 中 `setCode(...)`。

### 4. 前端代码调整
- 删除 `frontend/src/lib/api/admin.ts` 中 `AdminPositionTypeItem.code` 类型。
- 删除管理端职位类型页面详情区“编码”展示。
- 同步更新相关页面测试 mock 数据，移除 `code` 字段。

### 5. 测试与回归
- 后端测试：
  - 更新 `JobSchemaSqlTest`：断言 `position_type` 不再包含 `code` 列。
  - 更新 `PositionTypeSeedSqlTest`：断言冲突条件为 `ON CONFLICT (id)`。
  - 更新 `PositionTypeAppServiceTest` 与 `AdminAppServiceTest` 中 `code` 相关构造。
- 前端测试：
  - 更新 `admin-position-types-page.test.tsx` mock 数据结构。
- 按改动面执行全量验证：后端 `mvn compile` + `mvn test`；前端 `npm run build` + `npm run test:run`。

## 风险与控制
1. 风险：历史迁移脚本/注释脚本仍引用 `code` 导致新环境建库失败。
   - 控制：同步修订 `V2026_05_06_027` 与 seed SQL，并以 `mvn test` 覆盖 schema 相关断言。
2. 风险：管理端页面或接口类型变更导致前端编译失败。
   - 控制：同步更新 TS 类型与页面展示、对应测试数据。
3. 风险：职位类型新增逻辑删除 `nextCode` 后出现行为异常。
   - 控制：保留现有创建流程，仅去除无用赋值，树结构核心字段（id/parentId/level/sortNo）不变。
