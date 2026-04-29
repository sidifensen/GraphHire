# 企业图谱后端优化设计

> **日期**：2026-04-29
> **状态**：Approved
> **范围**：`backend` 企业侧图谱接口、图数据库访问、相关服务重构与测试补全

---

## 1. 背景与目标

当前后端已经接入 Memgraph，但图谱相关实现存在几个明显问题：

- `SkillGraphClient` 通过字符串拼接 Cypher，返回 `Map<String, Object>`，类型不稳定，且存在转义和维护成本。
- 企业侧缺少“公司 -> 岗位 -> 技能”的图谱接口，现有图谱能力只覆盖个人图谱和职位图谱。
- `CompanyAppService`、`JobAppService` 中存在重复的 `findById(...).orElseThrow(...)`、保存和参数校验逻辑，关键入口缺少 `log.info` 级别日志。
- 图谱相关测试覆盖偏浅，`MatchGraphControllerIT` 仅验证状态码，企业控制器测试里还存在未落地的图谱接口预期。

本次目标是在不改数据库表结构的前提下，完成企业图谱接口、图数据库访问重构、关键服务日志增强、重复逻辑抽取，以及相关测试补全。

## 2. 设计方案

### 2.1 企业图谱接口

新增企业图谱读取接口：

- `GET /company/graph`
- 支持可选参数 `companyId`

行为约束：

- 未传 `companyId` 时，默认读取当前登录企业所属公司的图谱。
- 传入 `companyId` 时，仅允许读取当前登录企业自己的公司图谱；若与当前企业不一致则返回 403。
- 返回结构为明确的图谱 DTO，而不是 `Map<String, Object>`。

返回图结构：

- 根节点：企业节点 `COMPANY`
- 第二层：岗位节点 `JOB`
- 第三层：技能节点 `SKILL`
- 边类型：
  - `HAS_JOB`
  - `REQUIRES_SKILL`

### 2.2 图谱数据来源与同步策略

企业图谱的权威业务数据仍来自 PostgreSQL 中的 `company` 和 `job` 表；Memgraph 负责承载和返回图关系。

读取流程：

1. `CompanyGraphAppService` 先从关系库读取企业和该企业全部职位。
2. 使用这些关系型数据对 Memgraph 做一次幂等同步：
   - `MERGE` 企业节点
   - `MERGE` 岗位节点
   - `MERGE` 企业到岗位边
   - 清理岗位旧技能边后重新 `MERGE` 岗位到技能边
3. 再从 Memgraph 查询企业完整图结构并组装为响应 DTO。

降级策略：

- 当 Memgraph 关闭或连接不可用时，接口不报 500，而是用同一份企业/职位/技能数据构造等价图结构返回，并显式标记 `graphAvailable=false`。
- 这样测试环境和本地未启动 Memgraph 时也能稳定验证接口与控制层行为。

### 2.3 图数据库访问重构

`SkillGraphClient` 保留现有个人/职位图谱接口兼容行为，但新增并优先提供类型化企业图谱能力：

- `syncCompanyGraph(...)`
- `getCompanyGraph(...)`

重构原则：

- 使用参数化 Cypher，禁止继续手写字符串拼接节点内容。
- 提取公共执行与节点组装逻辑，减少重复异常处理。
- 将企业图谱结果收口为类型化对象，避免控制层直接处理 `Map<String, Object>`。

### 2.4 服务层优化与方法抽取

本次会在以下位置抽取重复逻辑：

- `CompanyAppService`
  - 抽取 `requireCompany(...)`
  - 抽取带日志的持久化辅助方法
- `JobAppService`
  - 抽取 `requireJob(...)`
  - 抽取 `persistJob(...)`
  - 保留 `validateAndNormalizeSkills(...)` 作为统一技能入口
- 新增 `CompanyGraphAppService`
  - 集中处理企业图谱权限校验、关系库读取、Memgraph 同步与 DTO 返回

### 2.5 日志策略

以下关键入口补充 `log.info`：

- 企业创建、更新、提交认证材料、头像更新、通过用户读取企业
- 职位创建、更新、发布、关闭、薪资更新
- 企业图谱同步与查询
- 图谱构建服务中的简历/职位图谱构建入口

日志只记录业务主键、数量和关键动作，不输出敏感凭据与大对象全文。

## 3. 测试策略

采用 TDD：

1. 先补企业图谱控制器/服务/图客户端失败测试。
2. 再补公司服务和职位服务重构后的单测。
3. 生产代码通过后执行完整后端编译与测试。

测试分层：

- 单测：
  - `CompanyGraphAppServiceTest`
  - `CompanyAppServiceTest`
  - `JobAppServiceTest`
  - `SkillGraphClientTest`
- 集成测试：
  - `CompanyControllerIT` 补企业图谱接口断言
  - `MatchGraphControllerIT` 补更严格的返回结构断言

## 4. 风险与边界

- 本次不改 PostgreSQL 表结构，不新增迁移脚本。
- 本次不重构现有个人图谱与职位图谱对外响应格式，以避免影响前端已接入逻辑。
- 企业图谱接口只服务企业工作台，不扩展到公共公司详情接口。
- 现有图数据库中可能存在旧节点；本次通过企业维度幂等同步保证查询结果正确，不做全库清理任务。
