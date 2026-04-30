# 用户端与企业端页面替换设计与旧页面备份

## 背景

本次需求不是局部改样式，而是一次成体系的前端替换：

1. 使用 `docs/graphhire用户端新页面` 替换当前用户端页面
2. 使用 `docs/graphhire企业端新页面` 替换当前企业端页面
3. 删除当前项目中的用户端手机版、企业端手机版及对应切换逻辑
4. 将原型中的 React Router / Vite 页面迁移为当前项目的 Next App Router 结构
5. 在正式改造前，先对当前桌面页面功能和结构做一份可回溯备份

本文件先承担两件事：

- 记录当前正式页面与移动端链路的基线
- 给后续重写提供迁移边界和约束

## 分析范围

- 新用户端原型：`docs/graphhire用户端新页面`
- 新企业端原型：`docs/graphhire企业端新页面`
- 当前桌面用户端：`frontend/src/app/(user)`、`frontend/src/app/page.tsx`
- 当前桌面企业端：`frontend/src/app/enterprise`
- 当前移动用户端：`frontend/src/app/mobile-user`
- 当前移动企业端：`frontend/src/app/mobile-enterprise`
- 桌面共享壳：`frontend/src/components/layout`、`frontend/src/components/user`、`frontend/src/components/enterprise`
- 移动端重写与路由适配：`frontend/middleware.ts`、`frontend/src/proxy.ts`、`frontend/src/lib/device-routing.ts`
- 已有 memory：`docs/superpowers/memory/modules/mobile-user-app-shell.md`、`docs/superpowers/memory/modules/enterprise-console-shell.md`

## 结论摘要

### 结论一：两个原型目录都不能直接整包覆盖正式页面目录

原因一致：

- 原型是独立 React/Vite 项目，不是 Next App Router
- 原型内部使用 `BrowserRouter` 和本地页面 state
- 原型主要依赖 mock 数据，不是现有正式接口
- 原型内仍然带有明显的移动端壳组件，如 `BottomNav`、`MobileLayout`

因此，正确路线不是“直接复制覆盖”，而是：

1. 保留正式 Next.js 路由树
2. 保留正式鉴权与 API 能力
3. 以原型的页面结构、视觉风格、交互组织为蓝本，逐页迁移到现有路由
4. 在迁移完成后彻底删掉移动端内部实现和移动端重写逻辑

### 结论二：当前移动端实现可以删，但不能直接物理删除后就结束

因为移动端目录仍被多个位置引用：

- `frontend/middleware.ts` 仍会把公开用户/企业路径 rewrite 到 `/mobile-user/**`、`/mobile-enterprise/**`
- `frontend/src/lib/device-routing.ts` 维护了公开路径和移动内部路径的双向映射
- `frontend/src/app/mobile-user/**`、`frontend/src/app/mobile-enterprise/**` 仍是运行时入口
- `frontend/src/tests/lib/device-routing.test.ts` 和多组 `mobile-*` 页面测试直接依赖这套逻辑
- `frontend/src/proxy.ts` 还有一套仅用户端的移动重写逻辑，和 `middleware.ts` 不一致

所以“删手机版”实际包含四类清理：

1. 删目录：`frontend/src/app/mobile-user`、`frontend/src/app/mobile-enterprise`
2. 删重写：`frontend/middleware.ts`、`frontend/src/proxy.ts` 中的移动 rewrite
3. 删映射：`frontend/src/lib/device-routing.ts`
4. 删测试：所有依赖移动端目录或 rewrite 的测试

### 结论三：正式迁移时应默认保留现有真实业务能力

当前正式页面中，以下能力已经接正式接口：

- 用户端：首页职位/企业聚合、职位列表、职位详情、公司列表、公司详情、个人资料、简历、通知、能力图谱
- 企业端：工作台、职位列表/详情/创建/编辑、智能推荐、员工管理、通知中心

而新原型目录当前大多数页面使用 mock 数据。若整包照搬，会导致：

- 丢失真实 API
- 丢失认证守卫
- 丢失当前 Next 路由契约
- 行为从“真实业务页”退化成“静态演示页”

因此，迁移应以“保留真实数据和流程，只替换页面组织与视觉”为默认原则。

## 当前正式页面结构备份

### 一、桌面用户端结构

