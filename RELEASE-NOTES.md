# Release Notes

## 2026-05-08
- refactor: 后端匹配与看板链路性能优化，新增岗位/简历/个人信息批量查询，`MatchAppService` 与 `CompanyController` 主要列表接口由循环查库改为批量预加载，降低 N+1 查询开销
- refactor: 异步线程池统一托管，新增 `AsyncExecutorConfig`（`resumeMatchExecutor`、`authMailExecutor`），匹配任务与验证码发送改为受控线程池执行，减少临时线程池与公共线程池争用风险
- refactor: MyBatis-Plus 显式注册分页拦截器并移除仓储手工分页兜底逻辑（`AdminRepositoryImpl`、`ParseTaskRepositoryImpl`），统一分页语义并降低内存切片风险
- fix: 对齐 `match_record` 数据库基线，新增迁移脚本并同步 `schema.sql/init.sql` 到 `requirement_score` 字段模型，清理旧分数字段与 `viewed` 相关残留，避免环境结构漂移
- test: 更新 `MatchAppServiceTest`、`CompanyControllerTest`、`ParseTaskRepositoryImplTest`、`AdminRepositoryImplUnitTest` 等用例以覆盖批量查询与分页改造，后端 `mvn compile`、`mvn test` 全量通过（378 通过）
- feat: 上传链路新增统一 Redis Lua 令牌桶限流，覆盖 `/resume/my/upload`、`/resume/my/upload-async`、`/person/avatar`、`/company/avatar`、`/chat/messages/image`，超限统一返回 `429`
- feat: 简历解析新增幂等互斥锁（`lock:resume:parse:{resumeId}`）与 `parse_task` 运行中查询语义，拦截重复触发解析
- refactor: 简历解析与匹配触发解耦；`ResumeParseMQConsumer` 仅发布 `resume-match-trigger`，新增 `ResumeMatchTriggerMQConsumer` 独立处理全职位匹配
- feat: 新增异步简历上传能力：`POST /resume/my/upload-async` 创建任务、`GET /resume/upload-task/{taskId}` 查询状态，新增 `resume-upload-async` 消费者处理上传+建档+触发解析
- feat: 新增 `upload_task` 表（migration + schema 同步）并补充 `parse_task` 运行中复合索引，完善异步任务状态落库
- refactor: RustFS S3 客户端支持连接池与超时参数配置化（`max-connections`、`connection-acquire-timeout`、`connection-time-to-live`、`expect-continue-enabled` 等）
- test: 新增并更新限流、解析锁、MQ 解耦、异步上传任务、schema 与配置相关测试；后端 `mvn compile`、`mvn test` 通过
- refactor: 聊天主链路夜间主题 token 统一：工作台外壳/详情容器/详情头/消息头像/消息卡片内按钮/预览弹层全部去除 `white/*` 叠色，改为 `surface` 与 `outline` 语义 token
- fix: 修复聊天夜间模式下多处“发白边框与白雾底”问题（详情头、头像 ring、预览弹层头尾分隔、PDF 区域容器），降低高亮白边与透白感
- test: 更新 `chat-workspace-redesign` 断言以匹配新 token（`ring-outline-variant`、`bg-surface-container-low` 等），并通过聊天页定向测试
- fix: 修复聊天表情弹窗夜间模式边框偏白问题，外层边框与内层 ring 改为显式主题 token（`border-surface-container-highest + dark:border-outline-variant`），避免透明度叠加导致发白
- test: 更新 `chat-workspace-redesign` 断言，约束表情弹窗边框不再使用 `border-outline-variant/60`，并校验内层 ring 的暗色 token
- fix: 修复聊天表情弹窗背景发透问题，弹窗容器改为不透明 `bg-surface-container-lowest`，移除半透明背景与毛玻璃效果，避免夜间消息内容透出影响可读性
- test: 补充 `chat-workspace-redesign` 断言，约束表情弹窗不得使用 `bg-surface-container-lowest/95` 与 `backdrop-blur*`
- fix: 修复聊天表情弹窗在夜间模式下滚动条未适配问题，分类横向滚动区统一接入 `chat-scrollbar` 主题滚动条样式
- test: 补充 `chat-workspace-redesign` 回归断言，约束表情分类滚动区与表情网格滚动区必须使用 `chat-scrollbar`
- fix: 修复沟通页 PDF 预览在 CSP 限制下仍无法打开的问题，聊天预览弹窗改为 `iframe` 渲染并移除 `sandbox`，确保 `blob:` 预览可正常加载
- fix: 前端 CSP 新增 `frame-src 'self' blob:`，与聊天 PDF 预览策略对齐，同时保持 `object-src 'none'` 安全约束不变
- test: 更新 `chat-workspace-redesign` 中 PDF 预览断言（`iframe` + 下载链接），并通过前端定向测试、全量测试与构建验证
- fix: 修复沟通页 PDF 预览被浏览器拦截问题，聊天预览弹窗从 `iframe sandbox` 改为 `object[type=application/pdf]` 内嵌渲染，避免出现“该内容被屏蔽”空白页
- feat: 聊天 PDF 预览新增降级回退入口：当浏览器不支持内嵌预览时，弹窗内可直接点击“下载PDF文件”
- test: 更新 `chat-workspace-redesign` 断言覆盖新 PDF 预览结构（`object` + 下载回退链接），并通过前端 `npm run test:run`（418 通过）与 `npm run build`
- fix: 修复移动端聊天列表页中部蓝线：将聊天布局最小高度从全端 `min-h-[560px]` 调整为仅桌面端 `md:min-h-[560px]`，避免移动端列表容器被强制撑高后显示边框线
- fix: 去掉聊天页两处多余分隔线：左侧会话搜索区底线与底部操作栏顶部分隔线，消除夜间模式下残留白线
- fix: 修复聊天页夜间模式白底可读性问题：会话搜索框、表情/相册按钮、消息输入框、对方消息气泡统一改为 `surface` 主题 token，去除关键区域 `bg-white` 硬编码
- fix: 聊天会话列表与消息流滚动容器新增 `chat-scrollbar` 主题滚动条（Firefox + WebKit），暗色下不再出现亮色滚动轨道/滑块
- test: 新增聊天页暗色主题回归断言（关键元素必须使用主题类且不含 `bg-white`）；前端 `npm run test:run`（418 通过）与 `npm run build` 通过
- fix: 修复聊天发送方气泡文字可读性问题，发送消息气泡统一改为 `bg-primary + text-on-primary`，避免主题变量透明度导致的白字不可读
- fix: 完成用户端/企业端聊天工作台夜间模式适配（会话列表、详情头、消息流、输入区、表情面板、预览弹层），补齐暗色背景/边框/文本对照样式
- fix: 修复企业端 TopNav 夜间模式初始化竞态，避免进入页面后将已保存 `dark` 主题误回退为 `light`
- test: 新增聊天气泡可读性与暗色样式覆盖断言、企业端 TopNav 主题初始化回归断言；前端 `npm run test:run` 与 `npm run build` 全量通过

