# GraphHire 后端功能扩展设计文档

**日期**: 2026-04-16
**状态**: 已批准
**版本**: v1.0

---

## 一、概述

本文档描述 GraphHire 平台后端缺失功能的完整设计方案，涉及 5 个核心模块：
投递模块、公开搜索模块、账号安全模块、管理后台增强、企业增强。

---

## 二、模块 1：投递模块

### 2.1 核心数据模型

#### 2.1.1 Application（投递记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long (PK) | 投递记录ID |
| resumeId | Long (FK) | 投递的简历ID |
| jobId | Long (FK) | 投递的职位ID |
| userId | Long (FK) | 求职者用户ID |
| companyId | Long (FK) | 目标公司ID |
| status | Enum | 状态枚举 |
| appliedAt | LocalDateTime | 投递时间 |
| updatedAt | LocalDateTime | 更新时间 |
| note | String | HR备注 |

**Status 枚举值**:
- `PENDING` - 待处理
- `VIEWED` - 已查看
- `INTERVIEW_INVITED` - 面试邀请
- `REJECTED` - 已拒绝
- `ACCEPTED` - 已接受
- `WITHDRAWN` - 已撤回

#### 2.1.2 Favorite（收藏记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long (PK) | 收藏ID |
| userId | Long (FK) | 用户ID |
| jobId | Long (FK) | 收藏的职位ID |
| createdAt | LocalDateTime | 收藏时间 |

**唯一约束**: (userId, jobId)

#### 2.1.3 TalentPool（人才库）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long (PK) | 记录ID |
| companyId | Long (FK) | 公司ID |
| resumeId | Long (FK) | 简历ID |
| addedAt | LocalDateTime | 加入时间 |
| note | String | 备注 |
| status | Enum | ACTIVE / ARCHIVED |

**唯一约束**: (companyId, resumeId)

### 2.2 NotificationType 扩展

新增枚举值：
```java
INTERVIEW_INVITED(6, "Interview Invited")
```

### 2.3 用户端 API

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | /person/applications | 投递简历 |
| GET | /person/applications | 我的投递列表 |
| GET | /person/applications/{id} | 投递详情 |
| PUT | /person/applications/{id}/withdraw | 撤回投递 |
| POST | /person/favorites | 收藏职位 |
| DELETE | /person/favorites/{jobId} | 取消收藏 |
| GET | /person/favorites | 我的收藏列表 |

**POST /person/applications 请求体**:
```json
{
  "jobId": 123,
  "resumeId": 456
}
```

**PUT /person/applications/{id}/withdraw**:
- 仅当 status=PENDING 时可撤回
- 撤回后 status=WITHDRAWN，不可恢复

**POST /person/favorites 请求体**:
```json
{
  "jobId": 123
}
```

### 2.4 企业端 API

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /company/applications | 查看投递列表 |
| GET | /company/applications/{id} | 投递详情 |
| PUT | /company/applications/{id}/status | 更新状态 |
| POST | /company/applications/{id}/interview | 发送面试邀请 |
| POST | /company/applications/{id}/reject | 标记不合适 |
| POST | /company/applications/{id}/accept | 标记合适 |
| POST | /company/talent-pool | 加入人才库 |
| DELETE | /company/talent-pool/{resumeId} | 从人才库移除 |
| GET | /company/talent-pool | 人才库列表 |

**POST /company/applications/{id}/interview 请求体**:
```json
{
  "interviewTime": "2026-04-20T10:00:00",
  "location": "北京市朝阳区xxx大厦",
  "remark": "请携带身份证和简历"
}
```

**GET /company/applications 查询参数**:
- `status` - 筛选状态
- `page`, `size` - 分页

### 2.5 业务流程

1. **投递流程**:
   - 用户调用 POST /person/applications
   - 校验：用户有有效简历、职位已发布、未投递过
   - 创建 Application，status=PENDING
   - 发送 Notification (type=RESUME_SUBMITTED) 给企业
   - 返回 Application ID

