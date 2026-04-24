-- 删除 skill_tag 中不再使用的分类相关字段
ALTER TABLE skill_tag
    DROP COLUMN IF EXISTS category_id,
    DROP COLUMN IF EXISTS parent_id,
    DROP COLUMN IF EXISTS category;

-- 删除已下线的技能分类表
DROP TABLE IF EXISTS skill_category;

