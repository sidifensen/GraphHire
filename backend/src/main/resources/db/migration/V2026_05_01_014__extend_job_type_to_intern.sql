ALTER TABLE job
    DROP CONSTRAINT IF EXISTS chk_job_type;

ALTER TABLE job
    ADD CONSTRAINT chk_job_type CHECK (job_type IN (1, 2, 3));

COMMENT ON COLUMN job.job_type IS '工作类型：1-全职 2-兼职 3-实习';
