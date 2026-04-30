# Acceptance Criteria: 用户端“我的”桌面侧栏工作台改造

**Spec:** `docs/superpowers/specs/2026-04-30-231145-user-workbench-sidebar-design.md`
**Date:** 2026-04-30
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 桌面端访问 `/profile` 时页面出现左侧菜单栏，且包含“个人资料、简历管理、投递记录、我的图谱、账号设置”五个入口 | UI interaction | 浏览器宽度 `>=1024px`，用户进入 `/profile` | 左侧菜单区域可见，五个入口文本均可见，`TopNav` 保持可见 |
| AC-002 | 桌面端访问 `/personal-info` 时复用同一左侧菜单栏，右侧显示个人资料编辑内容 | UI interaction | 浏览器宽度 `>=1024px`，用户进入 `/personal-info` | 左侧菜单可见且当前入口高亮；右侧可见“基本信息”“求职意向”和“保存修改”按钮 |
| AC-003 | 桌面端访问 `/resume/manage` 时复用左侧菜单栏，简历区改为行式列表信息结构而非卡片网格 | UI interaction | 浏览器宽度 `>=1024px`，简历接口返回至少 2 条数据 | 右侧每条简历以行级信息块呈现，含文件名、状态、时间与操作按钮，页面不再依赖多列卡片布局 |
| AC-004 | 桌面端访问 `/applications` 时复用左侧菜单栏，投递记录以行式记录展示并保留筛选与撤回能力 | UI interaction | 浏览器宽度 `>=1024px`，投递接口返回含 `PENDING` 状态数据 | tabs 过滤可用；每行展示职位、公司、匹配度、状态、投递时间；`PENDING` 记录可点击撤回 |
| AC-005 | 桌面端访问 `/skill-graph` 时复用左侧菜单栏，图谱页面保持主画布与右侧信息区 | UI interaction | 浏览器宽度 `>=1024px`，用户进入 `/skill-graph` | 左侧菜单可见；右侧仍有图谱主画布与“能力概览/知识节点”信息区；“重新生成分析视图”按钮可见 |
| AC-006 | `/profile` 页面桌面端不再使用原入口菜单宫格作为主导航 | Logic | 渲染 `/profile` 页面 | 页面不再渲染“个人资料/简历管理/投递记录/我的图谱”二列宫格入口块，导航职责迁移到左侧菜单栏 |
| AC-007 | 5 个页面移动端行为不回归（顶部、底部、主要交互保留） | UI interaction | 浏览器宽度 `<1024px`，分别访问 5 个页面 | 顶部 `TopNav`、移动端主要内容与按钮仍可见；未引入阻断式桌面侧栏覆盖 |
| AC-008 | 前端项目构建与测试在改造后通过 | Logic | 代码改造完成 | `npm run build` 与 `npm run test:run` 均成功返回 0 |
| AC-009 | 后端项目编译与测试在改造后通过 | Logic | 代码改造完成且后端依赖可用 | `mvn compile` 与 `mvn test` 均成功返回 0 |
| AC-010 | 使用 CDP 浏览器对目标页面进行桌面端验证通过 | UI interaction | 本地启动前后端，浏览器可访问站点 | 在 CDP 中打开 5 个目标页面，均可观察到“左侧菜单 + 右侧内容”桌面结构且无阻断性报错 |
