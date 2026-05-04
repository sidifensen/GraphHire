# Release Notes

## 2026-05-03

- feat: 企业端推荐卡片展示升级：主标题改为候选人真实姓名，副标题保留简历文件名；头像优先显示候选人真实头像（`/person/avatar/public/{userId}`）
- refactor: 推荐接口响应 `resume` 新增 `avatarUrl` 字段，并在后端聚合时注入 `userName/avatarUrl`（基于 `person_info`）
- test: 扩展推荐页与匹配服务测试，覆盖姓名与头像渲染以及后端头像字段返回- feat: 企业端推荐页 `/enterprise/recommendations` 完成真实后端接口对接，左侧职位列表改为企业真实职位数据，右侧候选人列表按当前职位实时拉取推荐结果
- feat: 推荐页主操作从“一键邀请”升级为“一键匹配所有候选人”，接入 `POST /company/job/{id}/match/trigger`，并在触发后自动刷新当前职位推荐列表
- feat: 推荐候选人卡片新增真实匹配指标展示（综合匹配度/技能匹配度/岗位要求匹配度）并展示候选人技能标签、学历与经验摘要
- refactor: 扩展企业端推荐类型定义 `EnterpriseRecommendation.resume` 字段（`skills/education/experience`）以对齐后端响应契约
- refactor: 后端 `MatchDetailResponse` 扩展简历摘要字段（`skills/education/experience`），通过 Hutool JSON 从 `resume.parseResult` 容错解析，异常数据回退为空且不影响接口可用性
- test: 新增前端 `recommendations-real-api.test.tsx` 覆盖真实接口加载与一键匹配交互；扩展后端 `MatchAppServiceTest` 覆盖简历摘要字段解析与异常 parseResult 回退

## 2026-05-03

- feat: 企业端推荐卡片展示升级：主标题改为候选人真实姓名，副标题保留简历文件名；头像优先显示候选人真实头像（`/person/avatar/public/{userId}`）
- refactor: 推荐接口响应 `resume` 新增 `avatarUrl` 字段，并在后端聚合时注入 `userName/avatarUrl`（基于 `person_info`）
- test: 扩展推荐页与匹配服务测试，覆盖姓名与头像渲染以及后端头像字段返回- fix: 统一用户端“我的”子页面桌面主容器布局结构（外层横向留白 + 内层 max-width），修复从个人资料切换到简历管理/投递记录/我的图谱时左侧菜单栏视觉右移问题
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
- feat: 首页“免费发布职位”按钮替换为炫彩发光样式（保留现有跳转与文案，使用全局 CSS 实现）
- fix: 拉开首屏品牌名/核心句/说明文案的上下间距并放松行高，改善文案挤压感
- fix: “谁在使用”品牌墙在桌面端改为 4 列布局，8 个品牌按两行展示
- fix: 放大“谁在使用”品牌卡片尺寸（高度、内边距、logo尺寸与文字字号）以提升可读性
- refactor: 统一“谁在使用”品牌名称展示风格为更接近官方命名样式（如 Alibaba.com、HUAWEI）
- feat: “谁在使用”团队标识从缩写徽标改为真实品牌 SVG 图标（Google/Meta/Netflix/Spotify/Alibaba/ByteDance/Huawei/Tesla）
- fix: 增加“谁在使用”区块上方留白（`pt-6 md:pt-10`），改善与“双侧案例”之间的视觉间距
- refactor: 首屏文案定稿为“主标题：GraphHire 图谱智聘”，徽标文案改为“AI智能匹配招聘”
- fix: 恢复首页首屏“GraphHire 图谱智聘”徽标文案展示（保留单次展示，不与主副标题重复冲突）
- refactor: 精简首页首屏文案并重排层级（去重品牌名、缩短说明文案），调整为移动端居中/桌面端左对齐的混合排版
- refactor: 首页首屏文案层级调整为“网站名 -> 核心副标题 -> 说明文案”，并整体下调主标题字号，强化品牌名优先展示
- feat: “谁在使用”团队条目增加品牌标识位（左侧 logo 徽标 + 右侧团队名），提升品牌墙识别度
- refactor: 将“谁在使用”Logo 条从首屏下方移动到最终 CTA 区块上方，优化页面收口前的信任背书顺序
- feat: 首页首屏下新增“谁在使用”Logo 条，展示 8 个企业占位标识并补充 10,000+ 企业使用背书文案
- refactor: 首页 Hero 移除右侧展示卡片，改为纯左侧主文案与双 CTA 的单列布局，减少视觉干扰
- refactor: 首页右侧 Hero 卡片改为克制的企业看板样式（白底分区、状态标签、进度条），移除强 AI 风格视觉表达
- refactor: 首页右侧 Hero 从抽象 AI 指标卡改为“招聘工作台预览”结构（优先岗位、候选人匹配结果、流程状态），降低 AI 模板感并提升产品真实感
- fix: 细化首页主标题断点字号并为两句主文案增加 `md:whitespace-nowrap`，修复中大屏下被拆成三行的问题
- fix: 首页企业/求职两组流程步骤卡统一改为文案贴底布局，确保所有流程卡片视觉一致
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
- docs: 同步更新协作规范，补充简单任务豁免与执行规则，并调整提交前验证策略为按改动面执行（仅后端/仅前端/前后端）
- feat: 新增可复用文本流光加载组件 LoadingTextLoader（CSS Module 实现，无需 styled-components），并在首页真实数据加载态接入展示
- docs: 新增规则：简单任务豁免范围内的小改动默认不提交代码，仅在用户明确要求时提交

