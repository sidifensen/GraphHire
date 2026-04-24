ALTER TABLE parse_task DROP CONSTRAINT IF EXISTS chk_task_type;
ALTER TABLE parse_task ADD CONSTRAINT chk_task_type CHECK (task_type = 1);

COMMENT ON COLUMN parse_task.task_type IS '任务类型：1-简历解析（当前仅支持该类型）';
COMMENT ON COLUMN parse_task.source_id IS '来源ID：简历ID（当前仅关联简历解析任务）';
