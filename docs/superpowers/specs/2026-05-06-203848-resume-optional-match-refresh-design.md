# 简历上传与重解析可选全量匹配刷新设计

**日期**: 2026-05-06  
**范围**: `frontend/src/app/(user)/resume/**`、`frontend/src/lib/api/resume.ts`、`backend/src/main/java/com/graphhire/resume/**`、对应测试

---

## 目标

在“上传简历”和“重新解析”两个入口增加“是否刷新所有职位匹配记录”选项，并满足：

1. 选项是可选的，前端默认勾选（默认刷新）。
2. 用户可取消勾选，取消后不触发全量职位匹配刷新。
3. 无论是否刷新匹配，技能刷新与图数据库更新都必须照常执行。

## 现状问题

- 默认简历解析成功后会自动触发全量匹配，缺少用户可控开关。
- 上传与重解析接口未传递“是否刷新匹配”信号。
- 解析链路中“匹配刷新”和“图谱更新”未解耦控制。

## 方案

### 方案 A：前端仅提示，不改后端

- 缺点：无法真正控制后端是否执行全量匹配。

### 方案 B（采用）：前后端透传 `refreshAllMatches`

- 上传与重解析 API 增加 `refreshAllMatches` 参数（默认 `true`）。
- MQ 消息增加第三段标记 `resumeId,parseTaskId,refreshAllMatches`。
- 解析成功后：
  - 图谱更新逻辑保持原样（始终执行）。
  - 仅在默认简历且 `refreshAllMatches=true` 时触发 `triggerMatchForResume`。

## 前端设计

1. 上传和重解析触发前弹窗确认：
   - 文案说明“默认勾选刷新，取消则不刷新”。
2. 上传请求：
   - 在 `FormData` 写入 `refreshAllMatches=true/false`。
3. 重解析请求：
   - 调用 `resumeApi.parse(id, refreshAllMatches)`。

## 后端设计

1. `ResumeController`
   - `POST /resume/my/upload` 增加 `@RequestParam(defaultValue = "true") boolean refreshAllMatches`。
   - `POST /resume/{id}/parse` 同样增加该参数。
2. `ResumeAppService`
   - `uploadResume` 和 `triggerResumeParse` 增加 `refreshAllMatches` 入参并透传到 MQ 生产者。
3. `ResumeMQProducer`
   - 解析消息格式扩展为三段。
4. `ResumeParseMQConsumer`
   - 解析第三段布尔值；
   - 匹配触发条件改为：`isDefault && refreshAllMatches`；
   - `resume-parsed` 事件仍始终发送，确保图谱更新不受影响。

## 测试策略（TDD）

1. 前端页面测试先断言：
   - 重新解析调用含 `true/false`。
   - 上传 `FormData` 含 `refreshAllMatches` 字段。
2. 后端控制器/服务测试断言：
   - 参数透传至 service 与 MQ。
3. MQ 消费测试断言：
   - 默认简历 + `false` 时不触发全量匹配；
   - 图谱链路事件仍发送。