## 2026-05-07
- test: 更新移动端行业筛选测试断言，保持行业面板打开时分类菜单可见的行为契约
- fix: 调整移动端职位筛选高级面板布局，行业面板与分类菜单同屏展示并保持筛选切换一致性
- feat: 用户端/企业端桌面沟通页升级为雾面低边框风格，减少线框堆叠并提升层次感（商务克制 + 轻活力）
- refactor: 聊天工作台完成组件化拆分（会话列表/详情头/消息流/输入区/头像/表情面板/预览弹层），ChatWorkspace 收敛为状态与行为编排层
- test: 新增聊天页雾面样式与组件挂载断言，并通过前端全量验证（
pm run test:run、
pm run build）
- docs: 更新协作规范中的暗色主题可读性要求，统一约束背景/边框/滚动条使用主题 token 并要求回归测试覆盖
- fix: 用户端职位列表移动端“职位类别”筛选改为三级联动三列布局（一级/二级/三级），交互与“公司行业”保持一致，修复原先平铺标签导致样式与操作不一致的问题
- test: 更新 `user-jobs-page` 用例，新增对移动端职位类别三列结构（root/mid/leaf）的断言，确保回归不再退化为平铺模式
- fix: 修复用户端职位详情页“智能匹配竞争力/智能匹配”按钮无响应问题，补充点击事件并统一跳转至 `/skill-graph?jobId={职位ID}`
- test: 新增 `user-job-detail-page` 回归用例，校验点击“智能匹配竞争力”会触发正确路由跳转
- fix: 修复用户端夜间模式筛选弹层可读性问题：职位分类/工作地点/公司行业弹层容器与已选标签从硬编码 `bg-white` 改为主题色 `bg-surface-lowest`，避免暗色主题下浅色文字叠加白底导致内容“看不清”
- fix: 修复用户端夜间模式筛选弹层滚动条与分隔线偏白问题：职位分类/工作地点/公司行业三类弹层统一使用暗色主题滚动条（`filter-modal-scroll`）与 `border-surface-mid` 分隔线，消除白色滚动条与白色分割线
- test: 新增职位页与公司页筛选弹层主题样式回归测试，约束弹层必须使用主题背景（禁止回退到 `bg-white`）；前端 `npm run build`、`npm run test:run` 全量通过
- fix: 统一提交配置修正：后端 CORS/WebSocket allowed-origins 改为环境变量字符串写法；前端 CSP 在开发环境放开 http 图片源以兼容本地调试
- feat: 企业端聊天“面试通知”重构为 shadcn 弹窗组件 `InterviewInviteDialog`，移除输入区内联面试表单；支持 `Dialog + Popover + Calendar + time` 组合时间选择并按 `yyyy-MM-ddTHH:mm:ss` 提交
- feat: 新增前端通用 shadcn 基础组件 `button/input/label/dialog/popover/calendar`，供后续页面复用
- test: 更新并通过聊天页测试，覆盖面试通知弹窗打开、内联表单移除、时间选择与发送参数格式；前端 `npm run test:run`、`npm run build` 通过
- fix: 修复面试通知弹窗视觉穿透问题，提升遮罩层级并将弹窗内容层改为不透明背景（白底/暗色兼容）
- fix: 修复面试时间选择器层级错误：提升 Popover z-index，确保时间选择面板始终显示在弹窗之上

