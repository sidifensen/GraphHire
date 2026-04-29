# 企业端页面替换分析与旧页面备份

## 背景

本次分析的目标不是立即改代码，而是先回答三个问题：

1. `docs/graphhire企业端新页面` 能不能直接替换当前 `frontend/src/app/enterprise`
2. `frontend/src/app/mobile-enterprise` 能不能直接删除
3. 当前旧企业端页面有哪些功能、哪些已经真实接后端、页面层次是什么

本次只做静态分析和备份文档，不改业务代码。

## 分析范围

- 新设计原型：`docs/graphhire企业端新页面`
- 当前桌面企业端：`frontend/src/app/enterprise`
- 当前移动企业端：`frontend/src/app/mobile-enterprise`
- 企业端共享组件：`frontend/src/components/enterprise`
- 企业端路由映射：`frontend/src/lib/device-routing.ts`
- 移动重写入口：`frontend/middleware.ts`、`frontend/src/proxy.ts`
- 前端接口层：`frontend/src/lib/api/company.ts`、`frontend/src/lib/api/notification.ts`、`frontend/src/lib/api/auth.ts`
- 企业端鉴权与状态：`frontend/src/components/enterprise/EnterpriseAuthGuard.tsx`、`frontend/src/lib/stores/auth-store.ts`
- 后端控制器：`backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`、`backend/src/main/java/com/graphhire/notification/interfaces/controller/NotificationController.java`、`backend/src/main/java/com/graphhire/application/interfaces/controller/CompanyApplicationController.java`

## 结论

### 结论一：不能把 `docs/graphhire企业端新页面` 直接整体替换当前 `frontend/src/app/enterprise`

原因不是样式问题，而是运行时语义不同：

- 新设计原型是独立的 Vite + React Router SPA
- 当前正式企业端是 Next App Router 页面树
- 新设计原型的数据全部是 mock / 本地 state
- 当前正式企业端的大部分页面已经接了真实后端接口和企业账号鉴权
- 新设计原型的路由命名是移动语义：`/team`、`/messages`、`/candidate/:id`
- 当前正式企业端的公开契约是桌面企业语义：`/enterprise/employees`、`/enterprise/notifications`，且没有公开 `candidate` 详情页

因此，直接替换会同时丢失：

- 企业鉴权守卫
- 真实职位/推荐/员工/通知接口接入
- 当前公开 `/enterprise/**` 路由契约
- 当前桌面企业端的页面层次与行为

### 结论二：`docs/graphhire企业端新页面` 与 `frontend/src/app/mobile-enterprise` 是同一套设计谱系，但不是可直接覆盖的同构目录

两者高度相似的部分：

- 导航项一致：工作台、职位、推荐、团队
- mock 数据模型一致：`mockJobs`、`mockCandidates`、`mockNotifications`
- 页面语义一致：`Dashboard`、`Jobs`、`JobCreate`、`JobDetail`、`JobEdit`、`Recommendations`、`Team`、`Messages`
- 都是移动优先 UI

两者的主要差异：

- `docs/graphhire企业端新页面` 是独立 React Router 结构：`App.tsx + main.tsx + MobileLayout`
- `frontend/src/app/mobile-enterprise` 是 Next App Router 结构：`layout.tsx + page.tsx + 子路由目录`
- 新设计原型增加了更多桌面响应式布局、侧栏、统计区块和视觉增强
- `mobile-enterprise` 带有 Next 内部路由适配层，会把内部移动路径映射回公开企业路径
- `mobile-enterprise` 额外挂了 `EnterpriseAuthGuard`

可以把它理解成：

- `docs/graphhire企业端新页面` 是最新设计稿代码
- `frontend/src/app/mobile-enterprise` 是将该设计稿移植进现有 Next 项目后的运行时版本

### 结论三：`frontend/src/app/mobile-enterprise` 现在不适合直接删除

不是因为它业务重要，而是因为它仍然被项目其他位置引用：

- `frontend/src/lib/device-routing.ts` 里存在企业端到移动内部路由的映射
- `frontend/src/tests/app/*mobile-enterprise*` 有多组直接引用它的测试
- `frontend/src/tests/lib/device-routing.test.ts` 直接校验了企业路由与 `mobile-enterprise` 的映射关系
- `mobile-enterprise` 目录本身仍然承载企业端移动壳和内部详情页

另外，仓库里当前同时存在两套移动改写入口，且逻辑不一致：

