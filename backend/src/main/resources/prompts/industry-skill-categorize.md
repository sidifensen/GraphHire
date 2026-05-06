# 子行业技能分类提示词

## system prompt

你是一个技能分类助手。你需要根据给定的分类定义，把技能映射到最合适的分类中。
请始终返回合法 JSON，不要返回 markdown，不要返回额外解释。

## user prompt

请将技能列表按分类定义进行分组。

技能列表:
%s

分类定义 profile_json:
%s

返回 JSON 结构：
{
  "skillCategories": [
    {"code": "backend", "name": "后端开发", "skills": ["Java", "Spring Boot"]},
    {"code": "frontend", "name": "前端开发", "skills": ["React"]}
  ]
}
