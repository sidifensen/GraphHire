# 个人资料期望职位（多选+默认）与图谱分类联动设计

**日期**: 2026-05-06  
**范围**: 用户端 `/personal-info`、可复用职位选择弹窗、后端 `/person/info`、`/person/graph` 分类策略、数据库 `person_info` 结构扩展

## 1. 背景与目标

用户希望在个人资料中新增“期望职位”能力，支持：

1. 从职位类型树中多选期望职位（叶子职位）。
2. 在已选期望职位中设置一个“默认职位”。
3. 复用已有职位选择弹窗交互，避免重复实现。
4. 个人图谱分类时优先按默认职位走技能分类配置；若该职位尚未配置，则自动交给 AI 生成配置后再分类。

## 2. 方案概览

### 2.1 数据存储

在 `person_info` 新增两列：

- `expected_position_type_ids BIGINT[]`：期望职位ID数组（可空，空表示未设置）。
- `default_position_type_id BIGINT`：默认职位ID（可空）。

约束策略：

- 不新增外键（沿用项目“应用层保证一致性”的数据库约束风格）。
- 在应用层保证：`default_position_type_id` 必须属于 `expected_position_type_ids`。

### 2.2 前端交互

抽离一个可复用组件 `PositionTypePickerModal`（三列职位树 + 多选标签），供以下场景复用：

- 现有用户职位列表页筛选（替换原内联大块弹窗 JSX）。
- 新增个人资料页“期望职位”选择。

个人资料页新增能力：

1. “期望职位”字段，点击打开复用弹窗，多选叶子职位。
2. 已选职位以标签展示，每个标签支持移除。
3. “默认职位”使用下拉选择（选项来源于已选职位）；若已选列表变化导致默认项无效，自动重置。

### 2.3 图谱分类策略

`/person/graph` 分类逻辑调整为：

1. 若用户设置了 `default_position_type_id`：
   - 直接以该职位类型作为分类目标职位类型。
   - 读取该职位类型 `position_type_skill_profile`。
   - 若未配置：调用 AI 生成配置并落库，再用新配置分类。
2. 若未设置默认职位：保持原有流程（技能推断职位类型 + 行业推断回退）。

## 3. 详细设计

### 3.1 后端接口契约变更

`GET /person/info` 新增返回字段：

- `expectedPositionTypeIds: number[] | null`
- `defaultPositionTypeId: number | null`

`PUT /person/info` 新增可写字段：

- `expectedPositionTypeIds`
- `defaultPositionTypeId`

校验规则：

1. `expectedPositionTypeIds` 仅允许有效叶子职位（`level=3`, `status=1`, `deleted=0`）。
2. `defaultPositionTypeId` 非空时必须属于 `expectedPositionTypeIds`。
3. 若 `expectedPositionTypeIds` 为空，则 `defaultPositionTypeId` 强制置空。

### 3.2 分类服务改造

扩展 `PositionTypeSkillClassificationService`：

- 新增重载方法：`classifyPersonSkills(List<String> rawSkills, Long preferredPositionTypeId)`。
- 当 `preferredPositionTypeId` 可用时，优先走该职位类型。
- 若该职位类型无 profile，调用 `IndustrySkillProfileBootstrapService.bootstrapByPositionTypeId(preferredPositionTypeId)` 生成配置后重试读取。
- 若生成后仍无配置，返回空分类（不抛错），保证接口稳定。

`PersonController#getPersonGraph` 传入当前用户默认职位ID。

### 3.3 数据访问层改造

`person_info` 对应链路同步扩展：

- Domain: `PersonInfo`
- PO: `PersonInfoPO`（开启 `autoResultMap`）
- TypeHandler: 新增 `LongListArrayTypeHandler`（PostgreSQL `bigint[]` ↔ `List<Long>`）
- DTO: `PersonInfoResponse` / `PersonUpdateRequest`
- Repository: `PersonInfoRepositoryImpl` 的保存更新 SQL 字段

## 4. 测试策略（TDD）

### 4.1 后端

1. `PersonControllerTest`
   - 更新资料时保存期望职位与默认职位。
   - 图谱分类调用时传入默认职位ID。
2. `PositionTypeSkillClassificationServiceTest`
   - 指定默认职位时优先命中默认职位。
   - 默认职位无配置时触发 bootstrap 后可分类。

### 4.2 前端

1. `user-personal-info-page.test.tsx`
   - 加载展示期望职位。
   - 保存时提交 `expectedPositionTypeIds/defaultPositionTypeId`。
2. `user-jobs-page.test.tsx`
   - 继续通过（验证弹窗抽离后行为不变）。

## 5. 风险与缓解

1. **职位ID数组脏数据风险**：后端统一过滤无效ID并去重排序。
2. **默认职位与已选不一致**：后端与前端双层校验，后端为最终裁决。
3. **AI生成配置耗时**：仅在“默认职位且无配置”场景触发，且复用已有生成服务避免重复请求。

## 6. 验收摘要

1. 个人资料可多选期望职位并设置默认职位。
2. 职位选择弹窗来自复用组件，用户职位页行为不回归。
3. 图谱分类优先默认职位；默认职位无配置时自动 AI 生成配置后分类。
4. 前后端测试与构建按改动面通过。

