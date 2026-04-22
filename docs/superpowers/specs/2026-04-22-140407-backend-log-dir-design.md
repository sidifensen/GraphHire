# 后端日志目录统一设计（logback-spring.xml）

## 背景

当前后端仅配置了控制台日志格式，日志文件输出路径未在后端工程内集中声明。目标是将后端日志统一写入 `backend/logs` 目录，并保留现有控制台输出行为。

## 目标

1. 后端运行后，日志文件统一输出到 `backend/logs`。
2. 保留控制台日志输出，便于开发态排查。
3. 使用 `logback-spring.xml` 集中管理文件滚动策略，避免分散在 `application.yml` 中的路径配置。

## 方案

1. 新增 `backend/src/main/resources/logback-spring.xml`。
2. 定义 `LOG_DIR=./logs`，主文件为 `${LOG_DIR}/graphhire-backend.log`。
3. 配置 `RollingFileAppender`，按天滚动到 `${LOG_DIR}/archive/graphhire-backend.%d{yyyy-MM-dd}.log`。
4. `root` 日志同时绑定 `CONSOLE` 和 `FILE` appender。
5. 保持 `application.yml` 中现有日志级别不变，不新增 `logging.file.*` 配置。

## 错误处理与兼容性

1. `./logs` 目录不存在时由 Logback 自动创建。
2. 在 Windows/Linux 下均使用相对路径 `./logs`，路径跟随后端启动目录，避免硬编码绝对路径。
3. 若未来需要按大小切分，可在该配置上扩展 `SizeAndTimeBasedRollingPolicy`。

## 测试策略

1. 先写失败测试：验证系统启动并写日志后，`./logs/graphhire-backend.log` 存在。
2. 再补 `logback-spring.xml` 实现使测试通过。
3. 最终执行后端编译与测试、全量前后端校验命令，并做浏览器验证。