- refactor: 行业技能画像模块整体迁移到职位类型技能画像命名空间（`industryskill` -> `positiontypeskill`），清理旧领域模型、仓储与测试文件
- feat: 管理端技能画像初始化入口与服务调用统一切换到 `PositionTypeSkill` 语义，并补充对应新模块实现文件
- refactor: 技能分类链路与持久化查询细节同步调整（含 `SkillTag` 仓储查询与分类服务分支），对齐职位类型画像读取路径
- chore: 提交当前后端在途重构代码快照（含 `.mcp.json` 与临时脚本目录变更）
- refactor: 用户端个人资料页“默认职位”下拉切换为 shadcn Select，交互从原生 select 改为统一 combobox 体验
- test: 更新 `user-personal-info-page` 测试为 shadcn Select 交互断言（combobox/option 点击），并保持保存参数校验
- docs: 新增本次“默认职位下拉 shadcn 化”设计、验收与实现计划文档（`docs/superpowers/specs|acceptance|plans/2026-05-07-002929-*`）
- feat: 默认简历全职位匹配改为并发批量执行（并发度固定 4），显著降低串行 AI 匹配总耗时
- feat: 单职位匹配新增失败重试机制（最多 3 次），失败后跳过当前职位并继续处理其他职位
- fix: 匹配失败容错升级为“局部失败不影响整体”，避免单条异常中断整批匹配流程
- refactor: `MatchAppService.triggerMatchForResume` 新增并发汇总日志，输出成功数/跳过数/总耗时
- test: 扩展 `MatchAppServiceTest`，覆盖“失败三次后跳过”与“第三次重试成功”场景
## 2026-05-06

- feat: 个人资料页新增“期望职位”多选与“默认职位”设置，期望职位可从职位树选择并随资料保存
- refactor: 抽离并复用职位选择弹窗组件 `PositionTypePickerModal`，用户职位页与个人资料页共用同一交互能力
- feat: `/person/info` 扩展 `expectedPositionTypeIds/defaultPositionTypeId` 读写字段，后端新增有效叶子职位校验
- feat: 个人图谱分类新增“默认职位优先”策略：存在默认职位时按该职位技能分类配置执行；无配置时触发 AI bootstrap 后继续分类
- feat: 数据库新增迁移 `V2026_05_06_030__add_person_expected_position_fields.sql`，并同步更新 `schema.sql`
- test: 更新后端 `PersonControllerTest`、`PositionTypeSkillClassificationServiceTest` 与前端个人资料/职位页相关测试，目标用例通过

- feat: 简历上传与重新解析新增“是否刷新所有职位匹配记录”可选开关，前端默认勾选刷新，用户可取消后仅执行解析
- feat: 后端 `POST /resume/my/upload` 与 `POST /resume/{id}/parse` 新增 `refreshAllMatches` 参数并贯通至 MQ 消息链路
- refactor: 解析消息格式扩展为 `resumeId,parseTaskId,refreshAllMatches`，默认简历仅在 `refreshAllMatches=true` 时触发全量职位匹配刷新
- fix: 保持 `resume-parsed` 事件始终发送，确保技能提取与图数据库图谱更新不受匹配刷新开关影响
- test: 新增并更新前后端测试，覆盖上传/重解析参数透传、默认简历 refresh=false 不触发匹配、前端默认勾选与取消分支
- feat: 设为默认简历新增“是否刷新所有职位匹配记录”可选开关，默认勾选，用户可取消后仅切换默认简历与图谱刷新
- refactor: 简历管理页上传/重解析/设默认统一改为 shadcn 风格确认弹窗（含复选框），替换原生浏览器确认框
- test: 补充并通过设默认刷新开关相关前后端测试，覆盖 `refreshAllMatches` 透传与关闭刷新分支
- fix: 修复简历管理确认弹窗层级与渲染异常，改为项目内自定义弹窗实现（高层级遮罩 + 实体白底弹层），避免页面透明但弹层显示错位问题
- refactor: 个人图谱匹配链路去行业化：`/person/graph` 不再返回 `industryMatch`，仅保留 `positionTypeMatch + skillCategories`，并改为仅基于 `public.position_type_skill_profile` 分类
- refactor: `PositionTypeSkillClassificationService` 移除两阶段行业筛选逻辑（`classifyIndustryFirstPass/SecondPass`），默认路径仅按技能命中职位类型后读取职位类型画像分类
- refactor: 图数据库分类关系改为 `BELONGS_TO_POSITION_TYPE`，个人图谱落图接口改为 `upsertPersonPositionTypeClassification`
- test: 更新个人图谱与职位类型分类相关后端测试，覆盖“无 industryMatch 返回”的新契约与职位类型分类路径
- fix: 个人图谱重建前强制清理旧分类关系（上传/重解析成功、设为默认时），避免历史残留导致“未分类”等旧节点混入
- fix: 前端图谱分类分组改为技能名标准化匹配（如 `JS/JavaScript`、`SpringBoot/Spring Boot`），减少误判到“未分类”
- feat: 简历解析消费者新增结构化结果日志输出（`parseResult`，超长自动截断），便于排查图谱分类与落图异常

- fix: 认证持久化改造，后端新增官方 `sa-token-redis-jackson` 依赖并接入 Redis 持久化，修复后端重启后前端登录态失效问题
- refactor: 认证续期策略对齐 Sa-Token 官方会话模型（`timeout/active-timeout/auto-renew`），移除项目内非官方 `allow-refresh-token` / `refresh-token-timeout` 配置
- refactor: 下线 `/auth/refresh-token` 业务伪接口，统一返回“官方会话模式下不提供 refresh-token 接口，请重新登录”
- test: 更新认证前后端测试（AuthController 单测/集测、frontend authApi 测试），并通过后端定向测试与前端构建+全量测试

