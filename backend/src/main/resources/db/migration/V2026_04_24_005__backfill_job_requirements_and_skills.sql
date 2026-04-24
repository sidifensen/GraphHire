-- =============================================
-- 职位数据补齐：招聘要求与技能
-- 日期: 2026-04-24
-- 说明:
-- 1) 统一补齐 job.parse_result.skills / requirements 字段
-- 2) 将 parse_result.skills 同步入 job_skill 关联表
-- =============================================

WITH normalized_job AS (
    SELECT
        j.id,
        j.title,
        j.education,
        j.experience,
        CASE
            WHEN j.parse_result IS NOT NULL AND jsonb_typeof(j.parse_result) = 'object'
                THEN j.parse_result
            ELSE '{}'::jsonb
        END AS parse_result_obj
    FROM job j
    WHERE COALESCE(j.deleted, 0) = 0
),
enriched_job AS (
    SELECT
        n.id,
        jsonb_set(
            jsonb_set(
                n.parse_result_obj - 'Skills',
                '{skills}',
                COALESCE(
                    CASE
                        WHEN jsonb_typeof(n.parse_result_obj -> 'skills') = 'array'
                            THEN n.parse_result_obj -> 'skills'
                    END,
                    CASE
                        WHEN jsonb_typeof(n.parse_result_obj -> 'Skills') = 'array'
                            THEN n.parse_result_obj -> 'Skills'
                    END,
                    CASE
                        WHEN LOWER(n.title) LIKE '%java%' THEN '["Java","Spring Boot","MySQL","Redis"]'::jsonb
                        WHEN LOWER(n.title) LIKE '%python%' THEN '["Python","MySQL"]'::jsonb
                        WHEN LOWER(n.title) LIKE '%前端%' OR LOWER(n.title) LIKE '%front%' THEN '["JavaScript","TypeScript"]'::jsonb
                        WHEN LOWER(n.title) LIKE '%ai%' OR LOWER(n.title) LIKE '%算法%' THEN '["Python","PyTorch","TensorFlow"]'::jsonb
                        WHEN LOWER(n.title) LIKE '%devops%' OR LOWER(n.title) LIKE '%运维%' THEN '["Linux","Docker","Kubernetes"]'::jsonb
                    END,
                    '[]'::jsonb
                ),
                true
            ),
            '{requirements}',
            COALESCE(
                CASE
                    WHEN jsonb_typeof(n.parse_result_obj -> 'requirements') = 'array'
                        THEN n.parse_result_obj -> 'requirements'
                END,
                to_jsonb(array_remove(ARRAY[
                    CASE
                        WHEN COALESCE(n.education, '') <> '' THEN n.education || '及以上学历'
                    END,
                    CASE
                        WHEN COALESCE(n.experience, '') <> '' THEN '具备' || n.experience || '相关经验'
                    END,
                    '具备良好的沟通协作能力'
                ], NULL))
            ),
            true
        ) AS new_parse_result
    FROM normalized_job n
)
UPDATE job j
SET parse_result = e.new_parse_result,
    update_time = CURRENT_TIMESTAMP
FROM enriched_job e
WHERE j.id = e.id;

WITH skill_source AS (
    SELECT
        j.id AS job_id,
        LOWER(TRIM(skill_name)) AS skill_name
    FROM job j
             CROSS JOIN LATERAL jsonb_array_elements_text(
            COALESCE(
                CASE
                    WHEN j.parse_result IS NOT NULL
                        AND jsonb_typeof(j.parse_result) = 'object'
                        AND jsonb_typeof(j.parse_result -> 'skills') = 'array'
                        THEN j.parse_result -> 'skills'
                END,
                '[]'::jsonb
            )
        ) AS skills(skill_name)
    WHERE COALESCE(j.deleted, 0) = 0
),
resolved_skill AS (
    SELECT DISTINCT
        s.job_id,
        t.id AS skill_id
    FROM skill_source s
             JOIN skill_tag t ON LOWER(t.name) = s.skill_name
)
INSERT INTO job_skill (job_id, skill_id, is_required, weight, create_time, update_time)
SELECT
    r.job_id,
    r.skill_id,
    1,
    1.00,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM resolved_skill r
ON CONFLICT (job_id, skill_id) DO UPDATE
SET is_required = EXCLUDED.is_required,
    weight = EXCLUDED.weight,
    update_time = CURRENT_TIMESTAMP;