## 2026-05-02

- refactor: 管理端所有筛选下拉统一切换为 shadcn Select（industry / position-types / users / task-monitor），并统一样式表现
- fix: 修复管理端下拉展开时页面右侧白边问题，补充全局滚动锁样式覆盖
- test: 更新管理端任务监控页测试断言以兼容 shadcn Select 结构
- feat: 管理端职位类型管理新增“路径面包屑视图 / 分栏级联视图”，支持深层同级快速维护与三级分栏联动定位
- test: 扩展 `admin-position-types-page.test.tsx`，新增面包屑路径展示、同级节点范围与三级分栏联动测试
- refactor: 企业规模字段 `company.scale` 统一为编码存储（1-6），新增后端 `CompanyScale` 枚举管理编码与中文标签映射
- fix: 企业资料更新接口新增公司规模校验，仅允许 1-6 编码入库，非法值返回校验异常
- fix: 企业端公司信息与管理端企业审核列表统一返回公司规模中文标签（0-20人、20-99人、100-499人、500-999人、1000-9999人、10000人以上）
- docs: 更新数据库 `company.scale` 字段注释为编码语义，并同步初始化数据规模值为 1-6
- test: 新增并更新公司规模相关单元测试与 schema 注释测试，覆盖编码校验与标签映射行为
- docs: 新增岗位学历编码与职位类型树改造实施计划，并补充 Boss 职位类型名称树抓包产物（仅 name/children 嵌套）
- feat: 新增 `position_type` 职位类型树表结构与岗位字段迁移，`job.education` 统一为编码（1-中专、2-大专、3-本科、4-硕士、5-博士），新增 `job.position_type_id`
- feat: 新增职位类型初始化 SQL 生成脚本，基于 `docs/抓包/boss-position-type-tree-names.json` 生成全量幂等 seed SQL
- refactor: 更新岗位领域模型/命令/持久化映射以支持学历编码与职位类型ID，公共职位接口返回 `educationCode` 与 `positionTypeId`
- test: 新增并更新岗位 schema/seed/仓储与公共职位集成测试，补充测试基类对历史测试库 schema 的兼容迁移逻辑
- feat: 管理端新增职位类型管理能力：后端新增 `/admin/position-type/*` 树查询/新增/编辑/启停/同级移动接口，支持三层节点维护与祖先/后代状态联动
- feat: 管理端新增页面 `/admin/position-types` 与侧边栏“职位类型管理”入口，支持“树+详情 / 树形表格”双视图、关键字/状态/层级筛选和节点操作
- test: 新增职位类型领域服务单测 `PositionTypeAppServiceTest`，并扩展 `AdminAppServiceTest`、`AdminControllerTest`、`admin-position-types-page.test.tsx` 覆盖树过滤与交互动作
- docs: 新增 Position Type 管理设计、验收标准与实现计划文档（`docs/superpowers/specs|acceptance|plans`）
- chore: 提交行业与职位类型相关在途改动快照（含企业资料联动与测试更新）
- feat: 用户端职位页接入后端真实筛选：新增公开职位类型树/行业树接口，扩展 /public/jobs 支持职位类别叶子、行业叶子、城市多选、jobType、学历、公司规模筛选，并重构职位页为三类弹窗筛选交互（类别/行业/地点）

