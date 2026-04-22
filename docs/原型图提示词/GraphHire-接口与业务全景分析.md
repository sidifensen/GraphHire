# GraphHire 图谱智聘 - 项目接口与业务全景分析

## 1. 项目概述

**GraphHire 图谱智聘** — 基于 AI 智能匹配与能力图谱的招聘平台

**核心技术栈**：Spring Boot 3.4.5 + MyBatis-Plus + Redis + Memgraph 图数据库 + DeepSeek AI + RustFS 文件存储

---

## 2. 三大用户角色

| 角色 | 说明 | 权限范围 |
|------|------|----------|
| **个人用户 (Person)** | 求职者，上传简历、查看推荐职位、匹配详情 | 简历管理、个人信息、人岗匹配 |
| **企业用户 (Company)** | 招聘方，发布职位、管理招聘、查看推荐简历 | 企业信息、职位CRUD、推荐简历、候选人匹配 |
| **管理员 (Admin)** | 平台运营，审批企业、监控数据、管理用户 | 仪表盘统计、企业认证审批、用户管理、任务监控 |

---

## 3. 核心业务流程

```
简历上传 → AI智能解析 → 能力图谱构建 → 人岗智能匹配 → 双向推荐通知
     ↓
职位发布 → AI技能提取 → 图谱关联 → 智能匹配 → 候选人推荐
```

### 匹配算法五维度
1. **技能匹配度** — 简历技能 vs 职位要求
2. **经验匹配度** — 工作年限匹配
3. **薪资匹配度** — 期望薪资 vs 职位薪资
4. **地点匹配度** — 目标城市 vs 工作地点
5. **学历匹配度** — 学历要求匹配

---

## 4. API 接口全景图

### 4.1 认证模块 `/auth`

| 接口 | 方法 | 功能 |
|------|------|------|
| `/auth/login` | POST | 用户登录 |
| `/auth/register/person` | POST | 个人用户注册 |
| `/auth/register/company` | POST | 企业用户注册 |
| `/auth/admin/login` | POST | 管理员登录 |
| `/auth/send-verify-code` | POST | 发送验证码 |
| `/auth/forgot-password` | POST | 忘记密码 |
| `/auth/logout` | POST | 登出 |
| `/auth/refresh-token` | POST | 刷新Token |
| `/auth/validate` | GET | 校验Token |
| `/auth/current` | GET | 获取当前用户ID |

### 4.2 企业管理 `/company`

| 接口 | 方法 | 功能 |
|------|------|------|
| `/company/info` | GET/PUT | 获取/更新企业信息 |
| `/company/auth` | POST | 提交认证材料 |
| `/company/job` | POST | 发布职位 |
| `/company/job/list` | GET | 职位列表 |
| `/company/job/{id}` | GET/PUT/DELETE | 职位详情/更新/删除 |
| `/company/job/{id}/status` | PUT | 切换职位状态 |
| `/company/job/{id}/publish` | POST | 发布职位 |
| `/company/job/{id}/close` | POST | 关闭职位 |
| `/company/job/{id}/salary` | PUT | 更新薪资 |
| `/company/job/{id}/parse` | POST | 重新解析 |
| `/company/job/{id}/graph` | GET | 获取职位图谱 |
| `/company/match/{resumeId}` | GET | 匹配详情 (需传jobId参数) |
| `/company/recommend/resumes` | GET | 推荐简历列表 |
| `/company/staff/create` | POST | 创建员工账号 |
| `/company/create` | POST | 创建公司 |
| `/company/{id}` | GET/PUT | 获取/更新公司 |
| `/company/pending` | GET | 获取待审批公司 |

### 4.3 个人用户 `/person`

| 接口 | 方法 | 功能 |
|------|------|------|
| `/person/info` | GET/PUT | 获取/更新个人信息 |
| `/person/graph` | GET | 获取个人能力图谱 |
| `/person/recommend/jobs` | GET | 推荐职位列表 |
| `/person/match/{jobId}` | GET | 与职位的匹配详情 |

### 4.4 简历管理 `/resume`

| 接口 | 方法 | 功能 |
|------|------|------|
| `/resume/my/upload` | POST | 上传简历 |
| `/resume/my` | GET | 我的简历列表 |
| `/resume/{id}/detail` | GET | 简历详情 |
| `/resume/{id}` | DELETE | 删除简历 |
| `/resume/{id}/default` | PUT | 设置默认简历 |
| `/resume/{id}/parse` | POST | 重新解析 |
| `/resume/list` | GET | 简历列表(分页) |

### 4.5 智能匹配 `/match`

