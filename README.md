# GraphHire 图谱智聘

GraphHire 是一个面向招聘场景的 AI 智能匹配平台，围绕“简历/职位解析 -> 能力图谱构建 -> 人岗匹配 -> 招聘协同”形成完整闭环。仓库当前包含求职者端、企业端、管理端三类前端入口，以及基于 Spring Boot 的后端服务与配套数据库脚本。

## 项目特性

- 求职者端：注册登录、简历上传与管理、职位浏览、企业查看、能力图谱、聊天沟通。
- 企业端：企业工作台、职位发布与编辑、候选人推荐、企业资料维护、招聘消息协同。
- 管理端：企业审核、用户管理、行业管理、职位类型管理、任务监控与基础运营后台。
- AI 能力：简历解析、职位解析、匹配评分、匹配理由生成、职位类型技能分类建模。
- 图谱与异步链路：使用 Memgraph 构建技能关系图，结合 RocketMQ、Redis、Redisson 支撑上传、解析、匹配等异步流程。

## 技术栈

### 前端

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- Vitest + Testing Library

### 后端

- Java 21
- Spring Boot 3.4
- MyBatis-Plus
- Sa-Token
- Redis / Redisson
- RocketMQ
- SpringDoc OpenAPI

### 基础设施

- PostgreSQL
- Memgraph（Bolt 协议）
- RustFS / S3 兼容对象存储
- DeepSeek API
- 阿里云 OCR

## 仓库结构

```text
GraphHire/
├─ frontend/                     # Next.js 前端工程
├─ backend/                      # Spring Boot 后端工程
│  └─ src/main/resources/db/
│     ├─ schema.sql              # 当前数据库基线结构
│     └─ migration/              # 历史迁移脚本
├─ docs/                         # 架构、原型、设计与过程文档
├─ logs/                         # 本地调试输出
└─ script/                       # 辅助脚本
```

## 角色与入口

- 首页：`/`
- 登录/注册：`/login`、`/register`
- 求职者端：`/jobs`、`/companies`、`/resume/manage`、`/skill-graph`、`/chat`
- 企业端：`/enterprise/dashboard`
- 管理端：`/admin/login`

## 本地启动

### 1. 环境要求

- Node.js 20+
- npm 10+
- Java 21
- Maven 3.9+
- PostgreSQL 15+
- Redis 7+
- Memgraph
- RustFS 或其他 S3 兼容对象存储
- RocketMQ

如果你只想先看前端页面，可以先启动前端；如果要跑通上传、解析、匹配、聊天等完整链路，需要把上述中间件全部拉起。

### 2. 初始化数据库

1. 创建数据库：`graphhire`
2. 执行 [backend/src/main/resources/db/schema.sql](/D:/code/GraphHire/backend/src/main/resources/db/schema.sql)

说明：

- 当前仓库提供了完整基线结构 `schema.sql`
- `backend/src/main/resources/db/migration/` 中保留了历史迁移 SQL，适合追溯演进过程
- 仓库当前未看到自动迁移执行器配置，首次启动建议直接导入 `schema.sql`

### 3. 启动后端

后端默认端口为 `7777`。

先准备配置文件：

```bash
cd backend
cp .env.example .env
```

然后按需补充 `.env` 中的密钥：

- `DEEPSEEK_API_KEY`
- `ALIYUN_OCR_ACCESS_KEY_ID`
- `ALIYUN_OCR_ACCESS_KEY_SECRET`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`

数据库与中间件默认连接信息写在 [backend/src/main/resources/application.yml](/D:/code/GraphHire/backend/src/main/resources/application.yml) 中，默认本地地址如下：

- PostgreSQL：`localhost:5432/graphhire`
- Redis：`localhost:6379`
- RocketMQ：`127.0.0.1:9876`
- RustFS：`http://localhost:9000`
- Memgraph：`bolt://localhost:7687`

启动命令：

```bash
cd backend
mvn spring-boot:run
```

### 4. 启动前端

前端默认端口为 `8888`。

```bash
cd frontend
npm install
npm run dev
```

说明：

- 前端默认会把 API 指向 `http://127.0.0.1:7777`
- 如果你需要跨机器访问后端，可设置 `NEXT_PUBLIC_API_BASE_URL`

## 访问地址

- 前端首页：[http://localhost:8888](http://localhost:8888)
- 后端接口：[http://localhost:7777](http://localhost:7777)
- Swagger UI：[http://localhost:7777/swagger-ui.html](http://localhost:7777/swagger-ui.html)

## 测试与构建

### 前端

```bash
cd frontend
npm run build
npm run test:run
```

### 后端

```bash
cd backend
mvn compile
mvn test
```
