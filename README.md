# GraphHire 图谱智聘

GraphHire 是一个面向招聘场景的 AI 智能匹配平台，以"简历解析 → 职位解析 → 能力图谱构建 → 人岗匹配 → 招聘协同"为主线构建完整业务闭环，覆盖求职者、企业、平台管理员三类角色的全流程招聘协作。

## 项目定位

GraphHire 关注的不只是"投递职位"，而是把招聘过程拆成可计算、可追踪、可解释的链路：

- **求职者**：注册登录、简历上传与管理、职位浏览与投递、能力图谱查看、匹配结果解读、站内沟通。
- **企业**：职位发布与管理、候选人推荐与沟通、企业资料维护、招聘工作台协同。
- **管理员**：企业资质审核、用户管理、行业与职位类型配置、后台任务监控。

## 核心能力

- **简历解析**：支持 PDF / DOC / DOCX 上传，自动提取结构化信息。
- **职位结构化**：将职位描述转换为可匹配的结构化数据。
- **人岗匹配**：基于能力标签、职位要求与技能图谱生成匹配评分和匹配理由。
- **招聘协同**：求职者与企业之间的站内消息与简历投递流程。
- **能力图谱**：维护技能关系图，为推荐、匹配和能力分析提供支撑。

## 系统架构

```mermaid
flowchart LR
    A["求职者端"] --> D["后端服务\nSpring Boot 3.4"]
    B["企业端"] --> D
    C["管理端"] --> D
    D --> E["PostgreSQL\n业务主数据"]
    D --> F["Redis / Redisson\n缓存、会话、限流、并发控制"]
    D --> G["RocketMQ\n异步任务链路"]
    D --> H["RustFS / S3\n简历与图片文件存储"]
    D --> I["Memgraph\n技能关系图谱"]
    D --> J["DeepSeek API\n解析与匹配推理"]
    D --> K["阿里云 OCR\n文档识别兜底"]
```

- 三个端共享同一个 `frontend/` Next.js 工程，通过不同路由前缀区分，统一由 `http://localhost:8888` 提供访问入口
- 后端默认运行在 `http://localhost:7777`
- AI、OCR、对象存储、图数据库均为增强能力依赖；未配置时对应业务链路受限

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | Next.js 16、React 19、TypeScript 5、Tailwind CSS、TanStack Query、Zustand、Vitest |
| 后端 | Java 21、Spring Boot 3.4.5、MyBatis-Plus、Sa-Token、Redis / Redisson、RocketMQ、Hutool |
| 基础设施 | PostgreSQL、Memgraph、RustFS / S3、DeepSeek API、阿里云 OCR |

## 仓库结构

```text
GraphHire/
├─ frontend/                    # Next.js 前端工程（三端共用）
│  ├─ src/app/                  # App Router 页面（用户端 / 企业端 / 管理端）
│  ├─ src/components/           # 复用组件
│  ├─ src/lib/                  # API 客户端、工具函数、状态管理
│  └─ tests/                    # 前端测试（Vitest）
├─ backend/                     # Spring Boot 后端工程
│  └─ src/main/resources/
│     ├─ application.yml        # 默认运行配置
│     └─ db/
│        ├─ schema.sql          # 数据库基线结构
│        └─ migration/          # 历史迁移脚本
├─ doc/                         # 产品截图与说明文档
├─ docs/                        # 架构、设计、过程与仓库记忆文档
├─ logs/                        # 本地调试输出
└─ script/                      # 本地辅助脚本与依赖服务编排
```

## 角色与入口

| 角色 | 路由 |
| --- | --- |
| 首页 | `/` |
| 登录 / 注册 | `/login`、`/register` |
| 求职者端 | `/jobs`、`/companies`、`/resume/manage`、`/skill-graph`、`/chat` |
| 企业端 | `/enterprise/dashboard` |
| 管理端 | `/admin/login` |

## 本地快速开始

### 1. 环境要求

- Node.js 20+、npm 10+
- Java 21、Maven 3.9+
- Docker Desktop（推荐，用于快速拉起中间件）

只查看前端页面启动前端即可；要跑通登录、上传、解析、匹配、聊天等完整链路，建议把数据库、缓存、对象存储、消息队列和图数据库一并拉起。

### 2. 启动基础依赖服务

```bash
docker compose -f script/dev/services/postgres.yml up -d
docker compose -f script/dev/services/redis.yml up -d
docker compose -f script/dev/services/rustfs.yml up -d
docker compose -f script/dev/services/memgraph.yml up -d
docker compose -f script/dev/services/rocketmq.yml up -d
```

默认端口：PostgreSQL `5432`、Redis `6379`、RustFS API `9000`、RustFS Console `9001`、Memgraph Bolt `7687`、Memgraph Lab `3000`、RocketMQ NameServer `9876`、RocketMQ Dashboard `8082`

> **注意**：`application.yml` 默认连接数据库 `graphhire`，而 `postgres.yml` 默认创建的库名是 `ragent`。直接使用时需二选一：把容器内库名改为 `graphhire`，或通过环境变量覆盖 `DB_URL=jdbc:postgresql://localhost:5432/ragent`。

### 3. 初始化数据库

1. 创建业务数据库 `graphhire`（与 `DB_URL` 保持一致）
2. 执行基线脚本 [backend/src/main/resources/db/schema.sql](backend/src/main/resources/db/schema.sql)

### 4. 配置后端环境变量

```bash
cd backend && cp .env.example .env
```

