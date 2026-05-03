-- 投递记录表
CREATE TABLE IF NOT EXISTS application (
    id BIGSERIAL PRIMARY KEY,
    resume_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resume_id, job_id)
);

-- 收藏记录表
CREATE TABLE IF NOT EXISTS favorite (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

-- 人才库表
CREATE TABLE IF NOT EXISTS talent_pool (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    resume_id BIGINT NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    UNIQUE(company_id, resume_id)
);

-- 创建索引
CREATE INDEX idx_application_user_id ON application(user_id);
CREATE INDEX idx_application_job_id ON application(job_id);
CREATE INDEX idx_application_company_id ON application(company_id);
CREATE INDEX idx_application_status ON application(status);

CREATE INDEX idx_favorite_user_id ON favorite(user_id);
CREATE INDEX idx_favorite_job_id ON favorite(job_id);

CREATE INDEX idx_talent_pool_company_id ON talent_pool(company_id);
CREATE INDEX idx_talent_pool_resume_id ON talent_pool(resume_id);
