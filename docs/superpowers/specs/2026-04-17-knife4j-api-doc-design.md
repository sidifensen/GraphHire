# knife4j API文档集成设计

## 1. 概述

为 GraphHire 后端集成 knife4j API文档，提供在线API调试界面。

## 2. 技术方案

- **依赖**: `knife4j-spring-boot3-starter`
- **访问地址**: `/doc.html`
- **认证**: 公开访问，无需登录
- **全局Token**: 支持配置 `Authorization` 请求头

## 3. 模块分组

| 模块 | Controller |
|------|-----------|
| 认证模块 | AuthController, PasswordController |
| 简历模块 | PersonController, PersonAvatarController, ResumeController |
| 职位模块 | CompanyController, PublicJobController, PublicCompanyController |
| 申请模块 | PersonApplicationController, CompanyApplicationController |
| 匹配模块 | MatchController |
| 管理模块 | AdminController, BatchOperationController, CategoryController, SkillTagController, NotificationController |

## 4. 实现内容

1. `pom.xml` 添加 knife4j 依赖
2. `application.yml` 配置 swagger 信息
3. `SwaggerConfig.java` 配置分组 + 全局Authorization请求头

## 5. 全局请求头

配置 `Authorization` 头为全局参数，用户登录后只需在文档页面设置一次，所有接口自动携带token。

## 6. 认证标注规范

接口描述前添加认证标识：
- `[需认证]` - 需要登录的接口
- `[公开]` - 无需登录的接口
