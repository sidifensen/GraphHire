# Backend Full Optimization Plan

## Step 1. 基线测试与失败用例
- 补充/调整测试覆盖：
  - match_record schema 相关 SQL/映射一致性
  - MatchAppService 批量查询行为
  - CompanyController 批量统计行为
  - 异步执行器注入行为
  - ParseTaskRepository 分页行为

## Step 2. 数据库基线与映射修复
- 更新 `schema.sql`、`init.sql`、必要 migration。
- 修正 `MatchRecord` 相关 PO/Mapper/测试映射。

## Step 3. Repository 批量接口
- 为 Job/Resume/PersonInfo/MatchRecord/ChatConversation 增加批量查询与批量统计方法。
- 添加必要 SQL 与注释。

## Step 4. 匹配与企业控制器热点改造
- `MatchAppService`：用批量预加载替换循环逐条查。
- `CompanyController`：会话数/匹配数改批量统计。

## Step 5. 异步与事务优化
- 新增统一执行器配置并替换 `runAsync/newFixedThreadPool`。
- 收紧 `MatchAppService` 大批量流程事务边界。

## Step 6. 逻辑删除与日志优化
- 统一关键 PO 的 `@TableLogic`。
- 删除高频路径无条件 pretty 日志，改 debug 摘要。

## Step 7. 分页插件与仓储清理
- 新增 MyBatis-Plus 分页拦截器配置。
- 移除 ParseTaskRepository 的分页兜底切片逻辑。

## Step 8. 全量验证与提交
- 执行 `mvn compile`、`mvn test`。
- 更新 `RELEASE-NOTES.md`。
- `git add` + 中文规范提交。
