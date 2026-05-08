# 验收标准：Resume MQ 并发闸门（RPermitExpirableSemaphore）

- 时间：2026-05-08-235926

## 功能验收

1. 上传消费者并发闸门
- GIVEN 上传 MQ 消费触发
- WHEN semaphore 可获取 permit
- THEN 执行原有上传-建简历-建解析任务流程，并在完成后释放 permit。

2. 上传消费者获取 permit 失败
- GIVEN 上传 MQ 消费触发
- WHEN semaphore 在等待窗口内无法获取 permit
- THEN 任务快速失败（抛异常），且不执行上传与落库核心逻辑。

3. 解析消费者并发闸门
- GIVEN 解析 MQ 消费触发
- WHEN semaphore 可获取 permit
- THEN 执行原有提取文本-AI解析-状态推进流程，并在 finally 中释放 permit。

4. 解析消费者获取 permit 失败
- GIVEN 解析 MQ 消费触发
- WHEN semaphore 在等待窗口内无法获取 permit
- THEN 任务快速失败（抛异常），且不执行文本提取与 AI 调用。

5. 异常路径释放
- GIVEN 上传或解析流程中任一步骤抛异常
- WHEN onMessage 结束
- THEN 已成功获取的 permit 必须被释放，不得泄露并发额度。

## 配置验收

1. 配置可缺省启动
- 默认配置存在，服务在不额外设置新配置时可正常启动。

2. 两条链路可独立调节
- 上传和解析 semaphore 的名称、并发上限、等待时长、租约时长可分别配置。

## 测试验收

1. 单元测试
- 覆盖上传消费者：成功释放、获取失败快速失败。
- 覆盖解析消费者：成功释放、失败释放、获取失败快速失败。

2. 回归
- 现有 resume MQ 相关测试通过，无功能回退。