- `frontend/middleware.ts` 会区分用户端和企业端，并把企业端路由重写到 `mobile-enterprise`
- `frontend/src/proxy.ts` 只把用户端路由重写到 `mobile-user`，没有企业端映射

删除 `mobile-enterprise` 之前，至少要先确认实际生效的是哪一套入口，并同步清理：

- `device-routing.ts`
- 测试文件
- 可能的运行时 rewrite

### 最推荐的后续方向

如果目标是“后面只维护一套新页面”，推荐路线不是直接拿原型覆盖正式企业端，而是：

1. 保留当前公开 `/enterprise/**` 路由契约不变
2. 以 `docs/graphhire企业端新页面` 的视觉和布局为蓝本
3. 在 `frontend/src/app/enterprise` 现有页面上逐页替换 UI
4. 保留当前 Next 路由、鉴权、接口接入
5. 等桌面企业端完成迁移后，再决定是否移除 `mobile-enterprise`

这样后续确实可以只在“新页面风格”的一套实现上继续改，但这套实现应该落在正式的 `frontend/src/app/enterprise`，而不是直接拿原型目录上线。

## 三套实现差异总表

| 维度 | 当前桌面企业端 `frontend/src/app/enterprise` | 当前移动企业端 `frontend/src/app/mobile-enterprise` | 新设计原型 `docs/graphhire企业端新页面` |
| --- | --- | --- | --- |
| 运行框架 | Next App Router | Next App Router | Vite + React Router |
| 布局壳 | `EnterpriseAuthGuard + EnterpriseHeader + EnterpriseContent` | `EnterpriseAuthGuard + MobileEnterpriseShell + BottomNav` | `MobileLayout + TopNav + BottomNav` |
| 数据来源 | 真实接口 + 页面本地 state | 几乎全 mock | 全 mock |
| 企业鉴权 | 有 | 有 | 无 |
| 公开路径语义 | `/enterprise/**` | 内部 `/mobile-enterprise/**`，再映射回 `/enterprise/**` | 原型自身 `/`、`/jobs`、`/team`、`/messages` |
| 页面命名 | `employees`、`notifications` | `team`、`messages` | `team`、`messages` |
| 候选人详情页 | 无公开独立页 | 有内部 `/candidate/[id]` | 有 `/candidate/:id` |
| 真实职位操作 | 有 | 无 | 无 |
| 真实推荐操作 | 有 | 无 | 无 |
| 真实员工管理 | 有 | 无 | 无 |
| 真实通知中心 | 有 | 无 | 无 |
| 当前可直接上线 | 是 | 否，主要是 mock UI | 否，纯原型 |

## 旧页面备份

### 一、页面结构层次

当前正式企业端的结构是：

```text
/enterprise
  layout.tsx
    EnterpriseAuthGuard
      EnterpriseHeader
      main
        RouteTransition
          具体业务页

业务页：
  /enterprise/dashboard
  /enterprise/jobs
  /enterprise/jobs/new
  /enterprise/jobs/[id]
  /enterprise/jobs/[id]/edit
  /enterprise/recommendations
  /enterprise/employees
  /enterprise/notifications
```

关键层次说明：

- `layout.tsx` 只负责企业端公共壳，不负责业务数据
- `EnterpriseAuthGuard` 负责企业身份校验，不通过则跳 `/login`
- `EnterpriseHeader` 负责顶部导航、当前高亮、账号头像与退出登录
- `EnterpriseContent` 负责统一桌面内容宽度、间距和留白
- `EnterprisePageHeader` 负责业务页标题、描述和右侧动作区

### 二、旧页面功能清单

#### 1. 工作台 `/enterprise/dashboard`

功能：

- 读取当前企业名称
- 展示待处理投递、新匹配候选人、在招职位 3 个核心指标
- 展示近期发布职位表格
- 提供“发布新职位”“查看智能推荐”“员工管理”快捷入口
- 提供 loading、error、empty、retry 状态

备注：

- “职位浏览与转化趋势”区块目前还是占位说明，不是完整图表

#### 2. 职位管理 `/enterprise/jobs`

功能：

- 按状态筛选职位：全部、已发布、草稿、已关闭
- 按关键词搜索职位
- 展示职位卡片：标题、部门、薪资、城市、曝光量、投递数、AI 高匹配数
- 点击卡片进入职位详情
- 进入“发布新职位”
- 进入“匹配候选人”
- 单条执行“发布”或“关闭”操作

备注：

- 批量下架、批量修改按钮当前是禁用占位，没有接功能

#### 3. 新增职位 `/enterprise/jobs/new`

