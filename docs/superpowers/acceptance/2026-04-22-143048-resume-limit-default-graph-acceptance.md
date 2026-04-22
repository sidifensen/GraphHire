# 简历数量限制与默认简历图谱刷新验收标准

## AC1 上传数量限制
- Given 用户已有3份简历
- When 再上传第4份
- Then 接口返回失败，提示“最多上传3份简历，请先删除旧简历”

## AC2 设默认状态限制
- Given 目标简历状态不是SUCCESS
- When 点击设为默认
- Then 接口返回失败，提示“请先解析成功后再设为默认”

## AC3 默认切换触发图谱更新
- Given 目标简历状态为SUCCESS
- When 设为默认成功
- Then 发布 resume-default-changed 消息并触发图谱构建

## AC4 管理页重新解析按钮
- Given 简历状态为FAILED/SUCCESS
- Then 显示“重新解析”按钮
- Given 简历状态为PROCESSING
- Then 显示禁用“重新解析”按钮
- When 点击可用按钮
- Then 调用重新解析接口并刷新列表
