ALTER TABLE match_record
    ADD COLUMN IF NOT EXISTS requirement_score DECIMAL(5,2) NOT NULL DEFAULT 0;

-- 使用历史分项回填 requirement_score
UPDATE match_record
SET requirement_score = COALESCE(city_score,0) * 0.4
                      + COALESCE(salary_score,0) * 0.3
                      + COALESCE(edu_score,0) * 0.3
WHERE requirement_score = 0;

ALTER TABLE match_record DROP COLUMN IF EXISTS exp_score;
ALTER TABLE match_record DROP COLUMN IF EXISTS city_score;
ALTER TABLE match_record DROP COLUMN IF EXISTS edu_score;
ALTER TABLE match_record DROP COLUMN IF EXISTS salary_score;
ALTER TABLE match_record DROP COLUMN IF EXISTS match_detail;
ALTER TABLE match_record DROP COLUMN IF EXISTS viewed;
