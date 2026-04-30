# Acceptance Criteria: 用户端个人资料/简历管理/投递记录真实后端对接

**Spec:** `docs/superpowers/specs/2026-04-30-170732-user-profile-resume-applications-real-api-design.md`  
**Date:** 2026-04-30  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 个人资料页首次加载时使用 `/person/info` 返回值填充姓名、性别、电话、邮箱、学历、学校、城市、目标城市、期望薪资 | UI interaction | 用户已登录，`personApi.getProfile` 返回有效对象 | 页面输入控件显示与后端字段一致的值 |
| AC-002 | 个人资料页点击“保存修改”时调用 `/person/info` 更新接口，payload 字段与后端 `PersonUpdateRequest` 对齐 | Logic | 页面已有可编辑表单数据 | `personApi.updateProfile` 被调用一次，参数只包含 `realName/gender/age/phone/email/education/school/city/targetCity/expectedSalary` |
| AC-003 | 个人资料页上传头像调用 `/person/avatar` 后刷新当前头像展示 | Logic | 选择了合法图片文件 | `personApi.uploadAvatar` 被调用，页面头像 `src` 更新为返回地址 |
| AC-004 | 简历管理页加载时调用 `/resume/my` 并渲染真实简历列表 | Logic | 用户已登录，`resumeApi.getMyResumes` 返回列表 | 页面展示的简历名称、默认标记、解析状态与返回列表一致 |
| AC-005 | 对非默认且可设默认的简历点击“设为默认”会调用 `/resume/{id}/default` 并刷新列表 | Logic | 列表中存在可设默认简历 | `resumeApi.setDefault` 按目标 `id` 调用，随后再次调用 `getMyResumes` |
| AC-006 | 对简历点击“重新解析”会调用 `/resume/{id}/parse`，并刷新或轮询解析状态 | Logic | 列表中存在目标简历 | `resumeApi.parse` 被调用，页面对应项状态进入解析中并最终以刷新后的状态展示 |
| AC-007 | 点击“上传新简历文件”会走真实上传接口 `/resume/my/upload` 并在成功后刷新列表 | UI interaction | 选择合法文件（pdf/doc/docx/txt） | `resumeApi.uploadWithProgress` 被调用，上传成功后列表出现新简历或刷新最新数据 |
| AC-008 | 投递记录页加载时调用 `/person/application/list` 并渲染职位、公司、状态、投递时间 | Logic | 用户已登录，`personApi.getApplications` 返回列表 | 页面每条记录展示与接口字段 `jobTitle/companyName/status/appliedAt` 对齐 |
| AC-009 | 投递记录按 tab 筛选状态正确：`全部/待处理/已查看/面试邀请/不合适` | Logic | 页面已加载含多状态记录 | 各 tab 下仅出现匹配状态记录，`全部` 显示全量 |
| AC-010 | 对 `PENDING` 记录点击撤回时调用 `/person/application/{id}/withdraw` 并刷新列表 | Logic | 页面存在 `PENDING` 状态记录 | `personApi.withdrawApplication` 被调用，刷新后该记录状态不再是 `PENDING` |
| AC-011 | 个人中心菜单路由修正：简历管理跳转 `/resume/manage`，我的图谱跳转 `/skill-graph` | Logic | 打开 `/profile` 页面 | 菜单链接 `href` 与目标路由完全一致 |
| AC-012 | 前端构建与测试通过 | Logic | 依赖已安装 | `frontend` 下 `npm run build`、`npm run test:run` 均成功 |
| AC-013 | 后端编译与测试通过 | Logic | Java/Maven 环境可用 | `backend` 下 `mvn compile`、`mvn test` 均成功 |
| AC-014 | 浏览器 CDP 验证通过，三个目标页面功能可用 | UI interaction | 前后端服务已启动可访问 | `/personal-info`、`/resume/manage`、`/applications` 页面可正常加载并完成核心交互 |
