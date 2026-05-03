# Release Notes

## 2026-05-03

- feat: 企业端推荐页 `/enterprise/recommendations` 完成真实后端接口对接，左侧职位列表改为企业真实职位数据，右侧候选人列表按当前职位实时拉取推荐结果
- feat: 推荐页主操作从“一键邀请”升级为“一键匹配所有候选人”，接入 `POST /company/job/{id}/match/trigger`，并在触发后自动刷新当前职位推荐列表
- feat: 推荐候选人卡片新增真实匹配指标展示（综合匹配度/技能匹配度/岗位要求匹配度）并展示候选人技能标签、学历与经验摘要
- refactor: 扩展企业端推荐类型定义 `EnterpriseRecommendation.resume` 字段（`skills/education/experience`）以对齐后端响应契约
- refactor: 后端 `MatchDetailResponse` 扩展简历摘要字段（`skills/education/experience`），通过 Hutool JSON 从 `resume.parseResult` 容错解析，异常数据回退为空且不影响接口可用性
- test: 新增前端 `recommendations-real-api.test.tsx` 覆盖真实接口加载与一键匹配交互；扩展后端 `MatchAppServiceTest` 覆盖简历摘要字段解析与异常 parseResult 回退
- fix: 统一用户端“我的”子页面桌面主容器布局结构（外层横向留白 + 内层 max-width），修复从个人资料切换到简历管理/投递记录/我的图谱时左侧菜单栏视觉右移问题
- test: 新增 `user-workbench-layout-consistency` 回归测试，校验“我的页面”侧边栏所在桌面容器在各子页面保持一致，防止布局偏移回归
- refactor: 删除投递记录表 `application.note` 字段，新增迁移脚本 `V2026_05_03_022__drop_application_note_column.sql` 并同步更新 `schema.sql` 与初始建表脚本
- refactor: 清理投递模块对 `note` 的代码依赖（Application 领域模型、ApplicationPO、ApplicationMapper、企业端状态更新接口签名）
- test: 新增 `ApplicationAppServiceTest` 用例覆盖“更新投递状态不依赖备注字段”，并完成后端编译与全量测试通过验证

## 2026-05-01

- feat: 用户端公司详情页新增公司头像与具体地址展示，移除“已认证企业，当前开放X个职位”文案；公开公司接口同步返回 `address` 字段
- feat: company 表新增企业简介字段 `description`（含迁移脚本与 schema 同步），并补齐 CompanyPO 映射，支持企业简介落库与查询
- fix: 首页首屏求职入口按钮文案调整为“开始找工作”，并同步更新相关页面测试断言
- feat: 首页首屏“免费发布职位”按钮替换为新独立组件样式（黄黑渐变 + 图标动效），保留原有跳转地址与组件化引用
- feat: 首页首屏“立即找工作”替换为独立组件 `HeroJobButton`（渐变描边动效样式，保留 `/jobs` 跳转），底部 CTA 保持不变
- test: 更新首页相关测试断言，仅首屏按钮文案改为 `Let's get started`，底部仍为“立即找工作”
- refactor: “免费发布职位”按钮迁移为独立组件（`components/home/Type1Button` + CSS Module）并在首页直接引用，移除临时全局样式实现

## 2026-04-25

- feat: 新增用户端 `/applications` 投递记录页，支持列表查看、状态筛选与前端分页
- feat: 新增用户能力图谱页 AI 综合能力评估真实接口（5 维：广度/深度/结构性/时效性/稀缺性）
- feat: 前端 `/skill-graph` 接入真实评估接口并展示五维分数，保留接口失败兜底
- test: 新增后端能力评估服务单测与控制器测试，补充前端评估页测试
- feat: 用户端职位详情页内联智能匹配，匹配成功后切换为默认简历一键投递，并下线 /match/{id} 页面入口

## 2026-04-26

- fix: 管理端侧边栏品牌区改为复用 /favicon.svg，统一展开/折叠 logo 尺寸并消除切换抽搐

## 2026-04-28

