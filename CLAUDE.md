# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

> **强制要求：开发前必须严格按照以下 superpowers-plus 流程执行，禁止跳过任何步骤**

## superpowers-plus 标准流程

1. **brainstorming** — 需求澄清（编写代码前激活）
2. **using-git-worktrees** — 隔离工作区（设计批准后激活）
3. **writing-plans** — 任务分解（设计批准后激活）
4. **executing-plans** — 计划执行（含并行/串行子代理自动路由）
5. **test-driven-development** — 测试驱动（RED-GREEN-REFACTOR）
6. **requesting-code-review** — 代码评审（任务间隙激活）
7. **finishing-a-development-branch** — 分支完成（任务完成后激活）

### 分支场景
- 遇到问题 → **systematic-debugging**（系统调试）
- 接收评审反馈 → **receiving-code-review**（接收代码评审）
- 多任务可并行 → **dispatching-parallel-agents**（并行代理分发）
- 需要编写验收标准 → **writing-acceptance-criteria**（编写验收标准）
- 验证完成后、合并前 → **acceptance-testing**（验收测试）

### 核心原则

- **Iron Law (TDD)** — 没有失败测试就不写生产代码；遵循 RED-GREEN-REFACTOR 节奏
- **Iron Law (Debugging)** — 没有根因分析就不修 bug，禁止猜测修复
- **流程优于猜测** — 先验证再断言，禁止跳过步骤
- **自我评估** — 使用内联检查表自检，而非发起子代理 review 循环

### 代码注释规范

- **必须添加注释**：所有类、方法、关键逻辑分支、业务规则处理处必须添加中文注释
- **注释内容**：说明"为什么这样做"而非"做了什么"——代码本身已说明做了什么
- **注释位置**：注释应位于代码上方或行尾（视情况选择）
- **特殊情况**：简单明了、无歧义的代码（如 getter/setter、属性赋值）可不加注释
- **TODO/FIXME**：必须附带负责人和日期，格式 `// TODO(username: YYYY-MM-DD): <描述>`

---

## 文档布局

- `docs/superpowers/specs/` — 设计规格文档（`YYYY-MM-DD-<topic>-design.md`）
- `docs/superpowers/plans/` — 实现计划（`YYYY-MM-DD-<feature>.md`）
- `docs/superpowers/acceptance/` — 验收标准文档（`YYYY-MM-DD-<feature>-acceptance.md`）
- `RELEASE-NOTES.md` — 版本历史记录

---
## 本地 MCP 服务

- **postgres** — PostgreSQL 数据库（graphhire），用于结构化数据持久化
- **redis** — Redis 缓存（default），用于缓存和会话存储

---

## 常用命令

> **最高优先级**: 启动命令必须用 `run_in_background: true`，重启服务也同样要求

```bash
# 前端 http://localhost:8888
cd frontend && npm run dev

# 后端 http://localhost:7777
cd backend && mvn spring-boot:run
```

## 端口占用处理

```bash
netstat -ano | findstr :8888  # Windows
netstat -ano | findstr :7777
taskkill /PID <PID> /F
```

## 项目概述

**GraphHire 图谱智谱** — 基于AI智能匹配与能力图谱的招聘平台。核心功能：简历/职位文档智能解析、能力图谱构建、双向人岗匹配。
**端口：** 8888(前端) / 7777(后端) / 5432(PostgreSQL) / 6379(Redis) / 7687(memgraph) / 9000(rustfs)

---

## 完成验证要求

每次功能开发完成后、提交/合并前，必须使用 `/web-access` skill 打开浏览器验证对应功能页面是否正常工作。

## 浏览器测试

使用浏览器进行测试时，必须通过 `/web-access` skill 处理网络请求。