功能：

- 填写职位名称、城市、薪资范围、职位描述
- 前端校验必填、正数薪资、最低薪资不能高于最高薪资
- 提交后先创建职位，再立即发布
- 成功后回到职位列表

备注：

- 当前不是草稿流，是“创建并发布”的直发流

#### 4. 职位详情 `/enterprise/jobs/[id]`

功能：

- 按职位 ID 加载真实职位详情
- 展示职位标题、状态、部门、城市、招聘人数、发布时间、薪资范围
- 展示职位描述
- 展示技能要求
- 提供“查看匹配候选人”
- 提供“一键匹配全部候选人”
- 提供“修改职位”

#### 5. 编辑职位 `/enterprise/jobs/[id]/edit`

功能：

- 先加载职位详情回填表单
- 修改职位名称、城市、薪资范围、职位描述
- 保存后返回职位详情页

备注：

- 当前编辑页字段比原型稿少，没有覆盖原型里的部门、经验、学历等扩展字段

#### 6. 智能推荐 `/enterprise/recommendations`

功能：

- 先读取已发布职位列表
- 支持通过 `jobId` 查询参数预选职位
- 切换职位后加载对应真实推荐结果
- 推荐卡片展示候选人名称、推荐度、技能/岗位要求匹配度、匹配理由
- 支持关键字过滤推荐结果
- 支持刷新推荐
- 支持触发匹配
- 支持展开简历更多信息
- 支持发送面试邀请

备注：

- 当前桌面推荐页没有独立公开候选人详情路由，详情信息以列表内展开形式为主

#### 7. 员工管理 `/enterprise/employees`

功能：

- 读取员工统计
- 读取正式员工列表
- 读取待审批加入列表
- 展示企业总人数、企业主数量、管理员数量
- 创建员工账号
- 重置员工密码
- 启用/禁用员工
- 通过加入审批
- 拒绝加入审批

备注：

- 无权限时会显示“仅企业主可查看和管理员工列表”的降级文案
- 当前前端没有单独角色 guard，主要依赖接口报错文本识别 403/Forbidden

#### 8. 通知中心 `/enterprise/notifications`

功能：

- 按类型筛选通知：全部、新推荐、简历投递、认证反馈、系统公告
- 展示总未读数和当前列表未读数
- 单条标记已读
- 全部标记已读
- 清空已读通知

备注：

- 这是公开企业页，但不在顶部主导航里

### 三、旧页面真实接入后端的接口

#### 1. 企业鉴权与账号上下文

- `authApi.getContext()` -> `/auth/context`
- `authApi.logout()` -> `/auth/logout`
- `enterpriseAuthStore` -> 企业端登录状态持久化

用途：

- 企业端 layout 进入前做企业身份校验
- 退出登录时清服务端会话并清本地 store

#### 2. 企业信息与工作台

- `companyApi.getInfo()` -> `GET /company/info`
- `companyApi.getDashboard()` -> `GET /company/dashboard`

#### 3. 职位管理

- `companyApi.getJobList()` -> `GET /company/job/list`
- `companyApi.getJobDetail(jobId)` -> `GET /company/job/{id}`
- `companyApi.createJob(data)` -> `POST /company/job`
- `companyApi.updateJob(jobId, data)` -> `PUT /company/job/{id}`
- `companyApi.publishJob(jobId)` -> `POST /company/job/{id}/publish`
- `companyApi.closeJob(jobId)` -> `POST /company/job/{id}/close`
- `companyApi.triggerJobMatch(jobId)` -> `POST /company/job/{id}/match/trigger`

#### 4. 推荐与面试邀请

- `companyApi.getRecommendedResumes({ jobId })` -> `GET /company/recommend/resumes`
- `companyApi.inviteInterview(data)` -> `POST /company/applications/interview-invite`

#### 5. 员工管理

- `companyApi.getStaffList()` -> `GET /company/staff/list`
- `companyApi.getStaffStats()` -> `GET /company/staff/stats`
- `companyApi.getPendingStaffList()` -> `GET /company/staff/pending`
- `companyApi.createStaff(data)` -> `POST /company/staff/create`
- `companyApi.resetStaffPassword(staffId)` -> `POST /company/staff/{staffId}/reset-password`
- `companyApi.updateStaffStatus(staffId, disabled)` -> `PUT /company/staff/{staffId}/status`
- `companyApi.approveJoinRequest(staffId)` -> `POST /company/staff/{staffId}/approve-join`
- `companyApi.rejectJoinRequest(staffId)` -> `POST /company/staff/{staffId}/reject-join`

