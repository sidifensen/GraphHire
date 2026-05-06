ALTER TABLE person_info
    ADD COLUMN IF NOT EXISTS expected_position_type_ids BIGINT[],
    ADD COLUMN IF NOT EXISTS default_position_type_id BIGINT;

COMMENT ON COLUMN person_info.expected_position_type_ids IS '期望职位类型ID列表（position_type叶子节点）';
COMMENT ON COLUMN person_info.default_position_type_id IS '默认期望职位类型ID（需属于期望职位列表）';

