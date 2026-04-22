# Acceptance Criteria: 登录页角色切换动画

**Spec:** `docs/superpowers/specs/2026-04-22-141244-login-role-switch-motion-design.md`
**Date:** 2026-04-22
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 登录页初始渲染时“求职者”为激活角色，并存在激活标签动画指示器 | UI interaction | 启动前端并打开 `/login` | “求职者”按钮 `aria-selected=true`；激活动画指示器仅出现在求职者按钮内 |
| AC-002 | 点击“招聘者”后，激活标签动画指示器切换到招聘者按钮 | UI interaction | 登录页已渲染，当前激活项为求职者 | “招聘者”按钮 `aria-selected=true`，“求职者”按钮 `aria-selected=false`，动画指示器出现在招聘者按钮内 |
| AC-003 | 角色切换时表单区域使用角色键控容器并更新为当前角色 | Logic | 渲染登录页并进行角色切换 | 表单动画容器存在，且其 `data-role` 与当前 `activeRole` 一致 |
| AC-004 | 开启减少动态效果偏好时，页面仍可完成角色切换且不报错 | Logic | 模拟 `prefers-reduced-motion` 场景 | 角色切换后 `aria-selected` 正确更新，组件不抛异常 |
| AC-005 | 新增动画不影响登录页既有可访问性语义 | Logic | 运行登录页测试集 | 既有角色切换与表单交互测试均通过，`tablist/tab/aria-selected` 语义保留 |
