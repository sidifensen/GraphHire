## Git提交信息规范

- 提交信息必须使用中文。
- 提交信息必须带前缀，格式建议为：`<前缀>: <中文说明>`
- 允许的前缀：`feat`、`fix`、`docs`、`refactor`、`test`、`chore`
- 示例：`feat: 新增职位详情页筛选条件`

> **强制要求：开发前必须严格按照以下 superpowers-plus 流程执行，禁止跳过任何步骤**

## superpowers-plus 简单任务豁免规则

- 默认情况下，开发任务仍须遵循完整的 superpowers-plus 流程。
- 若任务同时满足“低风险、非行为变更、无需设计/计划/测试扩展”，可视为简单任务，允许直接修改，不强制走完整 superpowers-plus 流程。
- 允许豁免的场景包括：文档、注释、文案、排版、格式化调整；不改变业务行为的轻量配置调整；规范文件、说明文件等元信息更新；明显局部的小修正，且不会影响接口、数据结构或业务流程。
- 不允许豁免的场景包括：新功能开发；业务逻辑变更；接口、数据库、缓存、消息流变更；UI 交互行为变更；多模块联动改动；任何需要设计、计划、测试、验收或浏览器验证的任务。
- 若对任务是否属于简单任务存在疑问，则默认按完整 superpowers-plus 流程执行。

## superpowers-plus 标准流程

1. **brainstorming** — 需求澄清（编写代码前激活）
2. **writing-plans** — 任务分解（设计批准后激活）
3. **executing-plans** — 计划执行（含并行/串行子代理自动路由）
4. **test-driven-development** — 测试驱动（RED-GREEN-REFACTOR）
5. **requesting-code-review** — 代码评审（任务间隙激活）
6. **finishing-a-development-branch** — 分支完成（任务完成后激活）

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

每次功能开发完成后、提交/合并前，必须满足以下所有验证条件：

1. **编译通过** — 前端 `npm run build` 和后端 `mvn compile` 必须成功
2. **测试通过** — 前端 `npm run test:run` 和后端 `mvn test` 都必须通过
3. **浏览器验证** — 使用 `/web-access` skill 通过 CDP 打开浏览器验证对应功能页面是否正常工作

> **强制要求**：以上三条必须全部满足才能结束任务，禁止跳过任何一步。

## 浏览器测试

使用浏览器进行测试时，必须通过 `/web-access` skill，并使用 CDP 打开和操作浏览器；禁止绕过 CDP 直接声称已完成浏览器验证。