| 接口 | 方法 | 功能 |
|------|------|------|
| `/match/trigger` | POST | 触发匹配 |
| `/match/{matchId}/detail` | GET | 匹配详情 |
| `/match/resume/{resumeId}/list` | GET | 简历的匹配列表 |
| `/match/job/{jobId}/list` | GET | 职位的匹配列表 |

### 4.6 技能标签 `/skill-tags`

| 接口 | 方法 | 功能 |
|------|------|------|
| `/skill-tags` | GET/POST | 获取所有/创建技能标签 |
| `/skill-tags/{id}` | GET/PUT/DELETE | 标签详情/更新/删除 |
| `/skill-tags/name/{name}` | GET | 按名称查询 |
| `/skill-tags/category/{category}` | GET | 按分类获取 |
| `/skill-tags/{id}/synonyms` | POST/DELETE | 添加/移除同义词 |
| `/skill-tags/normalize` | POST | 标准化技能列表 |
| `/skill-tags/{id}/category` | PUT | 更新分类 |

### 4.7 通知系统 `/notifications`

| 接口 | 方法 | 功能 |
|------|------|------|
| `/notifications/{id}` | GET/DELETE | 通知详情/删除 |
| `/notifications/user/{userId}` | GET | 用户所有通知 |
| `/notifications/user/{userId}/unread` | GET | 未读通知 |
| `/notifications/user/{userId}/type/{type}` | GET | 按类型获取 |
| `/notifications/user/{userId}/unread-count` | GET | 未读数量 |
| `/notifications/{id}/read` | PUT | 标记已读 |
| `/notifications/{id}/unread` | PUT | 标记未读 |
| `/notifications/user/{userId}/read-all` | PUT | 全部已读 |

### 4.8 管理员 `/admin`

| 接口 | 方法 | 功能 |
|------|------|------|
| `/admin/login` | POST | 管理员登录 |
| `/admin/dashboard/stats` | GET | 仪表盘统计 |
| `/admin/company/auth/{id}` | PUT | 企业认证审批 |
| `/admin/user/{id}/status` | PUT | 修改用户状态 |
| `/admin/user/disable` | POST | 禁用用户 |
| `/admin/user/list` | GET | 用户列表 |
| `/admin/resume/list` | GET | 简历列表 |
| `/admin/job/list` | GET | 职位列表 |
| `/admin/skill/list` | GET | 技能标签列表 |
| `/admin/task/list` | GET | 解析任务列表 |
| `/admin/task/{id}/retry` | POST | 重试任务 |
| `/admin/company/pending` | GET | 待审批企业列表 |
| `/admin/company/{id}/approve` | POST | 审批通过 |
| `/admin/company/{id}/reject` | POST | 审批拒绝 |
| `/admin/company/auth-list` | GET | 按状态获取公司 |

---

## 5. 核心数据模型

### 5.1 User（用户）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 用户唯一标识 |
| username | String (邮箱) | 用户名 |
| password | String (BCrypt) | 加密密码 |
| userType | Enum | PERSON/COMPANY/ADMIN |
| status | Enum | 账号状态 |
| failedLoginCount | Integer | 连续登录失败次数 |
| lockedUntil | LocalDateTime | 账号锁定截止时间 |

### 5.2 Company（企业）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 企业ID |
| name | String | 企业名称 |
| unifiedSocialCreditCode | String | 统一社会信用代码 |
| authStatus | Enum | 认证状态 |
| licenseUrl | String | 营业执照URL |
| contactName | String | 联系人姓名 |
| contactPhone | String | 联系人电话 |
| contactEmail | String | 联系人邮箱 |
| description | String | 企业简介 |
| website | String | 企业官网 |

### 5.3 Job（职位）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 职位ID |
| companyId | Long | 所属企业ID |
| title | String | 职位名称 |
| department | String | 部门 |
| headcount | Integer | 招聘人数 |
| location | Object | 工作地点 |
| salaryRange | Object | 薪资范围 |
| requiredSkills | List<String> | 必填技能 |
| preferredSkills | List<String> | 优先技能 |
| status | Enum | DRAFT/PUBLISHED/CLOSED |
| description | String | 职位描述 |
| filePath | String | 文档存储路径 |
| parseStatus | Enum | AI解析状态 |
| parseResult | String | AI解析结果JSON |
| confidence | BigDecimal | 解析置信度 |
| publishedAt | LocalDateTime | 发布时间 |

### 5.4 Resume（简历）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 简历ID |
| userId | Long | 上传用户ID |
| fileName | String | 文件名称 |
| filePath | String | 文件存储路径 |
| fileType | String | MIME类型 |
| fileSize | Long | 文件大小 |
| status | Enum | 解析状态 |
| parseResult | String | AI解析结果JSON |
| parseError | String | 解析错误信息 |
| confidence | BigDecimal | 解析置信度 |
| isDefault | Boolean | 是否默认简历 |