- fix: 修复用户端公司页移动端公司规模筛选分支的 TypeScript 类型窄化错误，恢复前端构建通过`r`n- feat: 用户端公司列表页 `/companies` 完成真实接口对接，移除 `MOCK_COMPANIES`，支持关键词、热门地点+更多地点、热门行业+更多行业、公司规模（1-6 编码）筛选，并新增本地筛选持久化（`localStorage`）
- feat: 用户端公司详情页 `/companies/[id]` 完成真实接口对接，移除 `MOCK_COMPANIES/MOCK_JOBS`，改为聚合 `publicApi.companies.getById` 与 `publicApi.jobs.search({ companyId })` 展示公司信息与在招职位
- feat: 后端公开公司接口增强：`GET /public/companies` 新增 `industryLeafIds/companyScaleCode/cityList` 筛选参数，响应新增 `industryId/industryName/scale` 字段
- refactor: 抽取用户端共享筛选模块 `frontend/src/features/user-filters/*`（行业树弹窗、地点弹窗、城市与规模工具），为职位页与公司页复用做基础
- test: 新增/更新后端 `PublicCompanyControllerIT` 与前端公司页/详情页测试，验证真实接口筛选参数映射、本地持久化恢复、详情页数据聚合；全量前后端测试通过
- feat: 用户端职位/公司移动端筛选交互统一升级：职位类别与工作地点改为内嵌面板、行业类型改为双栏、面板高度统一半屏、顶部筛选标签统一为“固定名称+数量”、无结果态增加提示文案
- fix: 筛选弹窗交互细节修复：新增“清空筛选”按钮（位于取消左侧），已选项统一为可单独移除的气泡（含 `X`），并修复弹层外层滚动导致的越界问题
- refactor: 清理职位页未使用代码与导入，移除未引用常量/状态/图标，保持筛选逻辑不变并降低维护成本
- test: 更新并新增职位/公司页面筛选相关前端测试，覆盖移动端内嵌弹层、空结果提示、筛选标签计数显示与多选交互
- fix: 用户端公司详情页根容器移除 `min-h-screen`，避免桌面端被强制撑满视口高度导致页面空白拉伸；补充对应回归测试
- feat: 用户端公司详情页桌面端改为“公司名下方双入口”结构：新增 `公司介绍/在招职位` Tab，默认展示公司介绍，切换后在同一内容区展示该公司全部在招职位；公司头部信息完全沿用现有真实后端字段
- refactor: 用户端公司详情页桌面视觉改为线性招聘站风格，移除多层大圆角卡片与阴影堆叠，保留公司名下方双Tab；在招职位改为分割线行列表，提升信息扫描效率并降低“AI模板感”
- fix: 回补用户端公司详情页线性布局内间距：头部区、正文区与职位行增加水平/垂直留白，保持去卡片化同时提升可读性
- feat: 用户端公司详情页“公司介绍”下方新增工商信息区，展示统一社会信用代码、公司名称、行业、企业规模、联系人、联系电话、企业地址；公开公司接口同步返回工商字段（unifiedSocialCreditCode/contactName/contactPhone）并补齐前后端测试
- fix: 用户端个人主页改为严格按后端真实返回字段展示（性别/年龄/电话/学历/学校/所在城市/目标城市/期望薪资），移除硬编码求职状态文案，空值统一显示“未完善”
- fix: 修正 `/person/application/favorites` 前端契约，收藏接口改为数组返回并以数组长度统计收藏数，消除前端按分页对象取 `total` 的不一致
- test: 更新个人主页相关测试（`user-profile-auth-info`、`user-profile-links`）以匹配后端真实 favorites 数据结构，并补充新增档案字段展示断言
- refactor: 用户端个人主页桌面档案区由“字段碎卡片”改为行式信息排版（基础信息/教育与城市/求职意向），提升信息扫描效率与整体观感
- test: 补充个人主页行式档案区结构断言，覆盖 `profile-info-row-*` 行分组渲染


