CREATE TABLE IF NOT EXISTS industry_skill_profile
(
    id           BIGSERIAL PRIMARY KEY,
    industry_id  BIGINT    NOT NULL,
    profile_json JSONB     NOT NULL,
    create_time  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted      SMALLINT  NOT NULL DEFAULT 0,

    CONSTRAINT uk_industry_skill_profile_industry UNIQUE (industry_id),
    CONSTRAINT fk_industry_skill_profile_industry
        FOREIGN KEY (industry_id) REFERENCES industry(id),
    CONSTRAINT chk_industry_skill_profile_deleted CHECK (deleted IN (0, 1))
);

COMMENT ON TABLE industry_skill_profile IS '二级行业技能分类配置表';
COMMENT ON COLUMN industry_skill_profile.industry_id IS 'industry表二级子行业ID（level=2）';
COMMENT ON COLUMN industry_skill_profile.profile_json IS '技能分类JSON，结构: {"categories":[{"code":"...","name":"..."}]}';

CREATE INDEX IF NOT EXISTS idx_industry_skill_profile_deleted
    ON industry_skill_profile (deleted);
