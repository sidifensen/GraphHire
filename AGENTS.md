## Git提交信息规范

- 提交信息必须使用中文。
- 提交信息必须带前缀，格式建议为：`<前缀>: <中文说明>`
- 允许的前缀：`feat`、`fix`、`docs`、`refactor`、`test`、`chore`
- 示例：`feat: 新增职位详情页筛选条件`
- 完成任务后，默认由助手协助执行提交（`git add` + `git commit`）；
- 非简单任务（尤其是大功能开发、或前后端同时改动）在完成后必须自动提交，不需要用户额外提醒；
- 简单任务豁免范围内的小改动默认不提交代码；仅当用户明确要求提交时才执行 `git add` + `git commit`；
- 每次提交后必须同步更新 `RELEASE-NOTES.md`（简要记录本次变更）；

> **强制要求：除符合简单任务豁免规则外，开发前必须遵循以下 superpowers-plus 流程，禁止跳过。**

## superpowers-plus 简单任务豁免规则
- 可豁免：文档/注释/排版/格式化、元信息、局部小修正
- 可豁免（补充）：日志级别/日志打印调整、错误文案微调（不改变业务行为）
- 不可豁免：新功能、业务逻辑/接口/缓存变更、UI交互、多模块

## 简单任务执行规则

- 简单任务默认直接修改，不要求输出完整计划流程。
- 简单任务按改动面做最小必要验证，不做无关模块验证。
- 小改动（符合简单任务豁免范围）如需写计划时，仅需产出一个 `docs/superpowers/plans/` 下的 plan 文档；不强制要求 spec 与 acceptance 文档。

## superpowers-plus 标准流程

1. **brainstorming** — 需求澄清
2. **writing-plans** — 任务分解
3. **test-driven-development** — 先写失败测试，再写生产代码，遵循 RED-GREEN-REFACTOR
4. **executing-plans** — 按计划执行实现，过程严格遵循 TDD，并优先使用子 agent 分工推进
5. **requesting-code-review** — 关键里程碑完成后、提交前或合并前进行代码评审
6. **finishing-a-development-branch** — 任务完成后收尾

### 执行约束

- 默认情况下，**executing-plans** 阶段不开启分支树/工作树；如确需开启，必须先询问用户并获得明确同意。
- 如任务可安全拆分，应尽量使用子 agent 并行/分工执行，减少主会话上下文污染。
- 子 agent 仅用于边界清晰、职责独立、写入范围可控的子任务；若处于关键路径且结果需立即依赖，优先主会话直接处理。

### 核心原则

- **TDD 铁律**：没有失败测试就不写生产代码。
- **Debug 铁律**：没有根因分析就不修 bug。
- **流程优于猜测**：先验证再断言。
- **自我评估**：使用内联检查表自检，不发起子代理 review 循环。

### Hutool 工具规范

**强制要求：所有手写工具类代码必须优先使用 Hutool 替代，禁止重复造轮子。**

## 数据库变更规范

- **强制要求：凡涉及数据库结构变更（建表、删表、字段新增/删除/类型变更、索引/约束变更），必须同时提交迁移脚本与结构定义更新。**
- 必须新增对应 `db/migration` 脚本（遵循现有命名规则），确保其他环境可自动补齐。
- 必须同步更新 `backend/src/main/resources/db/schema.sql`，保持基线结构与迁移一致。
- 涉及表字段变更时，必须同步检查并更新对应的 PO/Mapper/DTO 映射，避免“数据库已变更但代码未生效”。

## 文档布局

- `docs/superpowers/specs/` — 设计规格文档（`YYYY-MM-DD-HHMMSS-<topic>-design.md`）
- `docs/superpowers/plans/` — 实现计划（`YYYY-MM-DD-HHMMSS-<feature>.md`）
- `docs/superpowers/acceptance/` — 验收标准文档（`YYYY-MM-DD-HHMMSS-<feature>-acceptance.md`）
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

提交/合并前按改动面验证：

1. **仅后端改动**：执行 `mvn compile`、`mvn test`
2. **仅前端改动**：执行 `npm run build`、`npm run test:run`
3. **前后端都有改动**：四项全部执行
4. **浏览器验证（/web-access + CDP）**：仅在改动前端页面/交互，或用户明确要求时执行

## 浏览器测试

使用浏览器进行测试时，必须通过 `/web-access` skill，并使用 CDP 打开和操作浏览器；禁止绕过 CDP 直接声称已完成浏览器验证。