- refactor: 删除 `position_type.code` 冗余字段，新增迁移 `V2026_05_06_028__drop_position_type_code_column.sql` 并同步更新 `schema.sql` 与 `V2026_05_06_027__add_position_type_comments.sql`
- refactor: 清理职位类型后端 `code/nextCode` 链路（PositionType/PO/Repository/Mapper/AppService/Admin DTO）并移除管理端职位类型详情“编码”展示
- refactor: 调整职位类型 seed SQL 与生成脚本，`INSERT` 去除 `code` 列，幂等冲突键由 `ON CONFLICT (code)` 改为 `ON CONFLICT (id)`
- test: 更新职位类型相关测试断言与数据（`JobSchemaSqlTest`、`PositionTypeSeedSqlTest`、`PositionTypeAppServiceTest`、`AdminAppServiceTest`、`admin-position-types-page.test.tsx`），前后端全量构建与测试通过

- refactor: 清理聊天冗余详情子表落地提交：删除 `chat_message_image`、`chat_message_resume`、`chat_message_interview_invite` 三表及对应未使用 PO，保留 `chat_message.ext` 作为统一扩展字段承载
- feat: 新增迁移脚本 `V2026_05_06_026__drop_unused_chat_message_detail_tables.sql` 并在实库执行删表，确保代码基线与运行库结构一致
- test: `ChatSchemaIT` 新增“三张冗余详情表不存在”断言并通过，后端 `mvn compile` / `mvn test` 全量通过
- refactor: 删除未启用且长期空表的聊天详情子表 `chat_message_image`、`chat_message_resume`、`chat_message_interview_invite`，聊天扩展信息继续统一保留在 `chat_message.ext`
- feat: 新增数据库迁移 `V2026_05_06_026__drop_unused_chat_message_detail_tables.sql`，用于在存量环境幂等清理三张冗余表
- refactor: 同步更新 `backend/src/main/resources/db/schema.sql`，移除三张冗余聊天详情表基线定义，保持基线与迁移一致
- refactor: 删除后端未使用的三张聊天详情表 PO 映射类（`ChatMessageImagePO`、`ChatMessageResumePO`、`ChatMessageInterviewInvitePO`）
- test: 扩展 `ChatSchemaIT`，新增三张冗余聊天详情表不存在断言，防止后续回归引入

## 2026-05-05

- fix: 根据实机反馈二次优化用户端沉浸式图谱页面：收窄左侧菜单宽度、整体与右侧内间距下调、图谱舞台高度提升至更接近满屏
- fix: 调整图谱节点与连线视觉密度（中心球/技能球缩小、描边与字体减小），并下调初始缩放级别，避免首屏“球体过大聚团”
- fix: 增强图谱初始排布参数（link 距离/charge 斥力/zoomToFit padding）以拉开节点分布，提升首屏可读性

- feat: 用户端“我的图谱”重构为沉浸式可拖拽技能图谱舞台，接入 `react-force-graph-2d`，支持节点拖拽、画布平移缩放与视角重置
- feat: `/person/graph` 接口新增返回 `realName` 与 `avatarUrl`（兼容保留 `personId/skills/success`），前端中心节点改为展示真实姓名（空值回退“求职者”）
- refactor: 图谱页布局由“主卡片 + 右侧统计卡”调整为“全幅图谱 + 右下角纯数字能力概览”，能力信息继续只读 `/person/ability-assessment`
- fix: 保留左侧“我的页面菜单”尺寸与结构，并在图谱路由下切换为透明视觉风格，减少对沉浸式背景的遮挡
- test: 新增并更新 `PersonControllerTest`、`user-skill-graph-page.test.tsx`、`user-workbench-sidebar.test.tsx`、`user-workbench-layout-consistency.test.tsx` 覆盖图谱接口扩展与页面新交互
- docs: 新增本次改造的 spec / acceptance / plan 文档（`docs/superpowers/specs|acceptance|plans/2026-05-05-200447-*`）