## 2026-05-03

- feat: 用户端公司页顶部“搜索框+筛选条件”重构为同一背景通铺区域（桌面端），新增与主页面背景区分的背景带，提升筛选区块层次感
- test: 新增 `user-companies-page-layout.test.tsx`，覆盖公司页桌面筛选背景带渲染与搜索行全宽布局回归
- refactor: 企业端公司资料页“所属行业”一级/二级下拉切换为 shadcn Select，保留父子行业联动与默认二级行业回填逻辑
- test: 新增企业端公司资料页测试，覆盖 shadcn Select 渲染形态与行业切换后的提交参数
- feat: 企业端团队管理页 `/enterprise/employees` 接入真实后端接口，员工列表/统计/待审批区改为读取 `companyApi` 数据并保持原有页面结构
- feat: 团队管理页新增真实操作对接：成员禁用/启用、重置密码、加入审批通过/拒绝，并补充加载态与最小反馈文案
- test: 新增 `enterprise-employees-page` 页面测试，覆盖后端数据渲染与禁用/审批交互调用

## 2026-05-04

- feat: 用户端 `/login` 与 `/register` 重构为统一认证页面框架，保留两个地址入口并在同页右侧完成“登录/注册”表单切换，登录与注册均保留“求职者/招聘者”角色切换
- feat: 用户端认证页视觉升级为与管理端一致的左侧品牌文案+全屏背景图+右侧玻璃卡片布局，背景图替换为相似商务办公风格
- test: 新增并更新登录/注册页面切换测试，覆盖“登录页切到注册表单”“注册页切到登录表单”场景，认证相关测试全通过
- fix: 用户端认证页移除顶部“登录/注册”切换条，改为表单底部“去注册/去登录”入口，点击后仅切换右侧表单并通过 History API 同步地址，避免整页刷新感
- fix: 新增用户端路由鉴权守卫，未登录访问 `/profile`、`/personal-info`、`/resume/*`、`/applications`、`/skill-graph`、`/notifications` 将强制跳转 `/login`，修复“显示登录按钮但仍可进入我的页”的问题
- refactor: 用户端 `我的图谱` 页面改为真实接口驱动（`/person/graph` + `/person/ability-assessment`），移除前端写死技能点、分数与标签展示逻辑
- fix: 后端 `SkillGraphClient#getPersonSkillGraph` 取消无驱动/异常时返回假技能列表，改为返回空技能结构，避免前端继续展示误导性假数据
- test: 新增 `user-auth-guard` 与 `user-skill-graph-page` 前端测试，并更新 `SkillGraphClientTest` 覆盖个人图谱空结构返回行为
- fix: 用户端导航栏桌面容器取消 `max-w-7xl + mx-auto` 限制，窗口缩小时左右区域按两端贴边布局，修复顶部元素聚中挤压问题
- fix: 用户端公司列表页根容器移除 `min-h-screen` 且桌面 `main` 顶部间距归零，避免在壳层布局下出现额外垂直空白
- refactor: 企业端主导航移除“公司”主入口，保留账户菜单中的“公司资料”；同步强化顶栏/菜单暗色主题边框与分隔表现
- feat: 企业端公司资料页新增左上“返回上一页”按钮，并统一表单输入与下拉的亮暗主题样式（背景、边框、focus ring）
- fix: 后端 DeepSeek 匹配成功日志按重试次数分支输出，单次成功不再打印总耗时字段，减少冗余日志噪声
- test: 新增企业导航项测试（确保主导航不暴露公司资料入口）与企业公司资料页返回按钮测试；补充用户端导航与公司页布局回归断言
