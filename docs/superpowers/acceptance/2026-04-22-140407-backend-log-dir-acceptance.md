# Acceptance Criteria: 后端日志统一落盘到 backend/logs

**Spec:** `docs/superpowers/specs/2026-04-22-140407-backend-log-dir-design.md`
**Date:** 2026-04-22
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 后端使用 `logback-spring.xml` 作为日志输出配置来源 | Logic | `backend/src/main/resources/logback-spring.xml` 存在 | 配置文件存在且包含 `RollingFileAppender` 与 `root` 绑定 |
| AC-002 | 后端启动并写日志后，日志文件落在 `backend/logs` | Logic | 在 `backend` 目录执行测试，测试前清理 `./logs` | 生成 `backend/logs/graphhire-backend.log` 文件 |
| AC-003 | 日志归档路径位于 `backend/logs/archive` | Logic | 读取 `logback-spring.xml` | 存在归档文件模式 `./logs/archive/graphhire-backend.%d{yyyy-MM-dd}.log` |
| AC-004 | 后端编译与测试命令可通过 | Logic | 依赖服务可用或测试已做隔离 | `mvn compile` 与 `mvn test` 成功 |
| AC-005 | 项目级强制校验命令全部通过 | Logic | 在项目根目录执行前后端校验 | `frontend: npm run build && npm run test:run`、`backend: mvn compile && mvn test` 全部成功 |
| AC-006 | 浏览器验证步骤通过 CDP 执行并可访问系统页面 | UI interaction | 前后端服务已启动 | 通过 CDP 打开页面并成功加载，记录验证结果 |
