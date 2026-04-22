ALTER TABLE person_info
    ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

COMMENT ON COLUMN person_info.avatar_url IS '头像URL';
