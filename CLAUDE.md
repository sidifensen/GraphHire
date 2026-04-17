# CLAUDE.md

### Git 规范

**强制要求：所有提交信息必须使用中文编写。**

> **强制要求：开发前必须严格按照以下 superpowers-plus 流程执行，禁止跳过任何步骤**

## superpowers-plus 标准流程

1. **brainstorming** — 需求澄清（编写代码前激活）
2. **using-git-worktrees** — 隔离工作区（设计批准后激活）
3. **writing-plans** — 任务分解（设计批准后激活）
4. **executing-plans** — 计划执行（含并行/串行子代理自动路由）
5. **test-driven-development** — 测试驱动（RED-GREEN-REFACTOR）
6. **requesting-code-review** — 代码评审（任务间隙激活）
7. **finishing-a-development-branch** — 分支完成（任务完成后激活）

### 核心原则

- **Iron Law (TDD)** — 没有失败测试就不写生产代码；遵循 RED-GREEN-REFACTOR 节奏
- **Iron Law (Debugging)** — 没有根因分析就不修 bug，禁止猜测修复
- **流程优于猜测** — 先验证再断言，禁止跳过步骤
- **自我评估** — 使用内联检查表自检，而非发起子代理 review 循环

### Hutool 工具规范

**强制要求：所有手写工具类代码必须优先使用 Hutool 替代，禁止重复造轮子。**

## 文档布局

- `docs/superpowers/specs/` — 设计规格文档（`YYYY-MM-DD-<topic>-design.md`）
- `docs/superpowers/plans/` — 实现计划（`YYYY-MM-DD-<feature>.md`）
- `docs/superpowers/acceptance/` — 验收标准文档（`YYYY-MM-DD-<feature>-acceptance.md`）
- `RELEASE-NOTES.md` — 版本历史记录

---
## 本地 MCP 服务

- **postgres** — PostgreSQL 数据库（graphhire），用于结构化数据持久化
- **redis** — Redis 缓存（default），用于缓存和会话存储
- **chrome-devtools** — Chrome DevTools，用于浏览器自动化、页面测试、截图、网络抓包


> **使用场景**: 浏览器自动化 / 前端页面测试 → chrome-devtools；数据库查询 / SQL 调试 → postgres；缓存操作 / Session 管理 → redis
---

## 常用命令

> **最高优先级**: 启动命令必须用 `run_in_background: true`，启动前自动检查端口占用，若被占用则先终止占用进程

```bash
# 前端 http://localhost:8888
cd frontend && npm run dev

# 后端 http://localhost:7777
cd backend && mvn spring-boot:run
```

## 项目概述

**GraphHire 图谱智聘** — 基于AI智能匹配与能力图谱的招聘平台。核心功能：简历/职位文档智能解析、能力图谱构建、双向人岗匹配。
**端口：** 8888(前端) / 7777(后端) / 5432(PostgreSQL) / 6379(Redis) / 7687(memgraph) / 9000(rustfs)

---

## 完成验证要求

每次功能开发完成后、提交/合并前，必须使用 `/web-access` skill 打开浏览器验证对应功能页面是否正常工作。

## 浏览器测试

使用浏览器进行测试时，必须通过 `/web-access` skill 处理网络请求。
