# 投递记录 note 字段移除设计

## 背景
用户反馈“投递记录表（application）中的 `note` 字段无实际价值”，希望直接移除。当前该字段同时存在于数据库结构、领域模型、持久化映射与企业端状态更新逻辑中。

## 目标
- 从 `application` 表彻底移除 `note` 字段。
- 保持投递核心流程（投递、状态流转、面试邀请、撤回）行为不变。
- 保证数据库迁移脚本与 `schema.sql` 基线一致。

## 方案对比

### 方案 A（推荐）：完全移除字段与代码引用
- 做法：新增迁移脚本 `DROP COLUMN`，同步更新 `schema.sql`，删除后端模型/PO/Mapper/Service 中 `note` 相关代码。
- 优点：数据结构与代码一致，消除无效字段与维护成本。
- 缺点：历史备注数据不可再从投递记录读取。

### 方案 B：数据库保留字段，仅停止写入
- 做法：保留表字段，代码层不再设置 `note`。
- 优点：兼容性风险低。
- 缺点：无效结构继续存在，不符合“直接删掉”目标。

### 方案 C：迁移到独立备注表
- 做法：删除 `application.note`，新建 `application_note` 明细表。
- 优点：若未来需要审计可扩展。
- 缺点：超出当前需求，新增复杂度（YAGNI）。

## 设计结论
采用方案 A：直接删除字段并联动清理代码。

## 影响范围
- 数据库：
  - 新增迁移脚本删除 `application.note`
  - 更新 `backend/src/main/resources/db/schema.sql`
- 后端领域与持久化：
  - `Application` / `ApplicationPO` 移除 `note`
  - `ApplicationMapper.xml` 删除 `note` 映射与 SQL 字段
  - `ApplicationAppService.updateApplicationStatus` 去掉 `note` 参数
  - 面试邀请逻辑不再向投递记录写备注（`remark` 仅用于接口输入/通知内容）
  - `CompanyApplicationController` 调整接口调用签名
- 测试：
  - 先新增失败测试覆盖新签名与状态更新行为，再完成实现。

## 兼容性与风险
- API 响应中 `Application.note` 字段将消失；当前前端用户端投递页未消费该字段。
- 若有外部调用方依赖该字段，需要同步更新；本仓内未发现对应使用。

## 测试策略
- 单元测试：`ApplicationAppServiceTest` 增加状态更新行为测试（先红后绿）。
- 后端回归：`mvn compile` + `mvn test`。

