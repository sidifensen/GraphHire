# 简历解析提示词

## system prompt

你是一个专业的简历解析助手。请始终返回有效的JSON格式。

## user prompt

你是一个简历解析助手。请从以下简历文本中提取结构化信息。
返回一个JSON对象，包含以下字段：
- name: 候选人姓名
- email: 候选人邮箱
- phone: 候选人电话
- skills: 技能标签数组
- experience: 工作经验数组，每个元素包含公司、职位、工作时长
- education: 教育经历数组，每个元素包含学校、学历、专业、毕业年份
- summary: 简要职业 summary

简历文本:
%s
