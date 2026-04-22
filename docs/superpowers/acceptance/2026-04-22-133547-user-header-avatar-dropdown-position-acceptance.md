# Acceptance Criteria: 用户端 Header 头像下拉弹窗定位修复

**Spec:** `docs/superpowers/specs/2026-04-22-133547-user-header-avatar-dropdown-position-design.md`
**Date:** 2026-04-22
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 登录用户点击头像触发按钮后展示用户菜单弹窗 | UI interaction | 前端服务运行，用户处于登录态，Header 可见 | 点击头像后页面出现包含“个人空间”“退出登录”的菜单弹窗 |
| AC-002 | 菜单弹窗相对头像触发区域右对齐并位于其下方 | Logic | 渲染 Header 组件并触发 `showDropdown=true` | 弹窗容器 class 包含 `right-0` 与 `top-full`，且不包含 `right-8` |
| AC-003 | 修复后保持点击外部关闭及菜单点击行为不变 | UI interaction | 前端服务运行，用户处于登录态并已打开菜单 | 点击页面其他区域后菜单关闭；点击“个人空间”触发跳转；点击“退出登录”触发登出流程 |
