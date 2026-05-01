CREATE TABLE IF NOT EXISTS industry
(
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    enabled     SMALLINT     NOT NULL DEFAULT 1,
    sort_order  INT          NOT NULL DEFAULT 0,
    create_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted     SMALLINT     NOT NULL DEFAULT 0
);

COMMENT ON TABLE industry IS '行业字典表：统一维护企业所属行业';
COMMENT ON COLUMN industry.id IS '主键ID';
COMMENT ON COLUMN industry.name IS '行业名称（唯一）';
COMMENT ON COLUMN industry.enabled IS '启用状态：0-停用 1-启用';
COMMENT ON COLUMN industry.sort_order IS '排序值，越小越靠前';
COMMENT ON COLUMN industry.create_time IS '创建时间';
COMMENT ON COLUMN industry.update_time IS '更新时间';
COMMENT ON COLUMN industry.deleted IS '软删除标记：0-未删除 1-已删除';

CREATE INDEX IF NOT EXISTS idx_industry_enabled_sort ON industry (enabled, sort_order, id);

ALTER TABLE company
    ADD COLUMN IF NOT EXISTS industry_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_company_industry_id ON company (industry_id);

INSERT INTO industry (name, enabled, sort_order)
SELECT DISTINCT c.industry, 1, 0
FROM company c
WHERE c.industry IS NOT NULL
  AND btrim(c.industry) <> ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO industry (name, enabled, sort_order) VALUES
('金融科技', 1, 10),
('电子商务', 1, 20),
('医疗健康', 1, 30),
('教育培训', 1, 40),
('游戏', 1, 50),
('企业服务', 1, 60),
('消费品', 1, 70),
('智能制造', 1, 80),
('新能源', 1, 90),
('物流供应链', 1, 100),
('文娱传媒', 1, 110),
('房地产服务', 1, 120),
('汽车出行', 1, 130),
('农业科技', 1, 140),
('政务服务', 1, 150),
('通信设备', 1, 160),
('半导体', 1, 170),
('人工智能平台', 1, 180),
('本地生活', 1, 190),
('跨境贸易', 1, 200)
ON CONFLICT (name) DO NOTHING;

UPDATE company c
SET industry_id = i.id
FROM industry i
WHERE c.industry = i.name
  AND c.industry_id IS NULL;

DO
$$
    DECLARE
        unmapped_count INT;
    BEGIN
        SELECT COUNT(*)
        INTO unmapped_count
        FROM company
        WHERE industry IS NOT NULL
          AND btrim(industry) <> ''
          AND industry_id IS NULL;

        IF unmapped_count > 0 THEN
            RAISE EXCEPTION 'Industry mapping failed, unmapped count: %', unmapped_count;
        END IF;
    END
$$;

ALTER TABLE company
    DROP COLUMN IF EXISTS industry;
