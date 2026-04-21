# GraphHire 技术架构设计文档

> **版本**：v1.0
> **日期**：2026-04-21
> **作者**：架构师

---

## 1. 项目概述

**GraphHire 图谱智聘** — 基于 AI 智能匹配与能力图谱的招聘平台。

### 1.1 核心功能
- 简历/职位文档智能解析
- 能力图谱构建
- 双向人岗匹配

### 1.2 技术关键词
- **前端**：Next.js 16 · React 19 · TypeScript · Tailwind CSS · Zustand
- **后端**：Spring Boot 3.4 · Java 21 · MyBatis-Plus · Sa-Token
- **数据库**：PostgreSQL · Redis · MemGraph (图数据库)
- **中间件**：RocketMQ · AWS S3 · 阿里云 OCR
- **文档解析**：Apache Tika

---

## 2. 前端技术栈

### 2.1 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 16.x | React 全栈框架，SSR/SSG 支持 |
| **React** | 19.x | UI 组件库 |
| **TypeScript** | 5.7.x | 类型安全 |
| **Tailwind CSS** | 3.4.x | 原子化 CSS |
| **Zustand** | 5.x | 轻量状态管理 |

### 2.2 状态管理与数据获取

| 技术 | 版本 | 用途 |
|------|------|------|
| **@tanstack/react-query** | 5.x | 服务端状态管理、缓存 |
| **React Hook Form** | 7.x | 表单处理 |
| **Zod** | 3.24.x | Schema 验证 |