- chore: 汇总提交当前在途改动（默认简历安全重匹配、企业推荐页布局与聊天/个人工作台相关前端调整），并完成前后端构建与前端全量测试校验
- feat: 简历上传流程优化：当用户尚无默认简历时，新上传简历自动标记为默认简历
- feat: 默认简历切换后触发全职位重匹配，手动“设为默认”改为先重建新默认匹配，再清理旧默认匹配记录
- feat: 默认简历解析成功后自动触发全职位匹配重建，确保首次上传并完成解析后可直接生成匹配结果
- refactor: `triggerMatchForResume` 改为“先更新/插入新匹配，再删除过期旧匹配”的安全替换策略，避免新匹配失败导致旧匹配丢失
- test: 新增并更新匹配/简历/解析消费者单测，覆盖自动默认、默认触发链路与安全重匹配替换行为
- fix: 图片消息展示精简为仅显示图片本体，不再显示“图片消息”标题与文件名
- fix: 企业端候选人资料来源改造：姓名优先取 `person_info.real_name`，邮箱优先取 `sys_user.username`（并回退 `person_info.email`）
- test: 新增企业端候选人“真实姓名 + 完整邮箱”显示断言，覆盖聊天页资料展示回归
- fix: 聊天页桌面端容器高度进一步校正（去除桌面纵向外边距并按顶栏 64px 精确扣减），修复页面仍可轻微下滚的问题
- fix: 聊天页桌面端高度改为贴近可视区满高（列表与详情区统一拉满），消除下方大块空白
- feat: 聊天会话摘要接口新增候选人资料字段（邮箱/年龄/性别/学历），企业端沟通页顶部与列表改为展示候选人姓名、完整邮箱与基础信息
- refactor: 企业端沟通页移除“候选人”标签与ID显示，改为更直接的候选人信息排布
- test: 扩展 `chat-workspace-redesign` 用例，覆盖企业端候选人完整信息展示断言
- fix: 企业端沟通页会话列表与顶部信息改为候选人视角，显示候选人头像与候选人姓名（邮箱仅保留 @ 前名称）
- fix: 修复聊天头像 404 破图，头像加载失败自动回退字母头像；用户端会话列表头像优先使用企业头像来源
- test: 更新 `chat-workspace-redesign` 企业端断言，覆盖候选人名称去邮箱化与顶部候选人信息渲染
- fix: 用户端“我的页面”桌面侧栏移除“沟通消息”，并改为非卡片式左侧线条高亮菜单，整体更简洁
- fix: 修复用户端“我的页面”（个人主页/个人资料/简历管理/我的图谱）在桌面端出现底部空白可继续下滚的问题（页面最小高度改为扣除顶栏高度）
- test: 更新 `user-workbench-sidebar` 断言，覆盖“沟通消息”菜单移除
- feat: 用户端与企业端聊天会话列表新增“职位负责人头像”显示（列表项左侧）
- feat: 用户端与企业端聊天详情顶部公司信息区左侧新增“职位负责人头像”显示
- test: 更新 `chat-workspace-redesign` 断言，覆盖会话列表头像与顶部负责人头像渲染
- fix: 用户端与企业端移动端聊天页外层页面内边距清零，列表页与详情页统一改为贴边展示
- fix: 用户端与企业端移动端聊天外层主卡片圆角改为直角（桌面端仍保持原有圆角）
- feat: 聊天详情页移动端改为固定布局：顶部岗位信息固定、底部输入区固定，仅中间消息列表独立滚动
- test: 扩展 `chat-workspace-redesign` 用例，覆盖“无外层留白、直角容器、头尾固定+中间滚动”断言
- feat: 用户端与企业端移动端聊天页改为“列表与详情分离”流程：`/chat` 与 `/enterprise/chat` 仅显示会话列表，`/chat/[conversationId]` 与 `/enterprise/chat/[conversationId]` 仅显示聊天详情
- feat: 聊天详情页移动端新增左上“返回会话列表”入口，用户端返回 `/chat`，企业端返回 `/enterprise/chat`
- fix: 修复移动端聊天图片消息缩略图越界问题，图片改为按消息容器宽度自适应并限制最大高度
- fix: 收紧移动端聊天页面整体内边距，降低空白占比，提升消息区可视面积
- test: 扩展 `chat-workspace-redesign` 测试，新增用户端/企业端移动端分离布局、返回入口与图片边界/紧凑间距断言
- feat: 聊天表情面板大幅扩容为多分类海量表情库，新增分类切换、分页（上一页/下一页）与固定高度滚动区，支持滚轮长列表浏览
- test: 扩展 `chat-workspace-redesign` 测试，覆盖表情分类切换、分页按钮与固定高度滚动区域断言
- fix: 企业端聊天页同步移除顶部“沟通列表/聊天详情”标题，与用户端保持一致，仅保留会话工作台内容
- feat: 聊天页左侧会话区将“会话列表”标题改为搜索框，支持按关键词实时过滤会话（岗位名/公司名/候选人/最近消息）
- test: 新增聊天工作台会话搜索过滤测试，并更新聊天页布局测试为搜索框断言
- fix: 移除用户端聊天页顶部“沟通消息”标题，仅保留会话工作台内容区，避免与全局顶栏导航文案重复
- test: 更新 `user-workbench-layout-consistency` 测试断言，校验聊天页不再渲染“沟通消息”标题并保留“会话列表”主体
- fix: 修复用户端顶栏在 `/chat` 路由下“我的”菜单被误判为激活态（白字看似消失）的问题；移除 `/chat` 对“我的”子路由映射，确保仅“沟通”高亮
- test: 新增 `mock-user-navbar-active-state` 用例，覆盖 `/chat` 路由下“沟通高亮且我的不高亮”回归场景
- fix: 修复企业端沟通页“下载PDF”401问题，将简历下载从浏览器直链改为走 `chatApi.downloadResume` 鉴权请求（携带 `satoken`），并通过 Blob 方式触发文件下载
- feat: 企业端聊天 PDF 卡片新增“预览PDF”按钮，点击后通过鉴权接口获取 Blob 并在新窗口预览；保留“下载PDF”能力
- fix: 修复 PDF 预览打开 `blob:` 地址出现 404 JSON 页问题；当下载接口返回 JSON 错误体（如 `{"code":404}`）时，前端改为解析并直接提示错误，不再打开错误 Blob 页面
- refactor: PDF 预览改为站内弹层内嵌预览（iframe），不再跳转新页面；支持关闭预览并释放 Blob URL
- fix: 修复站内 PDF 预览弹层显示不完整问题，改为通过 Portal 挂载到 `document.body` 并提升层级，避免被页面容器裁切
- fix: 修复站内 PDF 预览顶部“透明漏底”问题，预览遮罩改为更深不透明背景并提升层级，弹层头部改为纯白底，避免透出页面导航
- feat: 聊天图片消息新增“预览图片”能力，支持会话内鉴权拉取图片并在站内弹层中查看大图
- feat: 后端新增图片预览接口 `GET /chat/conversations/{conversationId}/images/{messageId}/preview`，会话成员可按消息ID预览对应图片
- refactor: 图片消息改为自动内嵌显示缩略图，不再依赖“预览图片”按钮触发加载；点击缩略图仍可放大预览
- fix: 修复图片消息可能长期停留“图片加载中...”的问题；图片加载失败时改为展示错误原因并提供“重试加载图片”按钮
- test: 新增/更新后端 `ChatAppServiceTest`、`ChatControllerIT` 与前端聊天工作台测试，覆盖图片预览链路
- test: 更新 `chat-workspace-redesign` 测试，覆盖“预览PDF + 下载PDF”均通过鉴权接口并触发浏览器行为
- test: 新增 `chat-api-download` 单测，覆盖“JSON 错误 Blob 解析抛错”与“PDF 响应文件名解析”

