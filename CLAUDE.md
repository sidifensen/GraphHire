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

### Hutool 工具规范

**强制要求：所有手写工具类代码必须优先使用 Hutool 替代，禁止重复造轮子。**

#### 工具模块速查表

| 场景 | 必须使用 | 禁止使用 |
|------|---------|---------|
| JSON 解析/构建 | `cn.hutool.json.JSONUtil` / `JSONObject` / `JSONArray` | 手写 `substring` + `split` |
| HTTP 请求 | `cn.hutool.http.HttpRequest` / `HttpUtil` | `RestTemplate`（新建场景）|
| 日期创建/格式化 | `cn.hutool.core.date.DateUtil` | `new Date()` |
| 字符串判空/格式化 | `cn.hutool.core.text.StrUtil` | `str == null` / `str.isEmpty()` |
| 对象属性拷贝 | `cn.hutool.core.bean.BeanUtil.copyProperties()` | 逐字段 `setXxx()` |
| 集合空安全 | `cn.hutool.core.collection.CollUtil` | `list == null ? new ArrayList<>() : list` |
| 验证码/随机数 | `cn.hutool.core.util.RandomUtil` / `SecureUtil.randomNumbers()` | `new Random()` |
| 日志打印 | `cn.hutool.log.StaticLog` | `System.out.println()` |
| 异常消息提取 | `cn.hutool.core.exceptions.ExceptionUtil.getMessage()` | `e.getMessage()` 直接透出 |
| 邮箱/手机号验证 | `cn.hutool.core.lang.Validator.isEmail()` / `isMobile()` | 手写正则 |
| 文件读写/判断 | `cn.hutool.core.io.FileUtil` / `NioUtil` | `Files.newInputStream()` / `Paths.get()` |
| 类型转换 | `cn.hutool.core.convert.Convert` | 手写 `Integer.parseInt()` |
| ID 生成 | `cn.hutool.core.util.IdUtil.simpleUUID()` | 拼接字符串作为 ID |
| Base64 编解码 | `cn.hutool.core.codec.Base64` | 手写 Base64 |
| 加密摘要 | `cn.hutool.crypto.SecureUtil` / `DigestUtil` / `BCrypt` | 手写 MD5/SHA |

#### 特殊情况豁免

- MyBatis-Plus 查询（`LambdaQueryWrapper`）— 已是成熟方案，保持不变
- Sa-Token 认证 — 专用认证框架，保持不变
- Spring Data Redis 操作（`StringRedisTemplate`）— 已是标准，保持不变
- `Result<T>` / `PageQuery` / `PageResult` — 项目基础设施类，保持不变
- PO/Domain 转换中**枚举字段映射** — 需手动转换，不得用 BeanUtil 跳过

#### 新增 import 规范

```java
// 严格按以下路径引入，禁止从其他包路径引入同名类
import cn.hutool.json.JSONUtil;          // JSON
import cn.hutool.http.HttpRequest;        // HTTP
import cn.hutool.core.date.DateUtil;      // 日期
import cn.hutool.core.text.StrUtil;      // 字符串
import cn.hutool.core.bean.BeanUtil;     // Bean操作
import cn.hutool.core.collection.CollUtil; // 集合
import cn.hutool.core.util.RandomUtil;    // 随机数
import cn.hutool.core.util.SecureUtil;    // 安全工具
import cn.hutool.log.StaticLog;          // 日志
import cn.hutool.core.exceptions.ExceptionUtil; // 异常
import cn.hutool.core.lang.Validator;     // 验证器
import cn.hutool.core.io.FileUtil;       // 文件
import cn.hutool.core.convert.Convert;     // 转换
import cn.hutool.core.util.IdUtil;        // ID生成
import cn.hutool.core.codec.Base64;       // Base64
```

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
