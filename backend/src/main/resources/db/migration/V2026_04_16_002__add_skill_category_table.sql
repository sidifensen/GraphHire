-- 技能分类表
CREATE TABLE IF NOT EXISTS skill_category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- skill_tag 表新增 category_id 字段
ALTER TABLE skill_tag ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES skill_category(id);