## 2026-05-04

- feat: 聊天简历消息升级为 PDF 卡片样式，新增“下载PDF”入口，接入会话成员可下载简历文件接口（`GET /chat/conversations/{conversationId}/resume/{resumeId}/download`）
- refactor: 企业端输入区移除“发送通知”独立按钮，仅保留“面试通知”入口并在展开编辑后提供“确认发送面试通知”
- refactor: 聊天输入工具区图片按钮改为相册图标，表情面板扩充为 40 个常用表情
- test: 新增/更新聊天工作台测试，覆盖简历下载链接、企业端按钮收敛、相册按钮与扩展表情渲染

- fix: 企业端聊天输入区样式与用户端对齐，移除默认展开的多输入块；面试通知改为“面试通知/发送通知”按钮并按需展开编辑区

- feat: 用户端与企业端聊天页重构为统一工作台，桌面端升级为左会话右聊天双栏布局，移动端保持“列表进入详情”单栏路径
- feat: 聊天面板新增职位信息头部（负责人/公司/岗位/薪资/地点）与“查看职位”入口，消息新增双方头像与按天时间分隔展示
- feat: 输入区新增表情弹层、图片发送与默认简历直发（用户端），企业端保留并接入面试通知发送动作
- test: 新增 `chat-workspace-redesign` 用例并通过前端 `npm run build` 与 `npm run test:run` 全量验证

- feat: 新增岗位即时沟通能力，用户端与企业端均新增聊天页面（会话列表 `/chat`、`/enterprise/chat` 与会话详情 `/chat/[conversationId]`、`/enterprise/chat/[conversationId]`）
- feat: 用户端职位详情页“立即投递”替换为“立即沟通”，点击后自动发起/复用会话并直达聊天详情页
- feat: 聊天支持文本/表情消息、图片消息、简历卡片消息（用户端）与面试邀请卡片消息（企业端）
- feat: 新增会话已读游标机制（会话级 `recruiter_last_read_msg_id` / `candidate_last_read_msg_id`），支持已读回执实时推送
- refactor: 引入聊天后端模块（chat domain/repository/service/controller + WebSocket + RocketMQ 分发消费者/生产者），消息采用“先落库后分发”策略
- refactor: 岗位模型新增 `owner_user_id` 负责人字段，企业侧按岗位负责人权限控制聊天发言
- refactor: 下线投递与人才库链路，删除 application/talent_pool 相关后端模块、Mapper XML 与用户端投递记录页面入口
- docs: 数据库基线与迁移新增聊天表结构（`chat_conversation`、`chat_message`、`chat_message_image`、`chat_message_resume`、`chat_message_interview_invite`）并补齐表/字段注释
- test: 新增聊天相关后端测试（`ChatSchemaIT`、`ChatControllerIT`、`ChatAppServiceTest`）并更新前端侧边栏/个人主页/页面迁移测试到“沟通消息”新入口

- fix: 用户端消息页 `/notifications` 顶部主导航取消默认回退高亮，进入消息页时不再选中“首页/职位/公司/我的”任一菜单
- test: 新增 `mock-user-navbar-active-state` 用例，覆盖消息页“主导航无激活项”回归场景
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
- feat: 公司资料字段改造：后端与前端移除 `contactEmail`，新增并贯通 `website`（公司官网）字段；用户端公司详情“工商信息”新增官网展示链接，企业端公司资料页移除“联系邮箱”输入并保留官网编辑
- feat: 数据结构同步：新增迁移脚本 `V2026_05_04_023__company_add_website_and_drop_contact_email.sql`（新增 `company.website`、删除 `contact_email`），并同步更新 `backend/src/main/resources/db/schema.sql` 基线定义
- test: 新增并更新后端 `CompanyControllerIT` / `PublicCompanyControllerIT` 与前端公司资料页、公司详情页测试，覆盖“官网读写/返回、联系邮箱移除、官网链接展示”场景；前后端全量测试通过
- chore: 提交认证页品牌文案微调与岗位即时沟通实施计划文档

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


## 2026-05-06