```text
公开入口
  /
  /jobs
  /jobs/[id]
  /companies
  /companies/[id]
  /profile
  /resume/manage
  /resume/upload
  /applications
  /notifications
  /skill-graph
  /login
  /register

页面壳
  src/app/page.tsx
    HomePageClient

  src/app/(user)/layout.tsx
    UserLayout
      Header
      Sidebar(仅 profile/resume/applications)
      RouteTransition
      Footer(详情页隐藏)
```

用户端壳的关键行为：

- `/profile`、`/resume/**`、`/applications` 显示左侧边栏
- `/jobs/[id]` 等详情页隐藏页脚
- 用户端桌面页面统一走 `UserLayout`

### 二、桌面企业端结构

```text
/enterprise
  /dashboard
  /jobs
  /jobs/new
  /jobs/[id]
  /jobs/[id]/edit
  /recommendations
  /employees
  /notifications

页面壳
  src/app/enterprise/layout.tsx
    EnterpriseAuthGuard
      EnterpriseHeader
      RouteTransition
        具体业务页
```

企业端壳的关键行为：

- 必须是企业身份，否则跳转 `/login`
- 顶部导航当前公开四个主入口：工作台、职位管理、候选人推荐、员工管理
- `/enterprise/notifications` 是页面入口，但不在顶部主导航中
- 企业端内容宽度和留白由 `EnterpriseContent` 统一控制

### 三、当前移动端结构

```text
内部移动用户端
  /mobile-user/**

内部移动企业端
  /mobile-enterprise/**

公开路径到移动端的切换
  middleware.ts
  src/lib/device-routing.ts
  src/proxy.ts(用户端旧逻辑)
```

移动端不是单独产品入口，而是通过 rewrite 挂在现有公开 URL 后面的内部实现。

## 当前正式页面功能备份

### 一、用户端页面功能清单

#### 1. 首页 `/`

- 读取正式首页聚合接口
- 展示搜索框、热门城市、精选职位、热门企业
- 搜索跳转到 `/jobs`
- 提供加载失败后的重试

#### 2. 职位列表 `/jobs`

- 按关键词和城市搜索真实职位
- 展示职位卡片、公司、城市、薪资、技能标签
- 点击进入 `/jobs/[id]`
- 带滚动显现动画

#### 3. 职位详情 `/jobs/[id]`

- 读取真实职位详情
- 支持“智能匹配”并行加载图谱分数和匹配详情
- 支持使用默认简历直接投递
- 展示薪资、发布日期、职位类型、匹配度和匹配解释

#### 4. 公司列表 `/companies`

- 按公司关键词搜索真实企业
- 展示企业简介、认证状态、城市、热招职位数
- 点击进入 `/companies/[id]`

#### 5. 公司详情 `/companies/[id]`

- 读取真实企业详情
- 读取该企业公开职位列表
- 在详情页里继续跳转到具体职位

#### 6. 个人资料 `/profile`

- 读取和保存真实个人资料
- 上传头像
- 展示资料完整度
- 包含求职意向信息

#### 7. 简历管理 `/resume/manage`

- 读取用户简历列表
- 设置默认简历
- 触发重新解析
- 删除简历
- 预览简历文件
- 进入上传页 `/resume/upload`

#### 8. 简历上传 `/resume/upload`

- 选择 PDF / Word 文件上传
- 查询后端解析进度
- 解析完成后返回简历管理

#### 9. 投递记录 `/applications`

- 读取真实投递记录
- 按状态筛选
- 前端分页

#### 10. 通知中心 `/notifications`

- 读取真实通知列表和未读数
- 按类别筛选
- 全部标记已读
- 单条标记已读
- 根据通知类型跳转职位或图谱页面

#### 11. 能力图谱 `/skill-graph`

- 读取技能图谱和能力评估
- 使用 `react-force-graph-2d` 绘制关系图
- 支持聚焦节点、缩放、重置视图

#### 12. 登录 `/login`

- 区分求职者/招聘者登录
- 根据返回角色写入对应 auth store
- 成功后分别跳转用户端首页或企业端工作台

#### 13. 注册 `/register`

- 区分求职者/招聘者注册
- 求职者注册后进入 `/`
- 企业注册后进入 `/enterprise/dashboard` 或审核提示流程

### 二、企业端页面功能清单

#### 1. 工作台 `/enterprise/dashboard`

