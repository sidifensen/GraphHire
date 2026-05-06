-- =============================================
-- GraphHire 图谱智聘 - PostgreSQL 建表脚本
-- 版本: v1.1
-- 日期: 2026-04-17
-- 说明: 所有字段均有中文注释，索引按业务查询需求设计
-- 注意: 不使用外键约束，由应用层保证数据一致性
-- 更新: v1.1 新增投递/收藏/人才库/技能分类表，扩展通知类型
-- =============================================

-- 开启 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. 用户表 sys_user
-- =============================================
CREATE TABLE sys_user
(
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    user_type       SMALLINT     NOT NULL DEFAULT 1,
    company_id      BIGINT,
    status          SMALLINT     NOT NULL DEFAULT 1,
    last_login_time TIMESTAMP,
    create_time     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted         SMALLINT     NOT NULL DEFAULT 0,

    CONSTRAINT chk_user_type CHECK (user_type IN (1, 2, 3)),
    CONSTRAINT chk_user_status CHECK (status IN (0, 1))
);

COMMENT ON TABLE sys_user IS '用户表：存储个人用户、企业用户、管理员账号信息';
COMMENT ON COLUMN sys_user.id IS '主键ID';
COMMENT ON COLUMN sys_user.username IS '用户名（手机号/邮箱）';
COMMENT ON COLUMN sys_user.password IS 'BCrypt加密后的密码';
COMMENT ON COLUMN sys_user.user_type IS '用户类型：1-个人用户 2-企业用户 3-管理员';
COMMENT ON COLUMN sys_user.company_id IS '所属企业ID（仅企业用户有效）';
COMMENT ON COLUMN sys_user.status IS '账号状态：0-禁用 1-正常';
COMMENT ON COLUMN sys_user.last_login_time IS '最后登录时间（用于统计日活用户）';
COMMENT ON COLUMN sys_user.create_time IS '创建时间';
COMMENT ON COLUMN sys_user.update_time IS '更新时间';
COMMENT ON COLUMN sys_user.deleted IS '软删除标记：0-未删除 1-已删除';