2. **面试邀请流程**:
   - 企业调用 POST /company/applications/{id}/interview
   - 更新 status=INTERVIEW_INVITED
   - 发送 Notification (type=INTERVIEW_INVITED) 给用户
   - 通知内容包含面试时间、地点

---

## 三、模块 2：公开搜索模块

### 3.1 公开职位 API

**GET /public/jobs**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | String | 否 | 关键词搜索(职位名/公司名) |
| city | String | 否 | 城市筛选 |
| salaryMin | Integer | 否 | 最低薪资 |
| salaryMax | Integer | 否 | 最高薪资 |
| skills | String | 否 | 技能标签,分隔 |
| sortBy | String | 否 | createdAt/salary/match |
| page | Integer | 否 | 页码(默认1) |
| size | Integer | 否 | 每页大小(默认20,最大50) |

**响应结构**:
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 123,
        "title": "Java高级工程师",
        "companyName": "字节跳动",
        "companyLogo": "https://xxx/logo.png",
        "salaryRange": { "min": 20000, "max": 35000, "unit": "monthly" },
        "city": "北京",
        "skills": ["Java", "Spring", "Redis"],
        "publishedAt": "2026-04-10T10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

**GET /public/jobs/{id}** - 返回公开职位详情（不含企业私有信息）

### 3.2 公开公司 API

**GET /public/companies**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | String | 否 | 公司名称搜索 |
| page | Integer | 否 | 页码(默认1) |
| size | Integer | 否 | 每页大小(默认20) |

**GET /public/companies/{id}** - 返回公司公开信息

---

## 四、模块 3：账号安全模块

### 4.1 修改密码

**POST /auth/change-password**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| oldPassword | String | 是 | 旧密码 |
| newPassword | String | 是 | 新密码(8位以上,包含大小写字母和数字) |

**校验规则**:
- 旧密码必须正确
- 新密码不能与旧密码相同
- 新密码格式: 8位以上,至少包含1个大写字母、1个小写字母、1个数字

### 4.2 忘记密码

**POST /auth/forgot-password**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | String | 是 | 手机号 |
| verifyCode | String | 是 | 验证码 |
| newPassword | String | 是 | 新密码 |

**校验规则**:
- 验证码必须与发送的验证码一致且未过期(5分钟有效)
- 新密码格式校验同上
- 成功后使原token失效

### 4.3 头像上传

**POST /person/avatar**

- 请求格式: multipart/form-data
- 文件字段: file
- 支持格式: JPG, PNG, GIF
- 文件大小限制: 2MB
- 头像存储到 RustFS (S3兼容)
- 返回: 头像URL

**GET /person/avatar** - 获取当前用户头像URL

**PersonInfo 新增字段**:
- avatarUrl: String (头像URL)

---

## 五、模块 4：管理后台增强

### 5.1 批量操作

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | /admin/company/batch/approve | 批量通过企业认证 |
| POST | /admin/company/batch/reject | 批量拒绝 |
| POST | /admin/user/batch/disable | 批量禁用用户 |
| POST | /admin/task/batch/retry | 批量重试任务 |

**批量通过/拒绝企业 请求体**:
```json
{
  "companyIds": [1, 2, 3],
  "reason": "统一拒绝原因(可选)"
}
```

**批量禁用用户 请求体**:
```json
{
  "userIds": [1, 2, 3],
  "duration": "PERMANENT" | "24HOURS",
  "reason": "违规操作"
}
```

### 5.2 技能分类管理

**Category (技能分类)**:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long (PK) | 分类ID |
| name | String | 分类名称 |
| description | String | 分类描述 |
| createdAt | LocalDateTime | 创建时间 |

**API**:

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /admin/skill/categories | 获取所有分类 |
| POST | /admin/skill/categories | 添加分类 |
| PUT | /admin/skill/categories/{id} | 更新分类 |
| DELETE | /admin/skill/categories/{id} | 删除分类 |