- refactor: 废弃 `industry_skill_profile` 并切换为 `position_type_skill_profile`，新增迁移脚本 `V2026_05_06_029__replace_industry_skill_profile_with_position_type_skill_profile.sql`，同步更新 `schema.sql`（字段：`id/position_type_id/profile_json/create_time/update_time/deleted`）
- refactor: `industryskill` 模块持久化键由 `industry_id` 全面改为 `position_type_id`（Domain/Repository/PO/Mapper/AppService 同步调整）
- refactor: 管理端初始化接口改为职位类型语义与新路由：`POST /admin/position-type-skill-profile/bootstrap`、`POST /admin/position-type-skill-profile/bootstrap/{positionTypeId}`
- feat: 个人技能分类结果新增 `positionTypeMatch` 字段，并基于职位类型技能画像进行分类读取
- test: 更新并通过相关后端测试（schema 断言、分类服务、画像服务、初始化服务、管理端控制器），后端 `mvn compile`、`mvn test` 全通过
- docs: 补充 `public.position_type` 表及全部字段数据库注释迁移脚本（`V2026_05_06_027__add_position_type_comments.sql`），并同步更新 `schema.sql` 中 `position_type.create_time/update_time` 注释
- fix: 用户端我的图谱页视觉与布局多轮优化，桌面端沉浸式背景改为全幅直角舞台并保持左侧菜单固定定位
- fix: 图谱节点力导参数调优，收紧中心空洞并避免双环分层，接近单圈放射效果
- fix: 图谱页夜间模式联动，背景渐变、节点填充/描边/文字与连线粒子随主题自动切换
- fix: 移动端图谱首屏缩团问题修复，改为引擎收敛后二次缩放居中，确保先展开后定格
- test: 更新并通过图谱页前端测试，覆盖新布局与展示行为
- feat: 新增 `industry_skill_profile` 子行业技能分类配置能力，补充 PostgreSQL 表结构与 schema 基线定义（`industry_id + profile_json`）
- feat: 新增行业技能分类后端模块（`industryskill`），支持按子行业读取/写入配置、两阶段 AI 行业判定与技能分类
- feat: 个人图谱接口 `/person/graph` 新增 `industryMatch` 与 `skillCategories` 返回，并在分类后同步写入 Memgraph（Person-Industry-SkillCategory-Skill 关系）
- feat: 管理端新增行业技能分类初始化接口：`POST /admin/industry-skill-profile/bootstrap` 与 `POST /admin/industry-skill-profile/bootstrap/{industryId}`
- feat: 用户端图谱页接入行业匹配与技能分类结果，技能节点按分类着色并展示行业名称
- test: 新增并通过行业技能配置、分类服务、图数据库分类落图、管理端初始化接口相关单测；前后端全量构建与测试通过

## 2026-05-07
- test: 更新移动端行业筛选测试断言，保持行业面板打开时分类菜单可见的行为契约
- fix: 调整移动端职位筛选高级面板布局，行业面板与分类菜单同屏展示并保持筛选切换一致性
- feat: 用户端/企业端桌面沟通页升级为雾面低边框风格，减少线框堆叠并提升层次感（商务克制 + 轻活力）
- refactor: 聊天工作台完成组件化拆分（会话列表/详情头/消息流/输入区/头像/表情面板/预览弹层），ChatWorkspace 收敛为状态与行为编排层
- test: 新增聊天页雾面样式与组件挂载断言，并通过前端全量验证（
pm run test:run、
pm run build）
- docs: 更新协作规范中的暗色主题可读性要求，统一约束背景/边框/滚动条使用主题 token 并要求回归测试覆盖

- fix: 前端鉴权状态改为持久化并增加 `isHydrated` 守卫，修复管理端/企业端/用户端页面刷新后的鉴权闪烁与误跳转
- fix: 安全头中 `img-src` 新增 `NEXT_PUBLIC_API_BASE_URL` 源自动放行，修复后端资源头像在 CSP 下被拦截
- refactor: 聊天工作台边框与焦点态统一使用主题边框 token，修正消息区/会话区在主题切换下的视觉一致性
- docs: `AGENTS.md` 新增夜间模式筛选弹层规范（背景、分隔线、滚动条）并要求对应回归测试覆盖

- fix: 用户端职位页移动端“筛选-公司行业”交互改为两栏联动（左侧主行业、右侧子行业），修复行业显示不全问题，并限制仅可选择子行业
- test: 新增职位页移动端行业筛选回归用例，覆盖“两栏展示 + 仅子行业可选 + 行业参数映射”，前端 `npm run build` 与 `npm run test:run` 通过

- fix: 后端安全与性能加固（按审计项落地）：
- fix: `skill-tags` 写操作改为仅管理员可用（新增控制器级 admin 校验），阻断匿名/普通用户篡改技能词库风险
- fix: `/resume/list` 改为“当前登录用户数据范围”分页查询，不再返回全量用户简历；列表项 `parseResult` 不再对外暴露
- fix: `/match` 查询与触发链路接入“当前用户上下文”权限校验：`detail/list/trigger` 均按 PERSON/COMPANY/ADMIN 角色与资源归属判定，拒绝越权访问
- fix: 聊天图片上传新增严格校验：大小上限、MIME 白名单、扩展名白名单，非法上传统一返回 400
- fix: WebSocket 握手移除 query token 鉴权回退，仅允许 `satoken` 请求头；`/ws/chat` 与全局 CORS 均改为可配置白名单来源
- refactor: 匹配任务查询优化：`triggerMatchForResume` 改用 `jobRepository.findPublished()`，移除 `findAll + 内存过滤` 热路径
- refactor: 角色鉴权优化：`SaTokenConfig` 优先使用会话 `userType`，缺失时再回源 DB，降低 `/admin/*` 与 `/company/*` 访问开销
- refactor: 对象存储优化：`RustFSClient` 增加桶存在检查缓存，避免每次上传重复 `headBucket`
- refactor: 简历写入热路径优化：移除新增简历时每次 `syncResumeIdSequence()` 调用，保留标准自增序列写入
- test: 新增/更新后端测试覆盖上述安全与性能修复点（SkillTag/Resume/Match/Chat/CORS/WS/RustFS/Repository），并通过后端全量校验 `mvn compile`、`mvn test`

