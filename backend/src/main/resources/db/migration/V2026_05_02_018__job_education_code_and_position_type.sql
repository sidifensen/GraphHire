CREATE TABLE IF NOT EXISTS position_type
(
    id          BIGSERIAL PRIMARY KEY,
    code        BIGINT       NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    parent_id   BIGINT,
    level       SMALLINT     NOT NULL,
    sort_no     INT          NOT NULL DEFAULT 0,
    status      SMALLINT     NOT NULL DEFAULT 1,
    create_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted     SMALLINT     NOT NULL DEFAULT 0,
    CONSTRAINT chk_position_type_level CHECK (level IN (1, 2, 3)),
    CONSTRAINT chk_position_type_status CHECK (status IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_position_type_parent_id ON position_type(parent_id);
CREATE INDEX IF NOT EXISTS idx_position_type_level ON position_type(level);

ALTER TABLE job ADD COLUMN IF NOT EXISTS position_type_id BIGINT;
ALTER TABLE job ADD COLUMN IF NOT EXISTS education_code SMALLINT;

UPDATE job
SET education_code = CASE
    WHEN education IN ('中专', '中专/中技') THEN 1
    WHEN education = '大专' THEN 2
    WHEN education = '本科' THEN 3
    WHEN education = '硕士' THEN 4
    WHEN education = '博士' THEN 5
    ELSE NULL
END
WHERE education_code IS NULL;

ALTER TABLE job DROP CONSTRAINT IF EXISTS chk_job_education;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'job' AND column_name = 'education'
          AND data_type <> 'smallint'
    ) THEN
        ALTER TABLE job DROP COLUMN education;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'job' AND column_name = 'education_code'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'job' AND column_name = 'education'
    ) THEN
        ALTER TABLE job RENAME COLUMN education_code TO education;
    ELSIF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'job' AND column_name = 'education_code'
    ) THEN
        ALTER TABLE job DROP COLUMN education_code;
    END IF;
END $$;

ALTER TABLE job ADD CONSTRAINT chk_job_education CHECK (education IS NULL OR education IN (1, 2, 3, 4, 5));
CREATE INDEX IF NOT EXISTS idx_job_position_type_id ON job(position_type_id);

COMMENT ON COLUMN job.education IS '学历要求编码：1-中专 2-大专 3-本科 4-硕士 5-博士';
COMMENT ON COLUMN job.position_type_id IS '职位类型ID（关联position_type.id，由应用层保证）';