#### 6. 通知中心

- `notificationApi.getMyList()` -> `GET /notifications/me`
- `notificationApi.getMyByType(type)` -> `GET /notifications/me/type/{type}`
- `notificationApi.getMyUnreadCount()` -> `GET /notifications/me/unread-count`
- `notificationApi.markAsRead(id)` -> `PUT /notifications/{id}/read`
- `notificationApi.markAllMyAsRead()` -> `PUT /notifications/me/read-all`
- `notificationApi.deleteMyRead()` -> `DELETE /notifications/me/read`

### 四、这些接口是否真的有后端实现

已经在后端控制器中找到对应入口：

- `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`
- `backend/src/main/java/com/graphhire/notification/interfaces/controller/NotificationController.java`
- `backend/src/main/java/com/graphhire/application/interfaces/controller/CompanyApplicationController.java`

已确认存在的正式入口包括：

- `/company/info`
- `/company/dashboard`
- `/company/job`
- `/company/job/list`
- `/company/job/{id}`
- `/company/job/{id}/publish`
- `/company/job/{id}/close`
- `/company/job/{id}/match/trigger`
- `/company/recommend/resumes`
- `/company/staff/list`
- `/company/staff/stats`
- `/company/staff/pending`
- `/company/staff/create`
- `/company/staff/{staffId}/approve-join`
- `/company/staff/{staffId}/reject-join`
- `/company/staff/{staffId}/reset-password`
- `/company/staff/{staffId}/status`
- `/company/applications/interview-invite`
- `/notifications/me`
- `/notifications/me/type/{type}`
- `/notifications/me/unread-count`
- `/notifications/me/read-all`
- `/notifications/me/read`
- `/notifications/{id}/read`

## `mobile-enterprise` 备份结论

### 它现在的本质

`frontend/src/app/mobile-enterprise` 本质上是：

- 一套企业端移动壳
- 一套与新设计原型高度同源的 mock UI
- 只有鉴权是真的
- 绝大部分业务数据和操作都是假的

### 与旧桌面企业端的主要能力差异

移动端当前缺失的真实能力：

- 工作台真实 dashboard 数据
- 职位列表真实搜索/状态操作
- 新建职位真实提交与发布
- 职位详情真实读取与触发匹配
- 编辑职位真实保存
- 推荐列表真实数据、真实邀请、真实匹配
- 员工管理真实统计、审批、创建、密码重置、启停用
- 通知中心真实读取与已读操作

移动端唯一额外新增的明显页面是：

- 内部候选人详情页 `/mobile-enterprise/candidate/[id]`

## 新设计原型备份结论

### 它当前是什么

`docs/graphhire企业端新页面` 当前是一个高保真设计原型，不是正式业务实现。

它的特点：

- 结构完整
- 页面较多
- 响应式更强
- 视觉层次更好
- 但所有业务几乎都没有真实接后端

### 原型里当前没有映射到正式企业端契约的内容

- `/candidate/:id`
- `/interviews`
- `/talent`
- `/analytics`

这些要么只是视觉入口，要么只是内部详情语义，还没有在当前正式企业端公开路由里建立契约。

## 后续迁移建议

### 推荐做法

以“当前正式企业端”为基座，把“新设计原型”的 UI 逐页嫁接进去：

1. 保留 `frontend/src/app/enterprise` 当前目录和公开路由
2. 保留 `EnterpriseAuthGuard`、`companyApi`、`notificationApi`、`enterpriseAuthStore`
3. 把新设计原型的布局、卡片、导航和视觉语言逐页迁入正式页面
4. 迁移完成后，再清理 `mobile-enterprise`

### 不推荐做法

直接做以下操作风险很高：

1. 删除 `frontend/src/app/mobile-enterprise`
2. 用 `docs/graphhire企业端新页面` 全量覆盖 `frontend/src/app/enterprise`

这样会一次性破坏：

- 真实接口接入
- 企业鉴权
- 当前公开路由语义
- 测试
- 移动路径映射

## 当前备份价值

这份文档可以作为后续改版时的基线：

- 旧页面有哪些真实能力
- 哪些是真正接后端的
- 新旧页面差在哪里
- 哪些不能直接替换
- 删除 `mobile-enterprise` 前需要清哪些引用

后续如果开始真正改版，可以基于这份文档继续拆：

- 页面迁移清单
- 路由迁移清单
- 接口迁移清单
- 测试迁移清单
