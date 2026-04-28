# Acceptance Criteria: 移动端登录注册真实接口对接与桌面端表单对齐

**Spec:** `docs/superpowers/specs/2026-04-28-233727-mobile-auth-sync-design.md`  
**Date:** 2026-04-28  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 移动端登录页默认展示求职者账号并填充对应测试用户名与密码 | UI interaction | 打开移动端 `/login` 页面 | 用户名输入框值为 `13800138001@phone.com`，密码输入框值为 `password123` |
| AC-002 | 切换登录角色到招聘者后，自动填充招聘者测试账号 | UI interaction | 打开移动端 `/login` 页面并点击“招聘者” | 用户名输入框值变为 `hr@techchina.com`，密码输入框值为 `password123` |
| AC-003 | 移动端登录提交会调用真实登录接口并使用角色决策写入对应 auth store | Logic | 在测试中 mock `authApi.login`、`resolveLoginRoleDecision`、stores | 提交后调用 `authApi.login`；当返回 `PERSON` 时调用 `userAuthStore.setAuth` 并跳转 `/`，当返回 `COMPANY` 时调用 `enterpriseAuthStore.setAuth` 并跳转 `/enterprise/dashboard` |
| AC-004 | 登录接口异常或角色不匹配时显示错误信息且不跳转 | Logic | mock 登录失败或角色判定失败场景 | 页面出现错误提示，router.push 未被调用 |
| AC-005 | 移动端注册验证码发送调用 `authApi.sendVerifyCode(email, 'register')` | Logic | 输入邮箱并点击“获取验证码” | 成功时按钮进入倒计时；失败时显示后端/超时错误文案 |
| AC-006 | 求职者注册提交调用 `personRegister` 并写入用户端 store | Logic | 注册页角色为求职者且表单合法 | 调用 `authApi.personRegister`；成功后调用 `userAuthStore.setAuth` 并跳转 `/` |
| AC-007 | 招聘者注册提交调用 `companyRegister` 并写入企业端 store | Logic | 注册页切换为招聘者且补全企业字段 | 调用 `authApi.companyRegister`；成功后调用 `enterpriseAuthStore.setAuth` 并跳转 `/enterprise/dashboard` |
| AC-008 | 招聘者注册返回“审核中”错误时，展示提示并跳转登录审核提示页 | UI interaction | mock `companyRegister` 抛出审核中错误消息 | 页面展示“注册成功，企业已提交管理员审核...”提示，随后跳转 `/login?review=pending` |
