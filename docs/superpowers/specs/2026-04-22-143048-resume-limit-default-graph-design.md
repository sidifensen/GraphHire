# 简历数量限制与默认简历图谱刷新设计

## 背景
当前系统缺少用户简历数量上限控制；“设为默认”未强约束解析状态，也未保证触发能力图谱按默认简历刷新。

## 目标
1. 每个用户最多保留 3 份简历，超限上传直接拒绝。
2. 仅解析成功（SUCCESS）的简历允许设为默认。
3. 设为默认后异步触发能力图谱更新。
4. 简历管理页增加“重新解析”按钮（FAILED/SUCCESS 可见，PROCESSING 禁用）。

## 方案
### 后端
- 在 ResumeAppService.uploadResume 增加数量校验。
- 在 ResumeAppService.setDefaultResume 增加 SUCCESS 校验。
- 设默认成功后通过 ResumeMQProducer 发送 resume-default-changed 事件（payload: resumeId）。
- 新增 ResumeDefaultChangedMQConsumer，消费后读取简历并调用 GraphBuildService.buildGraphForResume。

### 前端
- 管理页为每条简历增加“重新解析”按钮。
- FAILED/SUCCESS 显示按钮，PROCESSING 显示禁用态按钮。
- 点击后调用 resumeApi.parse 并刷新列表。

## 错误提示
- 上传超限：最多上传3份简历，请先删除旧简历
- 设默认失败：请先解析成功后再设为默认

## 兼容性
- 不变更数据库结构。
- 保持现有 parse/graph MQ 流程，新增 topic 仅补充默认切换场景。
