# Release Notes

## 2026-05-01

- fix: 调整首页“求职者流程”中 Step 2（图谱诊断）卡片文案位置到底部区域，强化与背景图的层次对齐
- fix: 调整首页首屏主标题在中等屏幕的字号层级（`md:text-5xl lg:text-6xl`），避免两句主文案被挤压为三行
- fix: 修复首页“AI 推荐候选人”步骤背景图失效（404）问题，并统一提升企业/求职流程步骤卡片高度为更饱满展示
- feat: 首页企业招聘流程与求职者流程的每个步骤卡新增背景图与可读性蒙层，形成“每一步都有背景图”的视觉呈现
- feat: 首页重构为双入口落地页：新增并列双主 CTA（企业/求职）、信任背书指标区、企业招聘流程与求职者流程、能力矩阵对照、双侧案例以及底部双 CTA 收口
- test: 新增首页落地页重构测试 `src/tests/pages/home-landing-page.test.tsx`，并同步更新 `tests/pages/page.test.tsx` 断言到新信息架构
- docs: 新增首页双入口落地页重构设计规格（科技理性 + 品牌高端），明确双主 CTA、7 区块信息架构、Uiverse 借鉴策略与 TDD 验收边界
- fix: 行业管理表格启用固定列布局，排序切换时列位置保持稳定；操作列统一为按钮样式并移除 hover 下划线
- feat: 行业管理新增排序能力：`/admin/industry/list` 支持 `sortBy(name/sortOrder/updatedAt)` 与 `sortDir(asc/desc)` 参数，前端行业页支持列头升降序切换
- feat: 行业管理新增顺序调整能力：后端新增 `PUT /admin/industry/{id}/move`（`UP/DOWN`），前端行业页新增“上移/下移”操作按钮并持久化顺序
- fix: 行业排序值连续化：后端在行业查询与移动流程中自动归一化 `sortOrder` 为 `0..N-1`，避免持续出现 `0/10/20...` 的十位步长排序
- test: 新增/增强行业排序与移动相关后端单测（`AdminControllerTest`、`AdminAppServiceTest`、`IndustryAppServiceTest`）与前端页面测试（`admin-industry-page.test.tsx`）
- feat: 首页 Hero 右侧视觉卡片升级为 Galaxy 风格，增强玻璃拟态浮层、高光渐变与底部指标条层次，并补充首页卡片结构回归测试
- docs: 同步精简 AGENTS/CLAUDE 规范，新增“简单任务直接修改 + 按改动面验证”规则，避免无关模块校验
- fix: 全局异常处理器识别客户端断连场景（`AsyncRequestNotUsableException`/`ClientAbortException`），将该类响应写出失败从 `ERROR` 降级为告警与调试日志，避免污染未处理异常告警
- test: 新增 `GlobalExceptionHandler` 客户端断连识别单测，覆盖断连与普通异常分支
- feat: 新增行业主数据能力：数据库新增 `industry` 表，行业初始数据与测试假数据入库，`company` 新增 `industry_id` 并通过迁移脚本回填后移除旧 `industry` 文本列
- feat: 管理端新增行业管理接口（列表/新增/编辑/启用停用）与页面 `/admin/industry`，并在左侧菜单新增“行业管理”入口
- feat: 企业端新增公司资料编辑能力：新增 `PUT /company/profile`（仅企业主可用）与 `/company/industry/options`，行业字段改为行业ID选择并校验启用状态
- feat: 企业端新增页面 `/enterprise/company/profile`，支持公司资料编辑与行业下拉选择，导航新增“公司”页签与账户菜单“公司资料”入口
- refactor: 公司资料返回结构升级为 `industryId + industryName`，后端公司/管理端审核展示改为按行业ID解析名称
- feat: 完善上传链路治理：新增 `app.upload` 配置中心、后端文件类型与大小校验、简历流式上传 RustFS、`resume.file_size` 落库、前端简历/头像上传前置拦截
- refactor: 统一上传相关异常提示文案，新增后端 `UploadErrorMessages` 与前端 `upload-errors` 常量，替换上传链路硬编码字符串
- fix: 后端职位 `job_type` 扩展为 `1-全职 2-兼职 3-实习`，同步更新 `schema.sql` 约束与字段注释
- fix: 新增数据库迁移脚本以兼容存量库 `job_type` 约束升级（drop/add `chk_job_type`）与注释修订
- test: 新增 `JobSchemaSqlTest`，覆盖职位类型约束与注释文本回归校验

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
## 2026-05-01

- fix: 行业管理页交互样式优化：排序列箭头增加固定宽度占位，切换升降序时不再引发表头/列宽抖动
- fix: 行业管理页操作栏“上移/下移/停用”改为按钮化样式，移除文字链接 hover 下划线，统一为按钮 hover 背景反馈
