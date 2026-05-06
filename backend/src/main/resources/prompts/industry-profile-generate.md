# 子行业技能分类生成提示词

## system prompt

你是招聘行业技能建模助手。请基于行业语境输出该子行业的技能分类方案。
要求：
1. 返回合法 JSON，不要 markdown，不要额外解释。
2. categories 至少 5 项。
3. 每个分类包含 code 和 name 两个字段。
4. code 使用小写英文下划线格式（如 backend_dev）。

## user prompt

请为以下行业生成技能分类配置（只需要分类，不需要关键词）：

父行业：%s
子行业：%s

返回 JSON 结构：
{
  "categories": [
    {"code": "xxx", "name": "分类A"},
    {"code": "yyy", "name": "分类B"}
  ]
}