CREATE INDEX idx_sys_user_username ON sys_user (username);
CREATE INDEX idx_sys_user_user_type ON sys_user (user_type);
CREATE INDEX idx_sys_user_company_id ON sys_user (company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_sys_user_status_deleted ON sys_user (status, deleted);

-- =============================================
-- 2. 个人信息表 person_info
-- =============================================
CREATE TABLE person_info
(
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT    NOT NULL UNIQUE,
    real_name   VARCHAR(50),
    gender      SMALLINT,
    age         INT,
    education   VARCHAR(20),
    city        VARCHAR(50),
    target_city VARCHAR(50),
    expected_salary INT,
    phone       VARCHAR(20),
    email       VARCHAR(100),
    school      VARCHAR(255),
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted     SMALLINT  NOT NULL DEFAULT 0,

    CONSTRAINT chk_gender CHECK (gender IS NULL OR gender IN (1, 2))
);

COMMENT ON TABLE person_info IS '个人信息表：存储个人用户的详细资料';
COMMENT ON COLUMN person_info.user_id IS '关联用户ID（1:1）';
COMMENT ON COLUMN person_info.real_name IS '真实姓名';
COMMENT ON COLUMN person_info.gender IS '性别：1-男 2-女';
COMMENT ON COLUMN person_info.age IS '年龄';
COMMENT ON COLUMN person_info.education IS '学历：初中及以下/高中/中专/大专/本科/硕士/博士';
COMMENT ON COLUMN person_info.city IS '居住城市';
COMMENT ON COLUMN person_info.target_city IS '意向工作城市';
COMMENT ON COLUMN person_info.expected_salary IS '期望月薪';
COMMENT ON COLUMN person_info.phone IS '手机号';
COMMENT ON COLUMN person_info.email IS '电子邮箱';
COMMENT ON COLUMN person_info.school IS '毕业院校';

CREATE INDEX idx_person_info_user_id ON person_info (user_id);
CREATE INDEX idx_person_info_city_target ON person_info (city, target_city) WHERE deleted = 0;

-- =============================================
-- 3. 企业表 company
-- =============================================
CREATE TABLE company
(
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL,
    name         VARCHAR(200) NOT NULL,
    code         VARCHAR(50)  NOT NULL UNIQUE,
    license_path VARCHAR(500),
    auth_status  SMALLINT     NOT NULL DEFAULT 0,
    industry_id  BIGINT,
    scale        VARCHAR(20),
    address      VARCHAR(300),
    contact      VARCHAR(50),
    phone        VARCHAR(20),
    description  VARCHAR(2000),
    website      VARCHAR(500),
    avatar_path  VARCHAR(500),
    create_time  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted      SMALLINT     NOT NULL DEFAULT 0,

    CONSTRAINT chk_auth_status CHECK (auth_status IN (0, 1, 2))
);

COMMENT ON TABLE company IS '企业表：存储企业用户的公司信息';
COMMENT ON COLUMN company.id IS '主键ID';
COMMENT ON COLUMN company.user_id IS '管理员用户ID（创建企业的用户）';
COMMENT ON COLUMN company.name IS '企业名称';
COMMENT ON COLUMN company.code IS '统一社会信用代码（18位）';
COMMENT ON COLUMN company.license_path IS '营业执照存储路径（RustFS）';
COMMENT ON COLUMN company.auth_status IS '认证状态：0-待审核 1-已认证 2-已拒绝';
COMMENT ON COLUMN company.industry_id IS '所属行业ID（关联industry表）';
COMMENT ON COLUMN company.scale IS '企业规模编码：1-0-20人 2-20-99人 3-100-499人 4-500-999人 5-1000-9999人 6-10000人以上';
COMMENT ON COLUMN company.address IS '详细地址';
COMMENT ON COLUMN company.contact IS '联系人姓名';
COMMENT ON COLUMN company.phone IS '联系电话';
COMMENT ON COLUMN company.description IS '企业简介';
COMMENT ON COLUMN company.website IS '公司官网地址';
COMMENT ON COLUMN company.avatar_path IS '企业头像对象路径';
COMMENT ON COLUMN company.create_time IS '创建时间';
COMMENT ON COLUMN company.update_time IS '更新时间';
COMMENT ON COLUMN company.deleted IS '软删除标记：0-未删除 1-已删除';

CREATE INDEX idx_company_user_id ON company (user_id);
CREATE INDEX idx_company_auth_status ON company (auth_status) WHERE deleted = 0;
CREATE INDEX idx_company_code ON company (code);
CREATE INDEX idx_company_industry_id ON company (industry_id);

-- =============================================
-- 3.1 二级行业技能分类配置表 industry_skill_profile
-- =============================================
CREATE TABLE industry_skill_profile
(
    id           BIGSERIAL PRIMARY KEY,
    industry_id  BIGINT    NOT NULL,
    profile_json JSONB     NOT NULL,
    create_time  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted      SMALLINT  NOT NULL DEFAULT 0,

    CONSTRAINT uk_industry_skill_profile_industry UNIQUE (industry_id),
    CONSTRAINT fk_industry_skill_profile_industry
        FOREIGN KEY (industry_id) REFERENCES industry(id),
    CONSTRAINT chk_industry_skill_profile_deleted CHECK (deleted IN (0, 1))
);

COMMENT ON TABLE industry_skill_profile IS '二级行业技能分类配置表';
COMMENT ON COLUMN industry_skill_profile.id IS '主键ID';
COMMENT ON COLUMN industry_skill_profile.industry_id IS 'industry表二级子行业ID（level=2）';
COMMENT ON COLUMN industry_skill_profile.profile_json IS '技能分类JSON，结构: {"categories":[{"code":"...","name":"..."}]}';
COMMENT ON COLUMN industry_skill_profile.create_time IS '创建时间';
COMMENT ON COLUMN industry_skill_profile.update_time IS '更新时间';
COMMENT ON COLUMN industry_skill_profile.deleted IS '软删除标记：0-未删除 1-已删除';

CREATE INDEX idx_industry_skill_profile_deleted ON industry_skill_profile (deleted);

-- =============================================
-- 4. 企业员工关联表 company_staff
-- =============================================
CREATE TABLE company_staff
(
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT      NOT NULL UNIQUE,
    company_id  BIGINT      NOT NULL,
    post        VARCHAR(20) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    create_time TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_post CHECK (post IN ('OWNER', 'HR')),
    CONSTRAINT chk_company_staff_status CHECK (status IN ('PENDING_JOIN', 'ACTIVE', 'REJECTED', 'DISABLED'))
);

COMMENT ON TABLE company_staff IS '企业员工关联表：建立用户与企业的多对一关系';
COMMENT ON COLUMN company_staff.user_id IS '用户ID（唯一，每个用户只能属于一个企业）';
COMMENT ON COLUMN company_staff.company_id IS '企业ID';
COMMENT ON COLUMN company_staff.post IS '职务：OWNER-企业主 HR-企业员工（管理员）';
COMMENT ON COLUMN company_staff.status IS '员工状态：PENDING_JOIN-待老板确认 ACTIVE-在职 REJECTED-拒绝加入 DISABLED-禁用';

CREATE INDEX idx_company_staff_company_id ON company_staff (company_id);
CREATE INDEX idx_company_staff_user_id ON company_staff (user_id);

-- =============================================
-- 5. 简历表 resume
-- =============================================
CREATE TABLE resume
(
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL,
    file_name    VARCHAR(255) NOT NULL,
    file_path    VARCHAR(500) NOT NULL,
    file_type    VARCHAR(10)  NOT NULL,
    file_size    BIGINT       NOT NULL DEFAULT 0,
    parse_status SMALLINT     NOT NULL DEFAULT 0,
    parse_result JSONB,
    is_default   SMALLINT     NOT NULL DEFAULT 0,
    create_time  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted      SMALLINT     NOT NULL DEFAULT 0,

    CONSTRAINT chk_parse_status CHECK (parse_status IN (0, 1, 2, 3)),
    CONSTRAINT chk_file_type CHECK (file_type IN ('doc', 'docx', 'pdf'))
);

COMMENT ON TABLE resume IS '简历表：存储用户上传的简历文档及解析结果';
COMMENT ON COLUMN resume.id IS '主键ID';
COMMENT ON COLUMN resume.user_id IS '所属用户ID';
COMMENT ON COLUMN resume.file_name IS '原始文件名';
COMMENT ON COLUMN resume.file_path IS 'RustFS存储路径';
COMMENT ON COLUMN resume.file_type IS '文件类型：doc/docx/pdf';
COMMENT ON COLUMN resume.file_size IS '文件大小（字节）';
COMMENT ON COLUMN resume.parse_status IS '解析状态：0-待解析 1-解析中 2-成功 3-失败';
COMMENT ON COLUMN resume.parse_result IS 'AI解析结果JSON（包含结构化数据+置信度）';
COMMENT ON COLUMN resume.is_default IS '是否默认简历：0-否 1-是';
COMMENT ON COLUMN resume.create_time IS '上传时间';
COMMENT ON COLUMN resume.update_time IS '更新时间';
COMMENT ON COLUMN resume.deleted IS '软删除标记：0-未删除 1-已删除';

CREATE INDEX idx_resume_user_id ON resume (user_id);
CREATE INDEX idx_resume_parse_status ON resume (parse_status) WHERE deleted = 0;
CREATE INDEX idx_resume_user_default ON resume (user_id, is_default) WHERE deleted = 0 AND is_default = 1;
CREATE INDEX idx_resume_create_time ON resume (create_time DESC);
CREATE INDEX idx_resume_parse_skills ON resume USING GIN ((parse_result -> 'skills'));
ALTER TABLE resume ADD COLUMN IF NOT EXISTS file_size BIGINT NOT NULL DEFAULT 0;

-- =============================================
-- 6. 技能标签表 skill_tag
-- =============================================
CREATE TABLE skill_tag
(
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    synonyms    JSONB,
    create_time TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE skill_tag IS '技能标签表：统一管理所有技能标签（技术技能/软技能）';
COMMENT ON COLUMN skill_tag.id IS '主键ID';
COMMENT ON COLUMN skill_tag.name IS '技能名称（如：Java、Python、项目管理）';
COMMENT ON COLUMN skill_tag.synonyms IS '同义词列表JSON（如：["Spring Boot", "Spring"]）';

CREATE INDEX idx_skill_tag_name ON skill_tag (name);
CREATE INDEX idx_skill_tag_synonyms ON skill_tag USING GIN (synonyms);

-- =============================================
-- 8. 职位类型表 position_type
-- =============================================
CREATE TABLE position_type
(
    id          BIGSERIAL PRIMARY KEY,
    code        BIGINT       NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    parent_id   BIGINT,
    level       SMALLINT     NOT NULL,
    sort_no     INT          NOT NULL DEFAULT 0,
    status      SMALLINT     NOT NULL DEFAULT 1,
    create_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted     SMALLINT     NOT NULL DEFAULT 0,

    CONSTRAINT chk_position_type_level CHECK (level IN (1, 2, 3)),
    CONSTRAINT chk_position_type_status CHECK (status IN (0, 1))
);

COMMENT ON TABLE position_type IS '职位类型树表：存储岗位类别层级（一级/二级/三级）';
COMMENT ON COLUMN position_type.id IS '主键ID';
COMMENT ON COLUMN position_type.code IS '职位类型业务编码（外部同步编码）';
COMMENT ON COLUMN position_type.name IS '职位类型名称';
COMMENT ON COLUMN position_type.parent_id IS '父级职位类型ID（根节点为NULL）';
COMMENT ON COLUMN position_type.level IS '层级：1-一级 2-二级 3-三级';
COMMENT ON COLUMN position_type.sort_no IS '同级排序号';
COMMENT ON COLUMN position_type.status IS '状态：0-禁用 1-启用';
COMMENT ON COLUMN position_type.deleted IS '软删除标记：0-未删除 1-已删除';

CREATE INDEX idx_position_type_parent_id ON position_type (parent_id);
CREATE INDEX idx_position_type_level ON position_type (level);
CREATE INDEX idx_position_type_deleted_status ON position_type (deleted, status);

-- =============================================
-- 7. 职位表 job
-- =============================================
CREATE TABLE job
(
    id           BIGSERIAL PRIMARY KEY,
    company_id   BIGINT       NOT NULL,
    owner_user_id BIGINT,
    title        VARCHAR(100) NOT NULL,
    description  VARCHAR(2000),
    skills       TEXT[]       NOT NULL DEFAULT '{}',
    city         VARCHAR(50),
    salary_min   INT,
    salary_max   INT,
    salary_unit  VARCHAR(20),
    experience   VARCHAR(50),
    education    SMALLINT,
    position_type_id BIGINT,
    job_type     SMALLINT     NOT NULL DEFAULT 1,
    status       SMALLINT     NOT NULL DEFAULT 0,
    create_time  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted      SMALLINT     NOT NULL DEFAULT 0,

    CONSTRAINT chk_job_education CHECK (education IS NULL OR education IN (1, 2, 3, 4, 5)),
    CONSTRAINT chk_job_type CHECK (job_type IN (1, 2, 3)),
    CONSTRAINT chk_job_status CHECK (status IN (0, 1)),
    CONSTRAINT chk_salary CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
);

COMMENT ON TABLE job IS '职位表：存储企业发布的职位信息';
COMMENT ON COLUMN job.id IS '主键ID';
COMMENT ON COLUMN job.company_id IS '所属企业ID';
COMMENT ON COLUMN job.owner_user_id IS '岗位负责人用户ID';
COMMENT ON COLUMN job.title IS '职位名称';
COMMENT ON COLUMN job.description IS '岗位描述（企业录入）';
COMMENT ON COLUMN job.skills IS '岗位技能名称数组（来源于 skill_tag.name）';
COMMENT ON COLUMN job.city IS '工作城市';
COMMENT ON COLUMN job.salary_min IS '最低薪资';
COMMENT ON COLUMN job.salary_max IS '最高薪资';
COMMENT ON COLUMN job.salary_unit IS '薪资单位：月/年';
COMMENT ON COLUMN job.experience IS '经验要求（如：1-3年、3-5年、不限）';
COMMENT ON COLUMN job.education IS '学历要求编码：1-中专 2-大专 3-本科 4-硕士 5-博士';
COMMENT ON COLUMN job.position_type_id IS '职位类型ID（关联position_type.id，由应用层保证）';
COMMENT ON COLUMN job.job_type IS '工作类型：1-全职 2-兼职 3-实习';
COMMENT ON COLUMN job.status IS '职位状态：0-草稿/下架 1-上架（发布中）';
COMMENT ON COLUMN job.create_time IS '发布时间';
COMMENT ON COLUMN job.update_time IS '更新时间';
COMMENT ON COLUMN job.deleted IS '软删除标记：0-未删除 1-已删除';

CREATE INDEX idx_job_company_id ON job (company_id);
CREATE INDEX idx_job_owner_user_id ON job (owner_user_id);
CREATE INDEX idx_job_company_owner_user_id ON job (company_id, owner_user_id);
CREATE INDEX idx_job_status ON job (status) WHERE deleted = 0;
CREATE INDEX idx_job_city ON job (city) WHERE deleted = 0 AND status = 1;
CREATE INDEX idx_job_create_time ON job (create_time DESC);
CREATE INDEX idx_job_title ON job (title);
CREATE INDEX idx_job_skills_gin ON job USING GIN (skills);
CREATE INDEX idx_job_position_type_id ON job (position_type_id);

-- =============================================
-- 9. 匹配记录表 match_record
-- =============================================
CREATE TABLE match_record
(
    id              BIGSERIAL PRIMARY KEY,
    resume_id       BIGINT        NOT NULL,
    job_id          BIGINT        NOT NULL,
    match_direction SMALLINT      NOT NULL DEFAULT 1,
    match_score     DECIMAL(5, 2) NOT NULL,
    skill_score     DECIMAL(5, 2) NOT NULL,
    exp_score       DECIMAL(5, 2) NOT NULL,
    city_score      DECIMAL(5, 2) NOT NULL,
    edu_score       DECIMAL(5, 2) NOT NULL,
    salary_score    DECIMAL(5, 2) NOT NULL,
    match_detail    JSONB,
    viewed          SMALLINT      NOT NULL DEFAULT 0,
    create_time     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_match_resume_job UNIQUE (resume_id, job_id, match_direction),
    CONSTRAINT chk_match_direction CHECK (match_direction IN (1, 2)),
    CONSTRAINT chk_viewed CHECK (viewed IN (0, 1))
);

COMMENT ON TABLE match_record IS '匹配记录表：存储人岗匹配的计算结果';
COMMENT ON COLUMN match_record.id IS '主键ID';
COMMENT ON COLUMN match_record.resume_id IS '简历ID';
COMMENT ON COLUMN match_record.job_id IS '职位ID';
COMMENT ON COLUMN match_record.match_direction IS '匹配方向：1-个人申请职位 2-企业推荐候选人';
COMMENT ON COLUMN match_record.match_score IS '综合匹配分（0-100）';
COMMENT ON COLUMN match_record.skill_score IS '技能匹配得分（0-100）';
COMMENT ON COLUMN match_record.exp_score IS '经验匹配得分（0-100）';
COMMENT ON COLUMN match_record.city_score IS '城市匹配得分（0-100）';
COMMENT ON COLUMN match_record.edu_score IS '学历匹配得分（0-100）';
COMMENT ON COLUMN match_record.salary_score IS '薪资匹配得分（0-100）';
COMMENT ON COLUMN match_record.match_detail IS '详细匹配分析JSON（AI生成）';
COMMENT ON COLUMN match_record.viewed IS '是否已查看：0-未查看 1-已查看';
COMMENT ON COLUMN match_record.create_time IS '匹配时间';
COMMENT ON COLUMN match_record.update_time IS '更新时间';

CREATE UNIQUE INDEX idx_match_resume_job ON match_record (resume_id, job_id, match_direction);
CREATE INDEX idx_match_resume_id ON match_record (resume_id);
CREATE INDEX idx_match_job_id ON match_record (job_id);
CREATE INDEX idx_match_score ON match_record (match_score DESC);
CREATE INDEX idx_match_viewed ON match_record (viewed) WHERE viewed = 0;
CREATE INDEX idx_match_create_time ON match_record (create_time DESC);
CREATE INDEX idx_match_direction ON match_record (match_direction);

-- =============================================
-- 11. 解析任务表 parse_task
-- =============================================
CREATE TABLE parse_task
(
    id          BIGSERIAL PRIMARY KEY,
    task_type   SMALLINT  NOT NULL,
    source_id   BIGINT    NOT NULL,
    status      SMALLINT  NOT NULL DEFAULT 0,
    retry_count INT       NOT NULL DEFAULT 0,
    error_msg   TEXT,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finish_time TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_task_type CHECK (task_type = 1),
    CONSTRAINT chk_task_status CHECK (status IN (0, 1, 2, 3))
);

COMMENT ON TABLE parse_task IS '解析任务表：管理文档解析任务的队列和执行状态';
COMMENT ON COLUMN parse_task.id IS '主键ID';
COMMENT ON COLUMN parse_task.task_type IS '任务类型：1-简历解析（当前仅支持该类型）';
COMMENT ON COLUMN parse_task.source_id IS '来源ID：简历ID（当前仅关联简历解析任务）';
COMMENT ON COLUMN parse_task.status IS '任务状态：0-排队 1-执行中 2-成功 3-失败';
COMMENT ON COLUMN parse_task.retry_count IS '重试次数';
COMMENT ON COLUMN parse_task.error_msg IS '错误信息';
COMMENT ON COLUMN parse_task.create_time IS '创建时间';
COMMENT ON COLUMN parse_task.finish_time IS '完成时间';
COMMENT ON COLUMN parse_task.update_time IS '更新时间';

CREATE INDEX idx_parse_task_status ON parse_task (status);
CREATE INDEX idx_parse_task_type ON parse_task (task_type);
CREATE INDEX idx_parse_task_source ON parse_task (task_type, source_id);
CREATE INDEX idx_parse_task_create_time ON parse_task (create_time);

-- =============================================
-- 12. 消息通知表 notification
-- =============================================
CREATE TABLE notification
(
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    type        SMALLINT     NOT NULL,
    title       VARCHAR(100) NOT NULL,
    content     TEXT,
    related_id  BIGINT,
    is_read     SMALLINT     NOT NULL DEFAULT 0,
    create_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_notif_type CHECK (type IN (1, 2, 3, 4, 5)),
    CONSTRAINT chk_is_read CHECK (is_read IN (0, 1))
);

COMMENT ON TABLE notification IS '消息通知表：存储用户的站内通知';
COMMENT ON COLUMN notification.id IS '主键ID';
COMMENT ON COLUMN notification.user_id IS '接收用户ID';
COMMENT ON COLUMN notification.type IS '通知类型：1-简历解析完成 2-新职位推荐 3-收到候选人推荐 4-企业认证结果 5-简历被查看';
COMMENT ON COLUMN notification.title IS '通知标题';
COMMENT ON COLUMN notification.content IS '通知内容';
COMMENT ON COLUMN notification.related_id IS '关联ID（简历ID/职位ID/匹配记录ID等）';
COMMENT ON COLUMN notification.is_read IS '已读状态：0-未读 1-已读';
COMMENT ON COLUMN notification.create_time IS '创建时间';
COMMENT ON COLUMN notification.update_time IS '更新时间';

CREATE INDEX idx_notification_user_id ON notification (user_id);
CREATE INDEX idx_notification_user_unread ON notification (user_id, is_read) WHERE is_read = 0;
CREATE INDEX idx_notification_type ON notification (type);
CREATE INDEX idx_notification_create_time ON notification (create_time DESC);

-- =============================================
-- 13. 聊天会话表 chat_conversation
-- =============================================
CREATE TABLE chat_conversation
(
    id                         BIGSERIAL PRIMARY KEY,
    job_id                     BIGINT    NOT NULL,
    company_id                 BIGINT    NOT NULL,
    recruiter_user_id          BIGINT    NOT NULL,
    candidate_user_id          BIGINT    NOT NULL,
    status                     SMALLINT  NOT NULL DEFAULT 1,
    last_message_id            BIGINT,
    recruiter_last_read_msg_id BIGINT,
    candidate_last_read_msg_id BIGINT,
    create_time                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted                    SMALLINT  NOT NULL DEFAULT 0,

    CONSTRAINT uk_chat_conversation_job_candidate UNIQUE (job_id, candidate_user_id),
    CONSTRAINT chk_chat_conversation_status CHECK (status IN (1, 2)),
    CONSTRAINT chk_chat_conversation_deleted CHECK (deleted IN (0, 1))
);

COMMENT ON TABLE chat_conversation IS '岗位私聊会话表';
COMMENT ON COLUMN chat_conversation.id IS '主键ID';
COMMENT ON COLUMN chat_conversation.job_id IS '岗位ID';
COMMENT ON COLUMN chat_conversation.company_id IS '企业ID';
COMMENT ON COLUMN chat_conversation.recruiter_user_id IS '招聘者用户ID';
COMMENT ON COLUMN chat_conversation.candidate_user_id IS '求职者用户ID';
COMMENT ON COLUMN chat_conversation.status IS '会话状态：1-进行中 2-已关闭';
COMMENT ON COLUMN chat_conversation.last_message_id IS '最后一条消息ID';
COMMENT ON COLUMN chat_conversation.recruiter_last_read_msg_id IS '招聘者最后已读消息ID';
COMMENT ON COLUMN chat_conversation.candidate_last_read_msg_id IS '求职者最后已读消息ID';
COMMENT ON COLUMN chat_conversation.create_time IS '创建时间';
COMMENT ON COLUMN chat_conversation.update_time IS '更新时间';
COMMENT ON COLUMN chat_conversation.deleted IS '软删除标记：0-未删除 1-已删除';

CREATE INDEX idx_chat_conversation_recruiter_update_time ON chat_conversation (recruiter_user_id, update_time DESC);
CREATE INDEX idx_chat_conversation_candidate_update_time ON chat_conversation (candidate_user_id, update_time DESC);
CREATE INDEX idx_chat_conversation_job_id ON chat_conversation (job_id);

-- =============================================
-- 14. 聊天消息主表 chat_message
-- =============================================
CREATE TABLE chat_message
(
    id               BIGSERIAL PRIMARY KEY,
    conversation_id  BIGINT    NOT NULL,
    sender_user_id   BIGINT    NOT NULL,
    receiver_user_id BIGINT    NOT NULL,
    message_type     SMALLINT  NOT NULL,
    content          TEXT,
    ext              JSONB,
    recalled         SMALLINT  NOT NULL DEFAULT 0,
    create_time      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted          SMALLINT  NOT NULL DEFAULT 0,

    CONSTRAINT chk_chat_message_type CHECK (message_type IN (1, 2, 3, 4, 5)),
    CONSTRAINT chk_chat_message_recalled CHECK (recalled IN (0, 1)),
    CONSTRAINT chk_chat_message_deleted CHECK (deleted IN (0, 1))
);

COMMENT ON TABLE chat_message IS '聊天消息主表';
COMMENT ON COLUMN chat_message.id IS '主键ID';
COMMENT ON COLUMN chat_message.conversation_id IS '会话ID';
COMMENT ON COLUMN chat_message.sender_user_id IS '发送者用户ID';
COMMENT ON COLUMN chat_message.receiver_user_id IS '接收者用户ID';
COMMENT ON COLUMN chat_message.message_type IS '消息类型：1-文本 2-图片 3-简历卡片 4-面试邀请卡片 5-系统消息';
COMMENT ON COLUMN chat_message.content IS '消息正文';
COMMENT ON COLUMN chat_message.ext IS '扩展JSON字段';
COMMENT ON COLUMN chat_message.recalled IS '撤回标记：0-正常 1-已撤回';
COMMENT ON COLUMN chat_message.create_time IS '创建时间';
COMMENT ON COLUMN chat_message.update_time IS '更新时间';
COMMENT ON COLUMN chat_message.deleted IS '软删除标记：0-未删除 1-已删除';

CREATE INDEX idx_chat_message_conversation_id ON chat_message (conversation_id, id DESC);
CREATE INDEX idx_chat_message_receiver_user_id ON chat_message (receiver_user_id, id DESC);
CREATE INDEX idx_chat_message_sender_user_id ON chat_message (sender_user_id, id DESC);

-- =============================================
-- 15. 图片消息详情表 chat_message_image
-- =============================================
CREATE TABLE chat_message_image
(
    id          BIGSERIAL PRIMARY KEY,
    message_id  BIGINT       NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    file_name   VARCHAR(255) NOT NULL,
    create_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted     SMALLINT     NOT NULL DEFAULT 0,

    CONSTRAINT uk_chat_message_image_message_id UNIQUE (message_id),
    CONSTRAINT chk_chat_message_image_deleted CHECK (deleted IN (0, 1))
);

COMMENT ON TABLE chat_message_image IS '图片消息详情表';
COMMENT ON COLUMN chat_message_image.id IS '主键ID';
COMMENT ON COLUMN chat_message_image.message_id IS '关联消息ID';
COMMENT ON COLUMN chat_message_image.file_path IS '图片对象存储路径';
COMMENT ON COLUMN chat_message_image.file_name IS '原始文件名';
COMMENT ON COLUMN chat_message_image.create_time IS '创建时间';
COMMENT ON COLUMN chat_message_image.update_time IS '更新时间';
COMMENT ON COLUMN chat_message_image.deleted IS '软删除标记：0-未删除 1-已删除';

CREATE INDEX idx_chat_message_image_create_time ON chat_message_image (create_time DESC);

-- =============================================
-- 16. 简历卡片消息详情表 chat_message_resume
-- =============================================
CREATE TABLE chat_message_resume
(
    id                   BIGSERIAL PRIMARY KEY,
    message_id           BIGINT       NOT NULL,
    resume_id            BIGINT       NOT NULL,
    resume_owner_user_id BIGINT       NOT NULL,
    snapshot_file_name   VARCHAR(255) NOT NULL,
    snapshot_file_path   VARCHAR(500) NOT NULL,
    create_time          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted              SMALLINT     NOT NULL DEFAULT 0,

    CONSTRAINT uk_chat_message_resume_message_id UNIQUE (message_id),
    CONSTRAINT chk_chat_message_resume_deleted CHECK (deleted IN (0, 1))
);

COMMENT ON TABLE chat_message_resume IS '简历卡片消息详情表';
COMMENT ON COLUMN chat_message_resume.id IS '主键ID';
COMMENT ON COLUMN chat_message_resume.message_id IS '关联消息ID';
COMMENT ON COLUMN chat_message_resume.resume_id IS '来源简历ID';
COMMENT ON COLUMN chat_message_resume.resume_owner_user_id IS '简历所属求职者用户ID';
COMMENT ON COLUMN chat_message_resume.snapshot_file_name IS '快照文件名';
COMMENT ON COLUMN chat_message_resume.snapshot_file_path IS '快照文件路径';
COMMENT ON COLUMN chat_message_resume.create_time IS '创建时间';
COMMENT ON COLUMN chat_message_resume.update_time IS '更新时间';
COMMENT ON COLUMN chat_message_resume.deleted IS '软删除标记：0-未删除 1-已删除';

CREATE INDEX idx_chat_message_resume_owner_user_id ON chat_message_resume (resume_owner_user_id, create_time DESC);

-- =============================================
-- 17. 面试邀请卡片消息详情表 chat_message_interview_invite
-- =============================================
CREATE TABLE chat_message_interview_invite
(
    id                BIGSERIAL PRIMARY KEY,
    message_id        BIGINT        NOT NULL,
    job_id            BIGINT        NOT NULL,
    inviter_user_id   BIGINT        NOT NULL,
    candidate_user_id BIGINT        NOT NULL,
    interview_time    TIMESTAMP     NOT NULL,
    location          VARCHAR(255)  NOT NULL,
    remark            VARCHAR(1000),
    create_time       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted           SMALLINT      NOT NULL DEFAULT 0,

    CONSTRAINT uk_chat_message_interview_invite_message_id UNIQUE (message_id),
    CONSTRAINT chk_chat_message_interview_invite_deleted CHECK (deleted IN (0, 1))
);

COMMENT ON TABLE chat_message_interview_invite IS '面试邀请卡片消息详情表';
COMMENT ON COLUMN chat_message_interview_invite.id IS '主键ID';
COMMENT ON COLUMN chat_message_interview_invite.message_id IS '关联消息ID';
COMMENT ON COLUMN chat_message_interview_invite.job_id IS '岗位ID';
COMMENT ON COLUMN chat_message_interview_invite.inviter_user_id IS '发起邀请的招聘者用户ID';
COMMENT ON COLUMN chat_message_interview_invite.candidate_user_id IS '被邀请求职者用户ID';
COMMENT ON COLUMN chat_message_interview_invite.interview_time IS '面试时间';
COMMENT ON COLUMN chat_message_interview_invite.location IS '面试地点';
COMMENT ON COLUMN chat_message_interview_invite.remark IS '面试备注';
COMMENT ON COLUMN chat_message_interview_invite.create_time IS '创建时间';
COMMENT ON COLUMN chat_message_interview_invite.update_time IS '更新时间';
COMMENT ON COLUMN chat_message_interview_invite.deleted IS '软删除标记：0-未删除 1-已删除';

CREATE INDEX idx_chat_message_interview_invite_candidate_time
    ON chat_message_interview_invite (candidate_user_id, interview_time DESC);

-- =============================================
-- 表结构扩展
-- =============================================

-- person_info 表添加头像字段
ALTER TABLE person_info ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
COMMENT ON COLUMN person_info.avatar_url IS '头像URL';

-- notification 表扩展类型约束（支持6-简历投递 7-面试邀请）
ALTER TABLE notification DROP CONSTRAINT IF EXISTS chk_notif_type;
ALTER TABLE notification ADD CONSTRAINT chk_notif_type CHECK (type IN (1, 2, 3, 4, 5, 6));
COMMENT ON COLUMN notification.type IS '通知类型：1-简历解析完成 2-新职位推荐 3-收到候选人推荐 4-企业认证结果 5-简历被查看 6-面试邀请';


