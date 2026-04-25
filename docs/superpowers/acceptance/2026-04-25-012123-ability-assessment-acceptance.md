# Acceptance Criteria: AI综合能力评估真实接口

**Spec:** `docs/superpowers/specs/2026-04-25-012123-ability-assessment-design.md`
**Date:** 2026-04-25
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 个人用户可通过新接口获取综合能力评估结果 | API | 已登录个人用户 | `GET /person/ability-assessment` 返回 `code=200` 且 `data.totalScore` 存在 |
| AC-002 | 接口返回五个固定维度分数字段 | API | 已登录个人用户 | `dimensions` 中包含 `breadth/depth/structure/freshness/rarity` 且都为 0-100 |
| AC-003 | 总分按权重 25/25/20/15/15 聚合 | Logic | 构造可预测输入技能集合 | `totalScore` 等于五维加权结果并四舍五入 |
| AC-004 | 无技能时接口返回可用结果而非报错 | Logic | 技能列表为空 | `totalScore=0`，五维均为 0，`level=LOW` |
| AC-005 | 能力图谱页评估卡读取真实接口分数 | UI interaction | 前端页面加载且评估接口返回固定值 | 页面总分显示为接口返回值，不再按 `skills.length * 10` 计算 |
| AC-006 | 评估卡显示技能节点统计仍与图谱技能数量一致 | UI interaction | 图谱接口返回 skills 列表 | 文案显示“已识别 N 项技能节点”中的 N 等于 skills 长度 |
| AC-007 | 评估接口失败时页面可降级显示 | UI interaction | 评估接口报错，图谱接口正常 | 页面仍可渲染，分数退回本地兜底算法且不阻塞图谱展示 |
