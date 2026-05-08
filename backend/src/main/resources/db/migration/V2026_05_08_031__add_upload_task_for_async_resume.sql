CREATE TABLE IF NOT EXISTS upload_task
(
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT      NOT NULL,
    file_name           VARCHAR(255) NOT NULL,
    file_type           VARCHAR(128),
    file_size           BIGINT      NOT NULL DEFAULT 0,
    status              SMALLINT    NOT NULL DEFAULT 0,
    error_msg           TEXT,
    resume_id           BIGINT,
    refresh_all_matches SMALLINT    NOT NULL DEFAULT 1,
    create_time         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finish_time         TIMESTAMP,
    deleted             SMALLINT    NOT NULL DEFAULT 0,
    CONSTRAINT chk_upload_task_status CHECK (status IN (0, 1, 2, 3, 4, 5)),
    CONSTRAINT chk_upload_task_refresh CHECK (refresh_all_matches IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_upload_task_user_id ON upload_task (user_id, id DESC);
CREATE INDEX IF NOT EXISTS idx_upload_task_status ON upload_task (status, id DESC);
CREATE INDEX IF NOT EXISTS idx_upload_task_resume_id ON upload_task (resume_id);

CREATE INDEX IF NOT EXISTS idx_parse_task_resume_running
    ON parse_task (task_type, source_id, status, id DESC);