- 读取企业信息和仪表盘数据
- 展示待处理投递、新匹配候选人、在招职位
- 展示近期发布职位
- 提供发布职位、查看推荐、员工管理快捷入口

#### 2. 职位管理 `/enterprise/jobs`

- 按状态筛选职位
- 按关键词搜索职位
- 展示曝光量、投递数、高匹配数
- 发布职位、关闭职位
- 跳转职位详情和候选人推荐

#### 3. 新增职位 `/enterprise/jobs/new`

- 填写职位名称、城市、薪资、描述
- 前端校验必填和薪资合法性
- 创建后立即发布

#### 4. 职位详情 `/enterprise/jobs/[id]`

- 读取真实职位详情
- 查看技能要求、描述、状态、招聘人数、发布时间
- 触发职位匹配
- 跳转编辑页和推荐页

#### 5. 编辑职位 `/enterprise/jobs/[id]/edit`

- 回填职位数据
- 修改职位核心字段
- 保存后返回详情页

#### 6. 智能推荐 `/enterprise/recommendations`

- 读取已发布职位列表
- 按职位查看真实推荐简历
- 搜索候选人
- 一键触发匹配
- 发送面试邀请

#### 7. 员工管理 `/enterprise/employees`

- 读取员工统计、员工列表、待审批加入列表
- 新建员工账号
- 重置员工密码
- 启用/禁用员工
- 通过/拒绝加入申请

#### 8. 通知中心 `/enterprise/notifications`

- 读取企业通知列表和未读数
- 按通知类型筛选
- 单条标记已读
- 全部标记已读
- 清空已读

## 新原型页面清单备份

### 一、用户端原型 `docs/graphhire用户端新页面`

路由：

- `/`
- `/login`
- `/register`
- `/jobs`
- `/jobs/:id`
- `/companies`
- `/companies/:id`
- `/profile`
- `/resume`
- `/applications`
- `/notifications`
- `/graph`
- `/personal-info`

关键事实：

- 同时包含 `Navbar` 和 `BottomNav`
- 明显是移动优先，同时兼顾桌面响应式
- 页面数据来自 `mockData.ts`
- 还包含主题切换 `ThemeContext`

### 二、企业端原型 `docs/graphhire企业端新页面`

路由：

- `/`
- `/jobs`
- `/jobs/create`
- `/jobs/:id`
- `/jobs/:id/edit`
- `/recommendations`
- `/candidate/:id`
- `/team`
- `/messages`

关键事实：

- 顶层壳是 `MobileLayout`
- 同时包含 `TopNav` 和 `BottomNav`
- 页面数据来自 `src/lib/mockData.ts`
- `team`、`messages`、`candidate/:id` 的命名与当前正式企业端不一致

## 迁移冲突清单

### 一、路由命名冲突

用户端：

- 原型用 `/resume`，正式页面是 `/resume/manage` 与 `/resume/upload`
- 原型用 `/graph`，正式页面是 `/skill-graph`
- 原型有 `/personal-info`，正式页面没有独立公开路由

企业端：

- 原型用 `/team`，正式页面是 `/enterprise/employees`
- 原型用 `/messages`，正式页面是 `/enterprise/notifications`
- 原型有 `/candidate/:id`，正式企业端没有该公开路由

### 二、数据能力冲突

- 原型大多是 mock 数据与本地状态
- 正式页已接真实 API
- 原型若直接照搬，会导致真实业务流程失效

### 三、布局目标冲突

- 你的需求是“不要手机版”
- 两个原型目录却都带底部导航、移动容器和移动断点布局
- 迁移时要保留桌面结构与视觉语言，剔除移动壳逻辑，而不是照搬 `BottomNav`

## 推荐迁移基线

在没有额外业务降级说明的前提下，建议按以下原则实施：

1. 保留现有公开 URL 契约，避免影响已有跳转、鉴权和测试语义
2. 保留现有真实 API 和鉴权守卫
3. 仅将原型页面的视觉结构、信息层次、组件布局迁移到 Next.js
4. 用户端和企业端都不再保留独立手机版目录
5. 删除所有移动 rewrite、内部移动路由和移动端专属组件

## 本次备份后的下一步

1. 基于本文件输出正式迁移设计
2. 明确新原型页面和现有公开 URL 的映射表
3. 先用测试锁定“删除移动端 rewrite 和目录”的行为
4. 再按用户端、企业端两个批次逐页迁移

