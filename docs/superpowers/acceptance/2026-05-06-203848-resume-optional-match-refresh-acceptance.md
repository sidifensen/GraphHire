# 简历可选全量匹配刷新验收标准

## AC-1 上传入口可选刷新全量匹配
- GIVEN 用户上传简历
- WHEN 用户确认“刷新所有职位匹配记录”（默认）
- THEN 请求携带 `refreshAllMatches=true`
- AND 解析成功后（默认简历）触发全量职位匹配刷新。

## AC-2 上传入口可关闭刷新全量匹配
- GIVEN 用户上传简历
- WHEN 用户取消“刷新所有职位匹配记录”
- THEN 请求携带 `refreshAllMatches=false`
- AND 解析成功后不触发全量职位匹配刷新。

## AC-3 重解析入口可选刷新全量匹配
- GIVEN 用户点击“重新解析”
- WHEN 用户确认刷新
- THEN 解析请求携带 `refreshAllMatches=true`
- AND 解析成功后（默认简历）触发全量职位匹配刷新。

## AC-4 重解析入口可关闭刷新全量匹配
- GIVEN 用户点击“重新解析”
- WHEN 用户取消刷新
- THEN 解析请求携带 `refreshAllMatches=false`
- AND 解析成功后不触发全量职位匹配刷新。

## AC-5 技能与图谱更新不受选项影响
- GIVEN 解析成功
- WHEN `refreshAllMatches=true/false` 任一情况
- THEN `resume-parsed` 事件仍会发布
- AND 图数据库技能图谱更新流程仍执行。
