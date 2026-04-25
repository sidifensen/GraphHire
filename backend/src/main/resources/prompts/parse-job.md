# 职位描述解析提示词

## system prompt

你是一个专业的职位描述解析助手。请始终返回有效的JSON格式。

## user prompt

你是一个职位描述解析助手。请从以下职位描述中提取结构化信息。
返回一个JSON对象，包含以下字段：
- title: 职位 title（如果提供的title合适则使用）
- skills: 必填技能标签数组
- requiredExperience: 工作经验要求年限
- education: 学历要求
- salaryRange: 薪资范围（如果有）
- responsibilities: 主要职责数组
- summary: 简要职位 summary

职位名称: %s

职位描述文本:
%s
