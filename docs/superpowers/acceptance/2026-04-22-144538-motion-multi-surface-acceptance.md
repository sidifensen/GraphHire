# Acceptance Criteria: 用户端多界面 Motion 动效增强

**Spec:** `docs/superpowers/specs/2026-04-22-144538-motion-multi-surface-design.md`
**Date:** 2026-04-22
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | Header 当前激活导航显示布局动画指示器 | Logic | 渲染 Header，当前路径为 `/` | 可查询到 `data-testid=header-nav-indicator` |
| AC-002 | 通知页分类按钮切换时动画指示器跟随激活项迁移 | UI interaction | 打开通知页，初始分类为“全部” | 点击“简历解析”后，`notification-category-indicator` 出现在“简历解析”按钮内 |
| AC-003 | 通知页分类切换不影响已有通知加载与操作行为 | Logic | mock 通知列表并切换分类 | 仍可加载通知、执行已读操作且无异常 |
| AC-004 | 技能图谱页渲染评分环与进度环节点 | Logic | 打开技能图谱页并加载成功 | 可查询到 `skill-score-ring` 与 `skill-score-progress` |
| AC-005 | 在 reduced-motion 场景下页面仍能正常切换和渲染 | Logic | 模拟减少动态效果偏好 | 动画相关元素渲染正常，页面无报错 |