### 5.5 PersonInfo（个人信息）
| 字段 | 类型 | 说明 |
|------|------|------|
| realName | String | 真实姓名 |
| gender | Integer | 性别(0未知/1男/2女) |
| age | Integer | 年龄 |
| phone | String | 联系电话 |
| education | String | 学历 |
| city | String | 所在城市 |
| targetCity | String | 目标城市 |
| expectedSalary | Integer | 期望薪资 |

### 5.6 SkillTag（技能标签）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 技能标签ID |
| name | String | 标签名称 |
| category | Enum | 技能分类 |
| synonyms | Set<String> | 同义词集合 |
| description | String | 标签描述 |
| usageCount | Integer | 使用计数 |

### 5.7 MatchRecord（匹配记录）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 匹配记录ID |
| resumeId | Long | 关联简历ID |
| jobId | Long | 关联职位ID |
| score | Object | 匹配分数(五维度) |
| level | Enum | HIGH/MEDIUM/LOW |
| matchReason | String | 匹配原因 |
| isRead | Boolean | 是否已读 |
| matchDirection | Integer | 1求职者投递/2企业推荐 |

### 5.8 Notification（通知）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 通知ID |
| userId | Long | 所属用户ID |
| type | Enum | 通知类型 |
| title | String | 通知标题 |
| content | String | 通知内容 |
| isRead | Boolean | 已读状态 |
| readTime | LocalDateTime | 已读时间 |
| metadata | String | 扩展元数据(JSON) |
| referenceId | Long | 关联业务ID |
| createdAt | LocalDateTime | 创建时间 |

### 5.9 ParseTask（解析任务）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 任务ID |
| resumeId | Long | 关联简历ID |
| jobId | Long | 关联职位ID(可选) |
| taskType | String | 任务类型 |
| status | Enum | PENDING/RUNNING/SUCCESS/FAILED |
| retryCount | Integer | 重试次数 |
| errorMessage | String | 错误信息 |

---

## 6. 认证机制

- **框架**: Sa-Token 1.45.0
- **Token名称**: `satoken`
- **Token有效期**: 24小时
- **Refresh Token有效期**: 7天

### 公开接口（无需认证）
- `/auth/**` - 全部放行
- `/admin/login` - 放行
- `/notifications/**` - 放行
- `/skill-tags/**` - 放行

### 需认证接口
- `/company/**` - 企业用户
- `/person/**` - 个人用户
- `/resume/**` - 登录用户
- `/match/**` - 登录用户
- `/admin/**` (除login外) - 管理员

---

## 7. 页面/功能清单

### 7.1 公开页面
- [ ] 首页/Hero区域
- [ ] 职位搜索页
- [ ] 热门职位列表
- [ ] 热门公司展示
- [ ] 用户登录页
- [ ] 个人注册页
- [ ] 企业注册页
- [ ] 忘记密码页

### 7.2 个人用户页面
- [ ] 个人中心首页
- [ ] 个人信息编辑
- [ ] 简历上传管理
- [ ] 简历列表（含解析状态）
- [ ] 简历详情/预览
- [ ] 能力图谱可视化
- [ ] 推荐职位列表
- [ ] 匹配详情页（含五维度分数）
- [ ] 通知中心

### 7.3 企业用户页面
- [ ] 企业中心首页
- [ ] 企业信息管理
- [ ] 企业认证申请
- [ ] 职位发布表单
- [ ] 职位列表管理
- [ ] 职位详情编辑
- [ ] 职位图谱可视化
- [ ] 推荐简历列表
- [ ] 候选人匹配详情
- [ ] 员工账号管理
- [ ] 通知中心

### 7.4 管理员页面
- [ ] 管理后台登录
- [ ] 仪表盘统计概览
- [ ] 企业认证审批列表
- [ ] 用户管理列表
- [ ] 简历管理列表
- [ ] 职位管理列表
- [ ] 技能标签管理
- [ ] 解析任务监控
- [ ] 通知管理

---

## 8. 设计要点建议

1. **角色切换** — 个人用户/企业用户/管理员三种角色的独立入口和权限控制
2. **简历上传** — 支持拖拽上传、PDF/Word预览、解析进度展示
3. **能力图谱** — 可视化技能节点图谱，支持展开/收起、节点点击
4. **匹配卡片** — 展示匹配分数（五维度雷达图）、匹配原因、详细对比
5. **通知中心** — 未读红点提示、分类筛选、批量已读
6. **企业认证** — 状态流转：待认证→认证中→已认证/已拒绝，带进度指示
7. **管理后台** — 数据仪表盘、审批列表、多条件筛选搜索
8. **搜索功能** — 职位搜索（关键词、地点、薪资、技能标签）
9. **列表分页** — 支持分页、排序、筛选的通用列表组件
