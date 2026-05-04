ALTER TABLE company
    ADD COLUMN IF NOT EXISTS website VARCHAR(500);

COMMENT ON COLUMN company.website IS '公司官网地址';

ALTER TABLE company
    DROP COLUMN IF EXISTS contact_email;
