# 契约：用户职位点击到匹配详情

## 路由契约
- 入口：`/jobs`
- 点击职位卡片跳转：`/match/{jobId}`
- 参数约定：`jobId` 为正整数，来自列表接口 item.id

## API 契约
1. `GET /public/jobs/{id}`
- 用途：职位基础信息和职位要求
- 关键字段：`id`、`title`、`companyName`、`city`、`district`、`salaryMin`、`salaryMax`、`requiredSkills[]`

2. `GET /person/match/{jobId}`
- 用途：个人与职位的匹配明细
- 关键字段：`score(total/skillScore/expScore/eduScore/salScore/cityScore)`、`level`、`matchReason`

3. `GET /match/person/{personId}/job/{jobId}/graph-score`
- 用途：技能图谱匹配结果
- 关键字段：`totalScore`、`matchLevel`、`matchedSkills[]`、`missingSkills[]`、`matchRate`

## 前端展示契约
- 职位要求：优先渲染 `requiredSkills[]`，为空时展示降级文案。
- 匹配程度：总分/等级/已匹配技能/待补足技能必须可见；缺字段时显示兜底文本。
