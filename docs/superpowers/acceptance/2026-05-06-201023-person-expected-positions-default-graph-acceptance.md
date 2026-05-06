# 个人资料期望职位与默认职位图谱联动验收标准

**日期**: 2026-05-06  
**关联设计**: `docs/superpowers/specs/2026-05-06-201023-person-expected-positions-default-graph-design.md`

## AC-1 个人资料期望职位配置

1. `/personal-info` 页面新增“期望职位”能力，可从职位树中多选叶子职位。
2. 已选期望职位可见且可移除。
3. “默认职位”只能从已选期望职位中选择。

## AC-2 弹窗复用

1. 个人资料页选择期望职位使用与职位列表页同一套职位选择弹窗组件。
2. 职位列表页原有“选择职能”交互不回归（三级树、多选、已选标签、清空/取消/确定）。

## AC-3 后端资料接口契约

1. `GET /person/info` 返回新增字段：
   - `expectedPositionTypeIds`
   - `defaultPositionTypeId`
2. `PUT /person/info` 支持写入上述字段。
3. 当默认职位不在期望职位集合中时，后端不会保存非法默认值（置空或纠正）。

## AC-4 图谱分类优先默认职位

1. 用户设置了默认职位时，`/person/graph` 分类优先按默认职位执行。
2. 默认职位存在分类配置时，直接按该配置进行技能分类。
3. 默认职位无分类配置时，自动触发 AI 配置生成并继续分类（不抛错）。

## AC-5 数据库变更一致性

1. 存在新增迁移脚本，补齐 `person_info` 的新增字段。
2. `backend/src/main/resources/db/schema.sql` 同步包含新增字段定义与注释。

## AC-6 验证与回归

1. 后端至少通过目标测试：
   - `PersonControllerTest`
   - `PositionTypeSkillClassificationServiceTest`
2. 前端至少通过目标测试：
   - `user-personal-info-page.test.tsx`
   - `user-jobs-page.test.tsx`
3. 按改动面完成全量验证：
   - `mvn compile`
   - `mvn test`
   - `npm run build`
   - `npm run test:run`

