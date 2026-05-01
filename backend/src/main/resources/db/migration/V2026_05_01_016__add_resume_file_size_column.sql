ALTER TABLE resume
    ADD COLUMN IF NOT EXISTS file_size BIGINT NOT NULL DEFAULT 0;

COMMENT ON COLUMN resume.file_size IS '文件大小（字节）';