- feat: 新增企业端 `mobile-enterprise` 隐藏内部移动路由，手机访问 `/enterprise/**` 时无感切换到企业端手机版且地址保持不变
- test: 扩展设备路由测试并新增企业端移动壳测试，覆盖企业端路径映射、重写判定和公开地址还原
- fix: 修复企业端手机版团队页固定新增按钮越出移动壳边界的问题，并消除窄屏下的潜在横向滚动
- fix: 移除企业端手机版遗留的 375px 居中窄框限制，页面内容、顶部栏、底部栏和固定操作区改为全宽铺满
- fix: 清理企业端手机版内部页面残留的 container-margin 横向缩进，Dashboard 等页面改为真正满宽展示
- refactor: 企业端手机版目录改为对齐 `mobile-user` 的 App Router 结构，移除临时 `pages/components/lib` 目录并统一迁入 `_components/_data/_lib`

## 2026-04-29

- refactor: 按原版目录重写企业端手机版 UI，恢复 375px 居中壳层、页面容器与导航样式体系
- feat: 新增企业端手机版候选人详情页路由 `/mobile-enterprise/candidate/[id]`，并恢复推荐页“详情”跳转
- test: 更新企业端手机版壳层/首页/团队页断言为原版样式预期，新增推荐页候选人详情跳转测试
- fix: 修复企业端手机版接入宿主项目后图标缩小与圆形背景缺失的问题，恢复 Material Symbols 默认 24px 与原型依赖颜色映射
- feat: 按参考目录重写用户端手机版页面，补齐夜间模式切换、主题持久化与原版导航/卡片视觉
- feat: 新增企业端 `/company/graph` 图谱接口，返回公司-岗位-技能三层图结构，并支持按当前登录企业或显式 `companyId` 读取
- refactor: 重构 `SkillGraphClient` 企业图谱访问为类型化响应与参数化 Cypher，并为 `CompanyAppService`、`JobAppService` 抽取统一读取/保存逻辑
- test: 新增企业图谱服务单测、职位/企业服务单测，补强企业与匹配图谱集成测试覆盖

## 2026-04-30

- feat: 替换用户/企业统一登录注册页为 `docs/graphhire用户端新页面` 风格，保留单入口角色分流并新增登录页测试账号自动填充
- feat: 注册流程统一为邮箱语义，继续对接后端邮箱验证码发送接口并保留企业审核中提示与跳转
- test: 新增 `LoginRequest` 邮箱校验单测，更新前端登录/注册页测试覆盖新文案与交互
- feat: 登录后在用户端与企业端右上角显示头像与名称，补齐个人主页动态用户信息展示并保留持久登录态
- feat: 用户端 `personal-info`、`resume/manage|upload`、`applications` 三页切换真实后端接口，支持资料保存、头像上传、简历设默认/重解析/上传、投递记录状态筛选与撤回

## 2026-05-02

- feat: 用户端职位页接入后端真实筛选：新增公开职位类型树/行业树接口，扩展 /public/jobs 支持职位类别叶子、行业叶子、城市多选、jobType、学历、公司规模筛选，并重构职位页为三类弹窗筛选交互（类别/行业/地点）
- feat: 用户端公司列表页 `/companies` 完成真实接口对接，移除 `MOCK_COMPANIES`，支持关键词、热门地点+更多地点、热门行业+更多行业、公司规模（1-6 编码）筛选，并新增本地筛选持久化（`localStorage`）
- feat: 用户端公司详情页 `/companies/[id]` 完成真实接口对接，移除 `MOCK_COMPANIES/MOCK_JOBS`，改为聚合 `publicApi.companies.getById` 与 `publicApi.jobs.search({ companyId })` 展示公司信息与在招职位
- feat: 后端公开公司接口增强：`GET /public/companies` 新增 `industryLeafIds/companyScaleCode/cityList` 筛选参数，响应新增 `industryId/industryName/scale` 字段
- refactor: 抽取用户端共享筛选模块 `frontend/src/features/user-filters/*`（行业树弹窗、地点弹窗、城市与规模工具），为职位页与公司页复用做基础
- test: 新增/更新后端 `PublicCompanyControllerIT` 与前端公司页/详情页测试，验证真实接口筛选参数映射、本地持久化恢复、详情页数据聚合；全量前后端测试通过
