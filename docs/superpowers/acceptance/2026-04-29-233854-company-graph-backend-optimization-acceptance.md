# Acceptance Criteria: 企业图谱后端优化

**Spec:** `docs/superpowers/specs/2026-04-29-233854-company-graph-backend-optimization-design.md`
**Date:** 2026-04-29
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 企业用户请求 `/company/graph` 时，接口默认返回当前登录企业所属公司的图谱 | API | 已存在企业账号、企业记录和至少一个职位 | 响应 `code=200`，`data.companyId` 等于当前企业 ID，节点中包含 1 个 `COMPANY` 节点 |
| AC-002 | 企业图谱返回结构必须包含企业、岗位、技能三类节点和对应边 | API | 企业至少有一个带技能的职位 | 响应中的 `nodes` 至少包含 `COMPANY`、`JOB`、`SKILL` 三种 `type`，`edges` 至少包含 `HAS_JOB` 和 `REQUIRES_SKILL` |
| AC-003 | 当传入与当前企业不一致的 `companyId` 时，接口拒绝访问 | API | 当前企业已登录 | 响应 `code=403`，`message` 表示无权访问其他企业图谱 |
| AC-004 | 企业图谱服务会基于关系库中的职位技能生成去重后的技能节点 | Logic | 单测中提供同企业多个职位，且存在重复技能名 | 返回图结构中相同技能名只出现 1 个技能节点，但可以有多个岗位边连接到该技能 |
| AC-005 | Memgraph 不可用时，企业图谱接口仍返回可用图结构 | Logic | 单测或集成测试中图客户端不可连接 | 响应 `code=200`，`data.graphAvailable=false`，且图结构仍包含企业与岗位节点 |
| AC-006 | `CompanyAppService` 通过统一的企业读取辅助方法处理不存在企业的场景 | Logic | 单测中 `CompanyRepository.findById` 返回空 | 服务抛出 `IllegalArgumentException`，消息为“企业不存在” |
| AC-007 | `JobAppService` 发布职位时会统一做职位读取、状态流转和保存 | Logic | 单测中提供可发布职位 | 发布后职位状态为 `PUBLISHED`，`publishedAt` 被写入，仓储保存被调用 1 次 |
| AC-008 | 企业图谱接口在控制层完成当前企业归属校验，并可接受与当前企业一致的 `companyId` 参数 | API | 当前企业已登录且传入自己的企业 ID | 响应 `code=200`，`data.companyId` 等于请求参数 |
| AC-009 | `MatchGraphControllerIT` 对图谱匹配接口至少校验返回编码和 `data` 结构存在 | API | 个人用户已登录且测试职位存在 | 响应体包含 `code` 字段，成功场景下存在 `data.matchLevel` 或 `data.totalScore` |
| AC-010 | `SkillGraphClient` 新增的企业图谱能力在无驱动情况下返回确定性的降级结果，而不是抛异常 | Logic | 单测中直接实例化客户端且不注入驱动 | 调用企业图谱构建/查询方法不抛异常，并返回节点和边集合 |
