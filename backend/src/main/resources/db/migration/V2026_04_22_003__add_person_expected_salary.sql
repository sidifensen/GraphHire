ALTER TABLE person_info
    ADD COLUMN IF NOT EXISTS expected_salary INT;

COMMENT ON COLUMN person_info.expected_salary IS '期望月薪';