| 变量名 | 说明 | 是否必填 |
| --- | --- | --- |
| `DB_URL` | PostgreSQL JDBC 地址，默认 `jdbc:postgresql://localhost:5432/graphhire` | 否 |
| `DB_USERNAME` | PostgreSQL 用户名，默认 `postgres` | 否 |
| `DB_PASSWORD` | PostgreSQL 密码，默认 `postgres` | 否 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key，用于 AI 解析和匹配 | 部分场景必填 |
| `ALIYUN_OCR_ACCESS_KEY_ID` | 阿里云 OCR Key ID | OCR 场景必填 |
| `ALIYUN_OCR_ACCESS_KEY_SECRET` | 阿里云 OCR Key Secret | OCR 场景必填 |
| `MAIL_USERNAME` | 邮箱账号，用于验证码或通知 | 邮件场景必填 |
| `MAIL_PASSWORD` | 邮箱授权码 | 邮件场景必填 |
| `RUSTFS_ACCESS_KEY` | 对象存储访问 Key | 受保护存储必填 |
| `RUSTFS_SECRET_KEY` | 对象存储访问 Secret | 受保护存储必填 |
| `RUSTFS_BUCKET` | 对象存储桶名，默认 `resumes` | 否 |
| `CORS_ALLOWED_ORIGINS` | 允许的前端跨域来源，默认 `http://localhost:8888` | 否 |
| `WS_ALLOWED_ORIGINS` | WebSocket 允许来源，默认 `http://localhost:8888` | 否 |

### 5. 启动后端

```bash
cd backend && mvn spring-boot:run
```

后端监听 `7777`，Swagger 文档：`http://localhost:7777/swagger-ui.html`

### 6. 启动前端

```bash
cd frontend && npm install && npm run dev
```

前端监听 `8888`。如需覆盖 API 地址：

```bash
set NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:7777
```

## 常用地址

| 服务 | 地址 |
| --- | --- |
| 前端首页 | http://localhost:8888 |
| 后端接口 | http://localhost:7777 |
| Swagger UI | http://localhost:7777/swagger-ui.html |
| Memgraph Lab | http://localhost:3000 |
| RocketMQ Dashboard | http://localhost:8082 |

## 常用命令

```bash
# 前端
cd frontend && npm run dev
cd frontend && npm run build
cd frontend && npm run test:run

# 后端
cd backend && mvn spring-boot:run
cd backend && mvn compile
cd backend && mvn test

# 端口清理（Windows）
script/stop-7777.bat
script/stop-8888.bat
script/stop-all.bat
```

## 测试与验证

- 仅后端改动：`mvn compile`、`mvn test`
- 仅前端改动：`npm run build`、`npm run test:run`
- 前后端同时改动：四项全部执行

## 开发约定

- 提交信息使用中文，带 `feat / fix / docs / refactor / test / chore` 前缀
- 数据库结构变更必须同步更新迁移脚本与 `db/schema.sql`
- 新增和修改的文件需补充业务意图注释
- 手写工具类优先使用 Hutool

完整工作流约束见 [AGENTS.md](AGENTS.md)。

## 常见问题

**后端启动时报数据库不存在**
检查 `application.yml` 中的 `DB_URL` 与 `postgres.yml` 中的 `POSTGRES_DB` 是否一致（默认值分别是 `graphhire` 和 `ragent`）。

**前端能打开，但接口全是 404 / CORS 失败**
确认后端已启动在 `7777`，`NEXT_PUBLIC_API_BASE_URL` 指向正确地址，`CORS_ALLOWED_ORIGINS` / `WS_ALLOWED_ORIGINS` 包含前端域名。

**上传或解析能力不可用**
依次排查：RustFS 桶配置、DeepSeek Key、阿里云 OCR Key、RocketMQ / Redis / Memgraph 服务状态。

**Swagger 页面打不开**
确认后端已启动，访问 `http://localhost:7777/swagger-ui.html`；端口被占用可先执行 `script/stop-7777.bat`。

## 相关文档

- [AGENTS.md](AGENTS.md) — 仓库协作约束与开发流程
- [backend/src/main/resources/application.yml](backend/src/main/resources/application.yml) — 后端默认配置
- [backend/src/main/resources/db/schema.sql](backend/src/main/resources/db/schema.sql) — 数据库基线结构
- `docs/superpowers/memory/` — 模块记忆、契约与启动基线报告

---

## 界面截图

### 求职者端

![求职者端](doc/user/img.webp)
![求职者端](doc/user/img_1.webp)
![求职者端](doc/user/img_2.webp)
![求职者端](doc/user/img_3.webp)
![求职者端](doc/user/img_4.webp)
![求职者端](doc/user/img_5.webp)
![求职者端](doc/user/img_6.webp)
![求职者端](doc/user/img_7.webp)
![求职者端](doc/user/img_8.webp)
![求职者端](doc/user/img_9.webp)
![求职者端](doc/user/img_10.webp)
![求职者端](doc/user/img_11.webp)
![求职者端](doc/user/img_12.webp)
![求职者端](doc/user/img_13.webp)

### 企业端

![企业端](doc/enterprise/img.webp)
![企业端](doc/enterprise/img_1.webp)
![企业端](doc/enterprise/img_2.webp)
![企业端](doc/enterprise/img_3.webp)
![企业端](doc/enterprise/img_4.webp)
![企业端](doc/enterprise/img_5.webp)

### 管理端

![管理端](doc/admin/img.webp)
![管理端](doc/admin/img_1.webp)
![管理端](doc/admin/img_2.webp)
![管理端](doc/admin/img_3.webp)
![管理端](doc/admin/img_4.webp)
![管理端](doc/admin/img_5.webp)
![管理端](doc/admin/img_6.webp)
![管理端](doc/admin/img_7.webp)
![管理端](doc/admin/img_8.webp)
