# Backend Full Optimization Acceptance Criteria

## AC-1 数据库基线一致性
- `schema.sql` 中 `match_record` 字段与当前迁移后结构一致。
- `init.sql` 的 `match_record` 初始化 SQL 可在新结构下执行。
- 相关 Mapper/PO 字段映射与 schema 一致，无失配字段。

## AC-2 匹配与企业侧热点查询优化
- 匹配列表与推荐场景不再逐条 `findById` 触发 N+1。
- 企业看板/职位列表中的会话数、匹配数统计改为批量查询。
- 原接口输出字段与排序语义保持兼容。

## AC-3 异步执行模型统一
- 业务代码不再使用临时 `newFixedThreadPool`。
- `runAsync` 不再依赖默认公共线程池，改为显式注入执行器。

## AC-4 事务边界收敛
- 大批量匹配流程不在单一长事务中执行整个计算过程。
- 数据写入仍保证必要事务一致性。

## AC-5 逻辑删除策略统一
- 关键 PO（至少 job/resume/company）启用统一逻辑删除策略。
- 仓储查询不再依赖分散且易遗漏的手写 deleted 过滤。

## AC-6 日志开销优化
- 高频简历保存路径不再无条件输出大 JSON pretty 日志。
- 调试日志仅在 debug 下输出必要摘要。

## AC-7 分页插件稳定
- 明确存在 MyBatis-Plus 分页拦截器配置。
- `ParseTaskRepositoryImpl` 移除“插件失效全量切片兜底”逻辑。

## AC-8 验证通过
- 后端改动后执行 `mvn compile` 通过。
- 后端改动后执行 `mvn test` 通过。