### 2.3 前端目录结构

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (user)/            # 普通用户页面组
│   │   │   ├── companies/
│   │   │   ├── jobs/
│   │   │   ├── match/[id]/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   ├── resume/
│   │   │   └── skill-graph/
│   │   ├── admin/             # 管理员页面组
│   │   ├── enterprise/        # 企业用户页面组
│   │   ├── login/
│   │   ├── register/
│   │   └── page.tsx           # 首页
│   ├── components/            # 公共组件
│   │   ├── admin/
│   │   ├── enterprise/
│   │   └── *.tsx
│   ├── lib/
│   │   └── api/               # API 客户端
│   │       ├── client.ts      # Axios 实例
│   │       ├── auth.ts
│   │       ├── job.ts
│   │       ├── match.ts
│   │       └── ...
│   └── store/                 # Zustand stores
├── public/                    # 静态资源
├── tests/                     # Vitest 测试
└── package.json
```

### 2.4 前端路由结构

| 路由前缀 | 角色 | 说明 |
|----------|------|------|
| `/` | 公共 | 首页、登录、注册 |
| `/user/*` | 求职者 | 简历管理、技能图谱、职位匹配 |
| `/enterprise/*` | 企业 | 职位发布、员工管理、人才推荐 |
| `/admin/*` | 管理员 | 用户管理、企业审核、标签管理 |

---

## 3. 后端架构设计

### 3.1 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Spring Boot** | 3.4.5 | 应用框架 |
| **Java** | 21 | 开发语言 |
| **MyBatis-Plus** | 3.5.10 | ORM 框架 |
| **Sa-Token** | 1.45.0 | 认证授权 |
| **RocketMQ** | 2.3.1 | 消息队列 |
| **Apache Tika** | 3.2.0 | 文档解析 |
| **Hutool** | 5.8.25 | 工具库 |
| **springdoc-openapi** | 2.8.4 | API 文档 |

### 3.2 DDD 分层架构

后端采用 **领域驱动设计 (DDD)** 分层架构：

```
backend/src/main/java/com/graphhire/
├── admin/                     # 管理员模块
│   ├── application/           # 应用层 (Service)
│   ├── domain/                # 领域层
│   │   ├── model/
│   │   ├── repository/
│   │   └── service/
│   ├── infrastructure/        # 基础设施层
│   │   └── persistence/       # 持久化实现
│   └── interfaces/            # 接口层
│       ├── controller/
│       └── dto/
├── application/               # 投递申请模块
├── auth/                      # 认证模块
├── common/                    # 公共模块
│   ├── model/
│   └── vo/
├── config/                    # 配置模块
├── job/                       # 职位模块
├── match/                     # 匹配模块
├── notification/              # 通知模块
├── publicapi/                 # 公开 API 模块
├── resume/                    # 简历模块
└── skill/                     # 技能模块
```

### 3.3 模块职责

| 模块 | 职责 |
|------|------|
| **admin** | 系统管理：用户管理、企业审核、标签管理、任务监控 |
| **auth** | 认证授权：登录、注册、Token 管理 |
| **job** | 职位管理：职位 CRUD、搜索、筛选 |
| **resume** | 简历管理：上传、解析、存储 |
| **skill** | 技能图谱：技能标签、能力画像 |
| **match** | 智能匹配：人岗匹配算法、推荐 |
| **application** | 投递申请：职位投递、状态跟踪 |
| **notification** | 通知系统：站内信、邮件通知 |
| **publicapi** | 公开接口：首页数据、企业信息 |

---

## 4. 数据库架构

### 4.1 PostgreSQL — 关系型数据

**用途**：用户、职位、简历、申请记录等核心业务数据

```
主要表结构：
├── sys_user                  # 用户表
├── sys_role                  # 角色表
├── sys_permission            # 权限表
├── enterprise                # 企业表
├── job                       # 职位表
├── resume                    # 简历表
├── application               # 投递申请表
├── skill_tag                 # 技能标签表
├── notification              # 通知表
└── ...
```

### 4.2 Redis — 缓存与会话

**用途**：
- Session 存储（Sa-Token）
- 接口限流
- 热数据缓存
- 分布式锁

### 4.3 MemGraph — 图数据库

**用途**：
- 技能图谱关系存储
- 人岗匹配关系网络
- 能力画像图谱

---

## 5. API 设计规范

### 5.1 RESTful 规范

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/jobs` | 获取职位列表 |
| `GET` | `/api/jobs/{id}` | 获取职位详情 |
| `POST` | `/api/jobs` | 创建职位 |
| `PUT` | `/api/jobs/{id}` | 更新职位 |
| `DELETE` | `/api/jobs/{id}` | 删除职位 |

### 5.2 API 分层

| 前缀 | 角色 | 说明 |
|------|------|------|
| `/api/admin/*` | 管理员 | 管理后台 API |
| `/api/enterprise/*` | 企业 | 企业端 API |
| `/api/user/*` | 用户 | 用户端 API |
| `/api/public/*` | 公共 | 公开 API（无需认证） |

### 5.3 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 5.4 认证方式

**Sa-Token** + Redis 会话存储：
- 基于 Token 的认证
- 支持主动注销
- 自动续期机制

---

## 6. 部署架构

### 6.1 服务端口

| 端口 | 服务 | 说明 |
|------|------|------|
| **8888** | Frontend | Next.js 前端 |
| **7777** | Backend | Spring Boot 后端 |
| **5432** | PostgreSQL | 关系数据库 |
| **6379** | Redis | 缓存/会话 |
| **7687** | MemGraph | 图数据库 |
| **9000** | RustFS | 文件存储 |
| **9001** | RustFS Console | 存储控制台 |

### 6.2 启动命令

```bash
# 前端
cd frontend && npm run dev

# 后端
cd backend && mvn spring-boot:run
```

---

## 7. 关键技术决策

### 7.1 为什么选择 Next.js

- **SSR/SSG 支持**：利于 SEO 和首屏加载
- **App Router**：现代化的路由和数据获取
- **TypeScript 优先**：完善的类型支持

### 7.2 为什么选择 Spring Boot 3.4

- **Java 21 支持**：虚拟线程、性能优化
- **生态完善**：丰富的 Starter
- **与现有技术栈兼容**：MyBatis-Plus、Sa-Token

### 7.3 为什么选择 DDD 架构

- **模块边界清晰**：便于团队分工
- **业务逻辑内聚**：维护成本低
- **易于扩展**：新功能独立模块

### 7.4 为什么使用 MemGraph

- **图结构天然适配**：技能关系、人岗匹配
- **高性能查询**：多跳关系查询
- **与 Neo4j 兼容**：使用 Cypher 查询

---

## 8. 安全设计

### 8.1 认证授权

- **Sa-Token**：轻量级 Token 认证
- **RBAC**：基于角色的权限控制
- **接口权限**：细粒度接口访问控制

### 8.2 数据安全

- **密码加密**：BCrypt 加密
- **敏感数据**：脱敏处理
- **SQL 注入**：MyBatis-Plus 参数绑定
- **XSS/CSRF**：Spring Security 防护

---

## 9. 性能优化

### 9.1 前端优化

- **SSR/SSG**：减少首屏时间
- **React Query**：智能缓存
- **图片优化**：Next.js Image

### 9.2 后端优化

- **Redis 缓存**：热点数据缓存
- **数据库索引**：查询优化
- **异步处理**：RocketMQ 解耦

---

## 10. 文档输出

### 10.1 现有文档

| 文档 | 说明 |
|------|------|
| `2026-04-15-ddd-multi-module-design.md` | DDD 多模块设计 |
| `2026-04-17-graphhire-frontend-design.md` | 前端架构设计 |
| `2026-04-20-frontend-user-redesign-design.md` | 用户端重构设计 |
| `2026-04-21-admin-pages-real-data-design.md` | 管理后台真实数据设计 |

### 10.2 本文档定位

本文档为 **GraphHire 项目技术架构总览**，涵盖：
- 前端技术栈选型
- 后端 DDD 架构
- 数据库选型
- API 设计规范
- 部署架构

---

## 11. 附录

### 11.1 技术栈总结

```
前端：Next.js 16 + React 19 + TypeScript + Tailwind CSS + Zustand + React Query
后端：Spring Boot 3.4 + Java 21 + MyBatis-Plus + Sa-Token
数据库：PostgreSQL + Redis + MemGraph
中间件：RocketMQ + AWS S3
文档解析：Apache Tika + 阿里云 OCR
```

### 11.2 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-04-21 | 初始架构设计文档 |
