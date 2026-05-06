CREATE TABLE IF NOT EXISTS position_type_skill_profile
(
    id               BIGSERIAL PRIMARY KEY,
    position_type_id BIGINT    NOT NULL,
    profile_json     JSONB     NOT NULL,
    create_time      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted          SMALLINT  NOT NULL DEFAULT 0,

    CONSTRAINT fk_position_type_skill_profile_position_type
        FOREIGN KEY (position_type_id) REFERENCES position_type(id),
    CONSTRAINT chk_position_type_skill_profile_deleted CHECK (deleted IN (0, 1))
);

COMMENT ON TABLE position_type_skill_profile IS '职位类型技能分类配置表';
COMMENT ON COLUMN position_type_skill_profile.position_type_id IS 'position_type 表叶子节点ID（建议 level=3）';
COMMENT ON COLUMN position_type_skill_profile.profile_json IS '技能分类JSON，结构: {"categories":[{"code":"...","name":"..."}]}';

CREATE INDEX IF NOT EXISTS idx_position_type_skill_profile_position_type_id
    ON position_type_skill_profile (position_type_id);
CREATE INDEX IF NOT EXISTS idx_position_type_skill_profile_deleted
    ON position_type_skill_profile (deleted);

DROP TABLE IF EXISTS industry_skill_profile;