**SkillTag 新增字段**:
- categoryId: Long (FK，可为空)

---

## 六、模块 5：企业增强

### 6.1 员工密码重置

**POST /company/staff/{staffId}/reset-password**

- 只有企业主(OWNER)可以操作
- 重置后发送新密码到员工手机/邮箱
- 返回: 操作成功

### 6.2 MatchRecord 方向应用

**MatchRecord.matchDirection 字段**:

| 值 | 常量 | 说明 |
|----|------|------|
| 1 | DIRECTION_PERSON_APPLIES | 求职者主动投递 |
| 2 | DIRECTION_COMPANY_RECOMMENDS | 企业推荐候选人 |

**业务规则调整**:

1. **主动投递** (type=1):
   - 创建 Application，status=PENDING
   - 不自动创建 MatchRecord（投递本身即匹配结果）
   - 发送 Notification (type=RESUME_SUBMITTED) 给企业

2. **企业推荐** (type=2):
   - 不创建 Application
   - 创建 MatchRecord 用于记录推荐
   - 发送 Notification (type=CANDIDATE_RECOMMENDATION) 给企业

**注意**: 取消原 `triggerMatchForResume` 和 `triggerMatchForJob` 中的自动创建 MatchRecord 逻辑，改为：
- 投递时直接创建 Application
- 企业推荐时创建 MatchRecord

---

## 七、技术实现要点

### 7.1 新增 Entity 所在包
- `com.graphhire.application.domain.model.Application`
- `com.graphhire.application.domain.model.Favorite`
- `com.graphhire.application.domain.model.TalentPool`
- `com.graphhire.skill.domain.model.Category`

### 7.2 新增 Repository 所在包
- `com.graphhire.application.domain.repository.ApplicationRepository`
- `com.graphhire.application.domain.repository.FavoriteRepository`
- `com.graphhire.application.domain.repository.TalentPoolRepository`
- `com.graphhire.skill.domain.repository.CategoryRepository`

### 7.3 新增 Controller
- `com.graphhire.application.interfaces.controller.PersonApplicationController`
- `com.graphhire.application.interfaces.controller.CompanyApplicationController`
- `com.graphhire.publicapi.interfaces.controller.PublicJobController`
- `com.graphhire.publicapi.interfaces.controller.PublicCompanyController`
- `com.graphhire.auth.interfaces.controller.PasswordController`
- `com.graphhire.admin.interfaces.controller.BatchOperationController`
- `com.graphhire.admin.interfaces.controller.CategoryController`

### 7.4 数据库表

```sql
-- 投递记录表
CREATE TABLE application (
    id BIGSERIAL PRIMARY KEY,
    resume_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    UNIQUE(resume_id, job_id)
);

-- 收藏记录表
CREATE TABLE favorite (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

-- 人才库表
CREATE TABLE talent_pool (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    resume_id BIGINT NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    UNIQUE(company_id, resume_id)
);

-- 技能分类表
CREATE TABLE skill_category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- skill_tag 表新增 category_id 字段
ALTER TABLE skill_tag ADD COLUMN category_id BIGINT REFERENCES skill_category(id);
```

---

## 八、实现顺序

1. **模块1: 投递模块** (Application, Favorite, TalentPool, NotificationType扩展)
2. **模块2: 公开搜索模块** (PublicJobController, PublicCompanyController)
3. **模块3: 账号安全模块** (修改密码, 忘记密码, 头像上传)
4. **模块4: 管理后台增强** (批量操作, 技能分类管理)
5. **模块5: 企业增强** (员工密码重置, MatchRecord方向应用)

---

## 九、向后兼容

- 所有新增 API 在文档中标注版本号 v1
- 现有 MatchRecord 相关逻辑在模块5实施前保持不变
- 数据库字段添加均使用 ALTER TABLE，不影响现有数据
