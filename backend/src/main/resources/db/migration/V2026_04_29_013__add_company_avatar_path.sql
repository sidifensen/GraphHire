ALTER TABLE company
    ADD COLUMN IF NOT EXISTS avatar_path VARCHAR(500);

COMMENT ON COLUMN company.avatar_path IS '企业头像对象路径';
