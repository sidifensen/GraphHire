# Acceptance Criteria: GraphHire 后端 DDD 多模块重构

**Spec:** `docs/superpowers/specs/2026-04-15-ddd-multi-module-design.md`
**Date:** 2026-04-15
**Status:** Draft

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | Maven 多模块结构正确创建 | Logic | 执行 `mvn clean compile` | 9 个 module 均成功编译，无依赖冲突 |
| AC-002 | common 模块无业务依赖 | Logic | common 模块编译通过 | common/src 不引用任何 auth/resume/job/match/skill/notification/admin 包 |
| AC-003 | Domain 层不依赖 Infrastructure | Logic | 执行 `mvn validate` | 所有 domain/service 包不引用 infrastructure 包 |
| AC-004 | Repository 接口定义在 Domain 层 | Logic | 检查源码结构 | 所有 `*Repository.java` 接口位于 `domain/repository/` 包下 |
| AC-005 | Repository 实现在 Infrastructure 层 | Logic | 检查源码结构 | 所有 `*RepositoryImpl.java` 位于 `infrastructure/persistence/repository/` 包下 |
| AC-006 | 聚合根包含业务方法 | Logic | 检查 User.java 源码 | User 类包含 `loginSuccess()`、`loginFailed()`、`isLocked()` 等业务方法，非纯 getter/setter |
| AC-007 | 聚合根发布领域事件 | Logic | 检查 User.java 源码 | User 类使用 `registerEvent()` 发布领域事件（非直接赋值后发布） |
| AC-008 | 所有模块 dependency 方向向上 | Logic | 执行 `mvn dependency:tree` | 依赖关系符合设计文档：common 最底层，match/admin 最上层 |
| AC-009 | infrastructure 模块被所有业务模块依赖 | Logic | 检查各模块 pom.xml | auth/resume/job/match/skill/notification/admin 的 pom.xml 均声明对 infrastructure 的依赖 |
| AC-010 | Controller 位于 interface 层 | Logic | 检查源码结构 | 所有 `*Controller.java` 位于 `interface/controller/` 包下，非 `web/controller` |
| AC-011 | DDD 分层目录结构完整 | Logic | 检查各模块目录 | 每个 module 均包含 domain/application/infrastructure/interface 四层目录 |
| AC-012 | Domain Service 类存在 | Logic | 检查源码结构 | MatchDomainService、ResumeDomainService、JobDomainService 等领域服务类存在于 `domain/service/` 包下 |
| AC-013 | 领域事件类存在 | Logic | 检查 domain/event 包 | ResumeUploadedEvent、ResumeParsedEvent、JobPublishedEvent、MatchCompletedEvent 等事件类存在 |
| AC-014 | Application 层不含业务逻辑 | Logic | 检查 AppService 源码 | AppService 方法仅为编排逻辑，不包含核心业务规则判断 |
| AC-015 | 值对象类为不可变 | Logic | 检查 VO 类源码 | 所有 `*VO.java` 值对象类无 setter，仅有 final 字段和 getter |
| AC-016 | pom.xml 模块顺序正确 | Logic | 检查父 pom.xml | modules 声明顺序符合依赖拓扑：common → infrastructure → auth/skill/notification → resume/job → match → admin |
| AC-017 | 每个模块有独立 pom.xml | Logic | 检查文件存在性 | common、auth、resume、job、match、skill、notification、admin、infrastructure 各有独立 pom.xml |
| AC-018 | MQ/AI/File/Graph 基础设施包存在 | Logic | 检查 infrastructure 目录 | infrastructure 下存在 mq/、ai/、file/、graph/ 四个子包 |
| AC-019 | Graph 客户端使用 Dgraph | Logic | 检查 graph 包源码 | 图数据库客户端类为 DgraphGraphClient，配置类为 DgraphConfig |
| AC-020 | 编译后所有模块 jar 正确生成 | Logic | 执行 `mvn package -DskipTests` | 每个 module 的 target/ 目录下生成正确的 .jar 文件 |