- fix: 前端安全加固：移除登录页/管理登录页内置明文测试账号，改为仅 `development` 模式且由 `NEXT_PUBLIC_DEV_*` 环境变量可选预填，生产默认不预填
- fix: 鉴权存储与请求策略收敛：移除前端 `auth-store` 本地持久化（不再写入 localStorage），`apiClient` 仅使用当前域内存 token，不再跨域回退读取或发送其他域 token
- fix: 管理端鉴权接入：`AdminLayoutShell` 统一包裹 `AdminAuthGuard`，补齐 `/admin/*` 页面守卫路径，登录页保留壳层豁免但仍受守卫控制
- fix: 文件预览安全加固：聊天与简历管理页面 PDF 预览 iframe 增加 `sandbox=\"allow-downloads\"`，降低主动内容执行风险
- fix: 新增前端安全响应头：在 `next.config.ts` 添加 CSP、`X-Frame-Options`、`X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy`
- refactor: 聊天页性能优化：会话头像加载改为按 `jobId` 去重聚合请求，减少会话列表 N+1 拉取；消息已读后改为本地增量更新，不再触发会话列表二次全量刷新
- refactor: `publicApi.companies.getById` 增加并发去重缓存，避免同 ID 并发重复请求
- chore: 前端依赖升级 `axios` 至 `^1.15.2`，修复安全审计高危告警并同步锁文件
- test: 新增/更新测试覆盖上述修复点（登录预填策略、admin layout 鉴权接入、token 域隔离、company detail 去重、iframe sandbox、聊天已读刷新行为），前端 `npm run build` 与 `npm run test:run` 全通过

- fix: 个人图谱查询 `/person/graph` 改为仅读取 Memgraph 已落图的职位分类结果，不再在查询链路实时触发 AI 技能分类，避免刷新页面重复调用 AI
- fix: 图谱构建阶段（默认简历切换/解析后重建）新增职位分类落图流程：按技能分类结果写入 `positionTypeMatch + skillCategories`，将分类计算前置到简历变更事件
- fix: 分类结果写入前补齐“未分配技能”归并逻辑（优先并入首分类），避免分类漏项导致前端长期出现 `未分类` 兜底节点
- test: 新增并更新 `PersonControllerTest`、`GraphBuildServiceTest`、`SkillGraphClientTest`，覆盖“查询不触发 AI、构建时落图、分类读取接口”回归场景；后端 `mvn compile`、`mvn test` 全通过

- fix: 恢复开发环境登录自动填充：用户登录页按角色自动预填内置 dev 账号（支持 `NEXT_PUBLIC_DEV_JOBSEEKER_*`、`NEXT_PUBLIC_DEV_RECRUITER_*` 覆盖），管理登录页恢复 dev 默认预填（支持 `NEXT_PUBLIC_DEV_ADMIN_*` 覆盖），生产环境仍保持不预填

- feat: 新增公开热门搜索能力（Redis ZSet）：后端增加 `GET /public/jobs/hot-searches` 与 `GET /public/companies/hot-searches`，并在 `GET /public/jobs`、`GET /public/companies` 搜索时自动统计有效关键词热度
- feat: 用户端职位页与公司页搜索框新增热门搜索下拉：点击/聚焦搜索框即展示热门词（含热度），支持点击一键回填关键词并触发同页检索链路
- refactor: 新增前端通用组件 `hot-search-dropdown`，统一处理 loading/empty/item 交互；`publicApi` 同步补充 jobs/companies 热搜读取方法
- test: 新增并通过后端热门搜索集成测试（`PublicJobControllerIT`、`PublicCompanyControllerIT`）与前端 API/组件测试（`public.test.ts`、`hot-search-dropdown.test.tsx`）
- test: 按前后端联合改动面完成全量验证：`mvn compile`、`mvn test`、`npm run build`、`npm run test:run` 全通过




- feat: 引入 Redisson 分布式并发闸门（RPermitExpirableSemaphore）到简历异步上传与解析 MQ 消费链路，分别限制 `resume-upload-async` 与 `resume-parse` 并发执行，缓解高并发时对象存储/OCR/AI/DB 资源争抢
- feat: 新增 `RedissonConfig`，复用 `spring.data.redis` 配置生成 `RedissonClient`，避免双配置漂移并支持多实例共享并发额度
- feat: 新增并发配置项 `app.concurrent.resume-upload.*` 与 `app.concurrent.resume-parse.*`（semaphore 名称、permits、acquire wait、lease）
- fix: 修复消费者早抛异常路径 permit 释放缺失问题，确保任务不存在/初始化失败等边界场景也会释放并发许可，防止额度泄露
- test: 新增消费者并发闸门单测覆盖（获取失败快速失败、成功/失败路径释放 permit、业务逻辑隔离验证），并通过 `mvn compile` 与定向 `mvn test`
