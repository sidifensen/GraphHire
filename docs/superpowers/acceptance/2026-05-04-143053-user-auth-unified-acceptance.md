# Acceptance Criteria: 用户端登录注册统一页

**Spec:** `docs/superpowers/specs/2026-05-04-143053-user-auth-unified-design.md`
**Date:** 2026-05-04
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 访问 `/login` 时默认显示登录表单区域 | UI interaction | 前端页面可渲染登录页 | 页面展示“立即登录”按钮，且显示邮箱/密码输入框 |
| AC-002 | 访问 `/register` 时默认显示注册表单区域 | UI interaction | 前端页面可渲染注册页 | 页面展示“创建账号”按钮，且显示验证码与确认密码输入框 |
| AC-003 | 在登录页点击“注册”切换后，右侧表单改为注册表单 | UI interaction | 登录页已渲染 | 页面出现“创建账号”按钮与注册字段，登录提交按钮不再作为主表单提交按钮 |
| AC-004 | 在注册页点击“登录”切换后，右侧表单改为登录表单 | UI interaction | 注册页已渲染 | 页面出现“立即登录”按钮，且显示登录邮箱/密码字段 |
| AC-005 | 登录表单保留“求职者/招聘者”切换并继续自动填充开发测试账号 | Logic | 处于登录模式 | 切换为“招聘者”后自动填充招聘者账号，切回“求职者”后恢复求职者账号 |
| AC-006 | 注册表单保留“我是求职者/我是招聘者”切换，招聘者显示企业字段 | Logic | 处于注册模式 | 切换到“我是招聘者”后显示“请输入企业全称”和“18位验证码或数字” |
| AC-007 | 登录与注册接口调用行为与原逻辑一致 | Logic | 测试中 mock authApi | 登录提交调用 `authApi.login`；注册发送验证码调用 `authApi.sendVerifyCode(email, 'register')` |
| AC-008 | 统一页面视觉结构与管理端风格一致（左侧背景+右侧卡片） | UI interaction | 页面渲染完成 | 页面存在左侧品牌文案区和右侧表单卡片，背景图为商务办公风格并覆盖全屏背景层 |
