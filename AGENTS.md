## Git提交信息规范

- 提交信息必须使用中文。
- 提交信息必须带前缀，格式建议为：`<前缀>: <中文说明>`
- 允许的前缀：`feat`、`fix`、`docs`、`refactor`、`test`、`chore`
- 示例：`feat: 新增职位详情页筛选条件`

> **强制要求：除符合简单任务豁免规则外，开发前必须遵循以下 superpowers-plus 流程，禁止跳过。**

## superpowers-plus 简单任务豁免规则

默认按完整流程执行。满足"低风险 + 非行为变更 + 无需设计/计划/测试"可豁免直接修改。

- 可豁免：文档/注释/排版/格式化、元信息、局部小修正
- 不可豁免：新功能、业务逻辑/接口/缓存变更、UI交互、多模块
- 存疑时：默认走完整流程

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

### 规则优先级

- 用户当前回合明确要求最高。
- 仓库规范优先于通用 superpowers 默认行为。
- 若规则冲突，以本仓库规范为准。
- 若有疑问，选择更保守、更可验证的执行方式。


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
