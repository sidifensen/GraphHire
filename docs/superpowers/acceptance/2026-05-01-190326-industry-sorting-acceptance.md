# Acceptance Criteria: 行业管理排序能力

**Spec:** `docs/superpowers/specs/2026-05-01-190326-industry-sorting-design.md`
**Date:** 2026-05-01
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 行业列表接口支持 `sortBy` 与 `sortDir` 参数并透传到应用层 | API | 服务启动，调用 `/admin/industry/list` 携带排序参数 | 返回 200，控制器测试中应用服务接收到相同参数 |
| AC-002 | 不传排序参数时行业列表按 `sortOrder asc` 返回 | Logic | 构造带不同 `sortOrder` 的行业数据 | 返回顺序与 `sortOrder asc,id asc` 一致 |
| AC-003 | 传 `sortBy=name&sortDir=desc` 时按名称降序返回 | Logic | 构造名称可比较的行业数据 | 返回名称顺序严格降序 |
| AC-004 | 传 `sortBy=updatedAt&sortDir=desc` 时按更新时间降序返回 | Logic | 构造不同 `updateTime` 数据 | 返回更新时间严格降序 |
| AC-005 | 执行行业上移会与上一项交换后重排为连续排序值 | Logic | 至少三条行业，顺序值不连续 | 调用 move(up) 后全量 `sortOrder` 变为 `0..n-1`，且目标项排名前移一位 |
| AC-006 | 执行行业下移会与下一项交换后重排为连续排序值 | Logic | 至少三条行业，顺序值不连续 | 调用 move(down) 后全量 `sortOrder` 变为 `0..n-1`，且目标项排名后移一位 |
| AC-007 | 第一条上移/最后一条下移属于边界场景，不发生顺序破坏 | Logic | 至少两条行业 | 调用 move 后顺序集合仍连续，目标项位置不越界 |
| AC-008 | 前端行业页支持列头点击切换升降序并带参数请求后端 | UI interaction | 打开管理端行业页，Mock API 可观测参数 | 点击列头后再次请求，`sortBy/sortDir` 与预期一致 |
| AC-009 | 前端行业页支持上移/下移按钮并调用 move 接口 | UI interaction | 列表存在可移动行 | 点击上移/下移后分别调用 move API（UP/DOWN），并刷新列表 |
| AC-010 | 新增行业默认排序值基于当前最大值加一 | UI interaction | 列表包含已存在排序值 | 打开新增弹窗时默认排序输入值等于 `max(sortOrder)+1` |
