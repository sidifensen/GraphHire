-- =============================================
-- GraphHire 图谱智聘 - PostgreSQL 初始化数据
-- 版本: v1.0
-- 日期: 2026-04-16
-- 更新: 2026-04-17
-- =============================================

-- =============================================
-- 测试账号（密码统一: password123）
-- =============================================
-- 管理员: admin@graphhire.com
-- 企业 HR: hr@techchina.com
-- 个人用户: 13800138001@phone.com
--
-- IT测试专用（集成测试用，密码: Test123456）:
-- test_person@graphhire.com / test_company@graphhire.com / test_admin@graphhire.com
-- =============================================

-- 引入建表脚本
-- \i schema.sql

-- =============================================
-- 0. IT测试专用账号（BaseControllerIT 使用）
-- BCrypt加密后的密码: Test123456
-- 原文: Test123456
-- =============================================
INSERT INTO sys_user (id, username, password, user_type, company_id, status, create_time, update_time, deleted) VALUES
(100, 'test_person@graphhire.com', '$2a$10$w5zZsRUx.D7UTyoDrsXaxuTSShu5y7uFU8cNtD/sb3qzJ1OfPRzvC', 1, NULL, 1, '2026-04-16 00:00:00', '2026-04-16 00:00:00', 0),
(101, 'test_company@graphhire.com', '$2a$10$w5zZsRUx.D7UTyoDrsXaxuTSShu5y7uFU8cNtD/sb3qzJ1OfPRzvC', 2, 100, 1, '2026-04-16 00:00:00', '2026-04-16 00:00:00', 0),
(102, 'test_admin@graphhire.com', '$2a$10$w5zZsRUx.D7UTyoDrsXaxuTSShu5y7uFU8cNtD/sb3qzJ1OfPRzvC', 3, NULL, 1, '2026-04-16 00:00:00', '2026-04-16 00:00:00', 0)
ON CONFLICT (username) DO NOTHING;

-- =============================================
-- 行业字典初始数据
-- =============================================
INSERT INTO industry (name, enabled, sort_order) VALUES
('互联网/人工智能', 1, 1),
('互联网服务', 1, 2),
('人力资源服务', 1, 3),
('软件服务', 1, 4),
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

-- IT测试用公司（供 test_company@graphhire.com 使用）
INSERT INTO company (id, user_id, name, code, license_path, auth_status, industry_id, scale, address, contact, phone, create_time, update_time, deleted) VALUES
(100, 101, 'IT测试科技有限公司', '91110000IT00000001', '/files/company/license_it_test.pdf', 1, (SELECT id FROM industry WHERE name = '互联网/人工智能' LIMIT 1), '2', '北京市海淀区测试路1号', '测试HR', '13800009999', '2026-04-16 00:00:00', '2026-04-16 00:00:00', 0)
ON CONFLICT (code) DO NOTHING;

-- IT测试公司员工关联
INSERT INTO company_staff (user_id, company_id, post, status, create_time, update_time) VALUES
(101, 100, 'OWNER', 'ACTIVE', '2026-04-16 00:00:00', '2026-04-16 00:00:00')
ON CONFLICT (user_id) DO NOTHING;

-- IT测试用个人简历
INSERT INTO resume (id, user_id, file_name, file_path, file_type, file_size, parse_status, parse_result, is_default, create_time, update_time, deleted) VALUES
(100, 100, 'IT测试简历.pdf', '/files/resume/resume_it_test.pdf', 'pdf', 1048576, 2,
 '{"Name":"IT测试用户","Skills":["Java","Spring Boot","MySQL","Redis"],"Experience":"3年","Education":"本科","ExpectedSalary":30000,"WorkHistory":[{"Company":"测试科技","Position":"Java开发","Duration":"2021-至今"}]}',
 1, '2026-04-16 00:00:00', '2026-04-16 00:00:00', 0)
ON CONFLICT (id) DO NOTHING;

-- IT测试用职位
INSERT INTO job (id, company_id, title, file_path, parse_status, parse_result, city, salary_min, salary_max, salary_unit, experience, education, job_type, status, create_time, update_time, deleted) VALUES
(100, 100, 'IT测试后端开发工程师', '/files/job/job_it_test.txt', 2,
 '{"skills":["Java","Spring Boot","MySQL","Redis","Docker"],"requirements":["本科及以上学历","具备1-3年Java后端开发经验","熟悉Spring Boot与常用中间件"],"responsibilities":["负责核心业务系统开发","优化系统性能","指导初级工程师"]}',
 '北京', 25000, 40000, '月', '1-3年', '本科', 1, 1, '2026-04-16 00:00:00', '2026-04-16 00:00:00', 0)
ON CONFLICT (id) DO NOTHING;

-- 重置序列（确保新数据 ID 不与现有冲突）
SELECT setval('sys_user_id_seq', GREATEST((SELECT MAX(id) FROM sys_user), 102));
SELECT setval('company_id_seq', GREATEST((SELECT MAX(id) FROM company), 100));
SELECT setval('resume_id_seq', GREATEST((SELECT MAX(id) FROM resume), 100));
SELECT setval('job_id_seq', GREATEST((SELECT MAX(id) FROM job), 100));
SELECT setval('skill_tag_id_seq', (SELECT MAX(id) FROM skill_tag));

-- =============================================
-- 1. 测试账号
-- =============================================
-- BCrypt加密后的密码: password123
-- 原文: password123，生成时间: 2026-04-16
-- 管理员账号
INSERT INTO sys_user (id, username, password, user_type, company_id, status, create_time, update_time, deleted) VALUES
(1, 'admin@graphhire.com', '$2a$10$w5zZsRUx.D7UTyoDrsXaxuTSShu5y7uFU8cNtD/sb3qzJ1OfPRzvC', 3, NULL, 1, '2026-04-15 10:00:00', '2026-04-15 10:00:00', 0)
ON CONFLICT (username) DO NOTHING;

-- 企业用户（2个公司）
INSERT INTO sys_user (id, username, password, user_type, company_id, status, create_time, update_time, deleted) VALUES
(2, 'hr@techchina.com', '$2a$10$w5zZsRUx.D7UTyoDrsXaxuTSShu5y7uFU8cNtD/sb3qzJ1OfPRzvC', 2, 1, 1, '2026-04-15 11:00:00', '2026-04-15 11:00:00', 0),
(3, 'hr@airecruit.com', '$2a$10$w5zZsRUx.D7UTyoDrsXaxuTSShu5y7uFU8cNtD/sb3qzJ1OfPRzvC', 2, 2, 1, '2026-04-15 11:30:00', '2026-04-15 11:30:00', 0)
ON CONFLICT (username) DO NOTHING;

-- 个人用户（5个候选人）
INSERT INTO sys_user (id, username, password, user_type, company_id, status, create_time, update_time, deleted) VALUES
(4, '13800138001@phone.com', '$2a$10$w5zZsRUx.D7UTyoDrsXaxuTSShu5y7uFU8cNtD/sb3qzJ1OfPRzvC', 1, NULL, 1, '2026-04-15 12:00:00', '2026-04-15 12:00:00', 0),
(5, '13800138002@phone.com', '$2a$10$w5zZsRUx.D7UTyoDrsXaxuTSShu5y7uFU8cNtD/sb3qzJ1OfPRzvC', 1, NULL, 1, '2026-04-15 12:30:00', '2026-04-15 12:30:00', 0),
(6, '13800138003@phone.com', '$2a$10$w5zZsRUx.D7UTyoDrsXaxuTSShu5y7uFU8cNtD/sb3qzJ1OfPRzvC', 1, NULL, 1, '2026-04-15 13:00:00', '2026-04-15 13:00:00', 0),
(7, '13800138004@phone.com', '$2a$10$w5zZsRUx.D7UTyoDrsXaxuTSShu5y7uFU8cNtD/sb3qzJ1OfPRzvC', 1, NULL, 1, '2026-04-15 13:30:00', '2026-04-15 13:30:00', 0),
(8, '13800138005@phone.com', '$2a$10$w5zZsRUx.D7UTyoDrsXaxuTSShu5y7uFU8cNtD/sb3qzJ1OfPRzvC', 1, NULL, 1, '2026-04-15 14:00:00', '2026-04-15 14:00:00', 0)
ON CONFLICT (username) DO NOTHING;

-- =============================================
-- 2. 技能标签初始数据
-- =============================================
INSERT INTO skill_tag (name, synonyms) VALUES
-- 技术技能 - 编程语言
('Java', '["JDK", "Java SE"]'),
('Python', '["Python3", "Python 3"]'),
('JavaScript', '["JS", "ECMAScript"]'),
('TypeScript', '["TS"]'),
('Go', '["Golang"]'),
('Rust', '["Rust语言"]'),
('C++', '["Cpp", "C Plus Plus"]'),
('C#', '["CSharp", "DotNet"]'),
('PHP', '["PHP7", "PHP8"]'),
('Ruby', '["Ruby on Rails"]'),
('Swift', '["Swift语言"]'),
('Kotlin', '["Kotlin语言"]'),
('Scala', '["Scala语言"]'),

-- 技术技能 - 前端框架
('React', '["ReactJS", "React.js"]'),
('Vue', '["Vue.js", "Vue2", "Vue3"]'),
('Angular', '["AngularJS", "Angular2+"]'),
('Next.js', '["NextJS"]'),
('Node.js', '["NodeJS", "Node"]'),

-- 技术技能 - 后端框架
('Spring Boot', '["Spring", "SpringBoot", "Spring框架"]'),
('Spring Cloud', '["SpringCloud"]'),
('MyBatis', '["MyBatis-Plus"]'),
('Django', '["Django框架"]'),
('Flask', '["Flask框架"]'),
('Express', '["Express.js"]'),
('FastAPI', '["FastAPI框架"]'),
('Gin', '["Gin框架"]'),

-- 技术技能 - 数据库
('MySQL', '["MySQL数据库"]'),
('PostgreSQL', '["PostgreSQL数据库"]'),
('Redis', '["Redis缓存"]'),
('MongoDB', '["MongoDB数据库"]'),
('Elasticsearch', '["ES", "ElasticSearch"]'),
('Neo4j', '["图数据库", "Neo4j数据库"]'),
('HBase', '["HBase数据库"]'),

-- 技术技能 - 大数据与AI
('Hadoop', '["Hadoop生态"]'),
('Spark', '["Spark计算"]'),
('Flink', '["Flink流处理"]'),
('Kafka', '["Kafka消息队列"]'),
('TensorFlow', '["TF", "TensorFlow框架"]'),
('PyTorch', '["PyTorch框架"]'),
('LLM', '["大语言模型", "LLM应用"]'),
('LangChain', '["LangChain框架"]'),

-- 技术技能 - DevOps与云
('Docker', '["Docker容器"]'),
('Kubernetes', '["K8s", "K8"]'),
('AWS', '["亚马逊云", "AWS云服务"]'),
('Azure', '["微软云", "Azure云服务"]'),
('GCP', '["Google Cloud", "谷歌云"]'),
('Jenkins', '["CI/CD", "Jenkins持续集成"]'),
('GitLab CI', '["GitLab流水线"]'),
('Terraform', '["IaC", "基础设施即代码"]'),

-- 技术技能 - 其他
('Git', '["Git版本控制"]'),
('Linux', '["Linux系统", "Shell"]'),
('Nginx', '["Nginx代理", "Web服务器"]'),
('GraphQL', '["GraphQL API"]'),
('RESTful API', '["REST API", "REST接口"]'),
('RabbitMQ', '["RabbitMQ消息队列"]'),

-- 软技能
('项目管理', '["项目统筹", "项目协调"]'),
('团队协作', '["跨团队协作", "团队合作"]'),
('沟通能力', '["表达能力", "商务沟通"]'),
('问题解决', '["故障排查", "问题分析"]'),
('学习能力', '["快速学习", "持续学习"]'),
('领导力', '["团队管理", "技术领导"]'),
('产品思维', '["产品意识", "用户导向"]'),
('数据分析', '["数据驱动", "数据分析能力"]'),
('架构设计', '["系统设计", "架构能力"]'),
('需求分析', '["需求梳理", "BRD分析"]')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 3. 个人信息
-- =============================================
INSERT INTO person_info (user_id, real_name, gender, age, education, city, target_city, phone, email, create_time, update_time, deleted) VALUES
(4, '张三', 1, 28, '本科', '北京', '北京', '13800138001', 'zhangsan@example.com', '2026-04-15 12:00:00', '2026-04-15 12:00:00', 0),
(5, '李四', 2, 26, '硕士', '上海', '上海', '13800138002', 'lisi@example.com', '2026-04-15 12:30:00', '2026-04-15 12:30:00', 0),
(6, '王五', 1, 30, '本科', '深圳', '深圳', '13800138003', 'wangwu@example.com', '2026-04-15 13:00:00', '2026-04-15 13:00:00', 0),
(7, '赵六', 1, 25, '大专', '杭州', '杭州', '13800138004', 'zhaoliu@example.com', '2026-04-15 13:30:00', '2026-04-15 13:30:00', 0),
(8, '孙七', 2, 29, '本科', '广州', '北京', '13800138005', 'sunqi@example.com', '2026-04-15 14:00:00', '2026-04-15 14:00:00', 0)
ON CONFLICT (user_id) DO NOTHING;


-- =============================================
-- 4. 企业信息
-- =============================================
INSERT INTO company (id, user_id, name, code, license_path, auth_status, industry_id, scale, address, contact, phone, create_time, update_time, deleted) VALUES
(1, 2, '图智科技有限公司', '91110108MA01XXXX01', '/files/company/license_1.pdf', 1, (SELECT id FROM industry WHERE name = '互联网/人工智能' LIMIT 1), '3', '北京市海淀区中关村大街1号', '张HR', '13800001111', '2026-04-15 11:00:00', '2026-04-15 11:00:00', 0),
(2, 3, '智能招聘解决方案有限公司', '91110108MA01YYYY02', '/files/company/license_2.pdf', 1, (SELECT id FROM industry WHERE name = '人力资源服务' LIMIT 1), '5', '北京市朝阳区建国路88号', '李HR', '13800002222', '2026-04-15 11:30:00', '2026-04-15 11:30:00', 0)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- 5. 企业员工关联
-- =============================================
INSERT INTO company_staff (user_id, company_id, post, status, create_time, update_time) VALUES
(2, 1, 'OWNER', 'ACTIVE', '2026-04-15 11:00:00', '2026-04-15 11:00:00'),
(3, 2, 'OWNER', 'ACTIVE', '2026-04-15 11:30:00', '2026-04-15 11:30:00')
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- 6. 简历数据
-- =============================================
INSERT INTO resume (id, user_id, file_name, file_path, file_type, file_size, parse_status, parse_result, is_default, create_time, update_time, deleted) VALUES
-- 张三的简历 - Java后端开发
(1, 4, '张三_后端开发.pdf', '/files/resume/resume_1.pdf', 'pdf', 1048576, 2,
 '{"name":"张三","skills":["Java","Spring Boot","MySQL","Redis","Docker"],"experience":"3年","education":"本科","expected_salary":30000,"work_history":[{"company":"ABC科技","position":"Java开发","duration":"2021-至今"},{"company":"DEF软件","position":"初级Java","duration":"2019-2021"}]}',
 1, '2026-04-15 12:00:00', '2026-04-15 12:00:00', 0),

-- 李四的简历 - Python数据工程师
(2, 5, '李四_数据工程师.pdf', '/files/resume/resume_2.pdf', 'pdf', 983040, 2,
 '{"name":"李四","skills":["Python","Spark","Kafka","Hadoop","MySQL"],"experience":"2年","education":"硕士","expected_salary":35000,"work_history":[{"company":"数据智能公司","position":"数据工程师","duration":"2022-至今"}]}',
 1, '2026-04-15 12:30:00', '2026-04-15 12:30:00', 0),

-- 王五的简历 - 前端开发
(3, 6, '王五_前端开发.pdf', '/files/resume/resume_3.pdf', 'pdf', 1126400, 2,
 '{"name":"王五","skills":["React","Vue","TypeScript","Node.js","Git"],"experience":"5年","education":"本科","expected_salary":40000,"work_history":[{"company":"互联网金融公司","position":"前端Leader","duration":"2020-至今"},{"company":"电商平台","position":"前端开发","duration":"2017-2020"}]}',
 1, '2026-04-15 13:00:00', '2026-04-15 13:00:00', 0),

-- 赵六的简历 - 运维工程师
(4, 7, '赵六_运维工程师.pdf', '/files/resume/resume_4.pdf', 'pdf', 925696, 2,
 '{"name":"赵六","skills":["Linux","Docker","Kubernetes","Jenkins","Shell"],"experience":"2年","education":"大专","expected_salary":20000,"work_history":[{"company":"云服务公司","position":"运维工程师","duration":"2022-至今"}]}',
 1, '2026-04-15 13:30:00', '2026-04-15 13:30:00', 0),

-- 孙七的简历 - AI工程师
(5, 8, '孙七_AI工程师.pdf', '/files/resume/resume_5.pdf', 'pdf', 1179648, 2,
 '{"name":"孙七","skills":["Python","PyTorch","TensorFlow","LLM","LangChain","Kafka"],"experience":"3年","education":"本科","expected_salary":45000,"work_history":[{"company":"AI Lab","position":"AI工程师","duration":"2021-至今"}]}',
 1, '2026-04-15 14:00:00', '2026-04-15 14:00:00', 0)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 8. 职位数据
-- =============================================
INSERT INTO job (id, company_id, title, description, skills, city, salary_min, salary_max, salary_unit, experience, education, job_type, status, create_time, update_time, deleted) VALUES
-- 图智科技公司职位
(1, 1, '高级Java后端开发工程师', '负责核心业务系统设计与开发，优化系统性能与稳定性，指导初级工程师',
 ARRAY['Java','Spring Boot','MySQL','Redis','Docker','Kubernetes']::text[],
 '北京', 30000, 50000, '月', '3-5年', '本科', 1, 1, '2026-04-15 14:00:00', '2026-04-15 14:00:00', 0),

(2, 1, 'Python数据工程师', '构建实时数据管道，数据平台开发与维护，保障数据质量',
 ARRAY['Python','Spark','Kafka','Hadoop','Flink','MySQL']::text[],
 '北京', 35000, 55000, '月', '3-5年', '本科', 1, 1, '2026-04-15 14:30:00', '2026-04-15 14:30:00', 0),

(3, 1, '前端开发工程师', '前端页面开发与优化，前端架构设计与维护，配合产品实现交互需求',
 ARRAY['React','Vue','TypeScript','Node.js','Git']::text[],
 '北京', 25000, 40000, '月', '1-3年', '本科', 1, 1, '2026-04-15 15:00:00', '2026-04-15 15:00:00', 0),

-- 智能招聘公司职位
(4, 2, 'AI算法工程师', '负责人岗匹配算法研发、知识图谱构建与应用、AI能力集成与优化',
 ARRAY['Python','PyTorch','TensorFlow','LLM','LangChain','Kafka']::text[],
 '北京', 40000, 70000, '月', '3-5年', '硕士', 1, 1, '2026-04-15 15:30:00', '2026-04-15 15:30:00', 0),

(5, 2, 'DevOps工程师', '建设CI/CD流水线，维护容器化平台，搭建监控与告警体系',
 ARRAY['Linux','Docker','Kubernetes','Jenkins','GitLab CI','AWS']::text[],
 '北京', 25000, 45000, '月', '1-3年', '本科', 1, 1, '2026-04-15 16:00:00', '2026-04-15 16:00:00', 0)
ON CONFLICT (id) DO NOTHING;

UPDATE job SET owner_user_id = 101 WHERE company_id = 100 AND owner_user_id IS NULL;
UPDATE job SET owner_user_id = 2 WHERE company_id = 1 AND owner_user_id IS NULL;
UPDATE job SET owner_user_id = 3 WHERE company_id = 2 AND owner_user_id IS NULL;

-- =============================================
-- 10. 匹配记录（部分人岗匹配结果）
-- =============================================
INSERT INTO match_record (resume_id, job_id, match_direction, match_score, skill_score, exp_score, city_score, edu_score, salary_score, match_detail, viewed, create_time, update_time)
VALUES
-- 张三 -> Java后端岗位
(1, 1, 1, 92.50, 95.00, 90.00, 100.00, 85.00, 88.00,
 '{"summary":"匹配度较高，技能与职位要求高度吻合，具备3年相关经验","strengths":["Spring Boot实战经验丰富","熟悉微服务架构","有Redis缓存优化经验"],"weaknesses":["缺少Kubernetes生产环境经验"],"suggestion":"建议补充容器化部署经验，可从K8s学习开始"]',
 1, '2026-04-15 16:00:00', '2026-04-15 16:00:00'),

-- 李四 -> Python数据岗位
(2, 2, 1, 88.30, 92.00, 80.00, 100.00, 95.00, 82.00,
 '{"summary":"技能匹配度高，学历背景优秀，具备实时数据处理能力","strengths":["Spark大数据处理经验","熟悉Kafka消息队列","硕士学历背景强"],"weaknesses":["Hadoop生态经验偏少","Flink使用经验不足"],"suggestion":"可加强大数据平台相关学习"]',
 0, '2026-04-15 16:30:00', '2026-04-15 16:30:00'),

-- 王五 -> 前端岗位
(3, 3, 1, 95.80, 98.00, 95.00, 100.00, 85.00, 100.00,
 '{"summary":"高度匹配，5年前端经验+技术Leader背景","strengths":["React/Vue双框架精通","有前端架构设计经验","薪资预期与岗位预算匹配"],"weaknesses":["无明显弱点"],"suggestion":"可直接进入面试环节"]',
 1, '2026-04-15 17:00:00', '2026-04-15 17:00:00'),

-- 孙七 -> AI算法岗位
(5, 4, 1, 91.20, 96.00, 90.00, 100.00, 85.00, 90.00,
 '{"summary":"技能高度匹配，AI领域实战经验深厚","strengths":["LLM应用开发经验","LangChain框架使用","PyTorch/TensorFlow双框架"],"weaknesses":["学历为本科，职位要求硕士","薪资预期偏高"],"suggestion":"如能接受薪资调整，强烈推荐面试"]',
 0, '2026-04-15 17:30:00', '2026-04-15 17:30:00'),

-- 赵六 -> DevOps岗位
(4, 5, 1, 85.60, 90.00, 75.00, 100.00, 70.00, 100.00,
 '{"summary":"基础技能匹配，有一定运维经验","strengths":["Docker/Kubernetes熟练","Linux系统管理经验","Jenkins CI/CD经验"],"weaknesses":["学历为大专，职位要求本科","AWS云服务经验不足"],"suggestion":"可作为备选候选人考虑"]',
 0, '2026-04-15 18:00:00', '2026-04-15 18:00:00')
ON CONFLICT DO NOTHING;

-- =============================================
-- 11. 消息通知
-- =============================================
INSERT INTO notification (user_id, type, title, content, related_id, is_read, create_time, update_time) VALUES
-- 简历解析完成通知
(4, 1, '简历解析完成', '您的简历已成功解析，提取到5个技能标签', 1, 1, '2026-04-15 12:05:00', '2026-04-15 12:05:00'),
(5, 1, '简历解析完成', '您的简历已成功解析，提取到5个技能标签', 2, 1, '2026-04-15 12:35:00', '2026-04-15 12:35:00'),
(6, 1, '简历解析完成', '您的简历已成功解析，提取到5个技能标签', 3, 1, '2026-04-15 13:05:00', '2026-04-15 13:05:00'),
(7, 1, '简历解析完成', '您的简历已成功解析，提取到5个技能标签', 4, 1, '2026-04-15 13:35:00', '2026-04-15 13:35:00'),
(8, 1, '简历解析完成', '您的简历已成功解析，提取到5个技能标签', 5, 1, '2026-04-15 14:05:00', '2026-04-15 14:05:00'),

-- 职位推荐通知
(4, 2, '新职位推荐', '您可能对"高级Java后端开发工程师"职位感兴趣，综合匹配度92.5%', 1, 0, '2026-04-15 16:00:00', '2026-04-15 16:00:00'),
(5, 2, '新职位推荐', '您可能对"Python数据工程师"职位感兴趣，综合匹配度88.3%', 2, 0, '2026-04-15 16:30:00', '2026-04-15 16:30:00'),
(6, 2, '新职位推荐', '您可能对"前端开发工程师"职位感兴趣，综合匹配度95.8%', 3, 0, '2026-04-15 17:00:00', '2026-04-15 17:00:00'),
(8, 2, '新职位推荐', '您可能对"AI算法工程师"职位感兴趣，综合匹配度91.2%', 4, 0, '2026-04-15 17:30:00', '2026-04-15 17:30:00'),
(7, 2, '新职位推荐', '您可能对"DevOps工程师"职位感兴趣，综合匹配度85.6%', 5, 0, '2026-04-15 18:00:00', '2026-04-15 18:00:00'),

-- 候选人推荐通知（企业端）
(2, 3, '收到候选人推荐', '您发布的"高级Java后端开发工程师"收到新候选人推荐：张三（匹配度92.5%）', 1, 0, '2026-04-15 16:05:00', '2026-04-15 16:05:00'),
(3, 3, '收到候选人推荐', '您发布的"AI算法工程师"收到新候选人推荐：孙七（匹配度91.2%）', 4, 0, '2026-04-15 17:35:00', '2026-04-15 17:35:00')
ON CONFLICT DO NOTHING;

-- =============================================
-- 12. 聊天会话与消息示例数据
-- =============================================
INSERT INTO chat_conversation (id, job_id, company_id, recruiter_user_id, candidate_user_id, status, last_message_id, recruiter_last_read_msg_id, candidate_last_read_msg_id, create_time, update_time, deleted) VALUES
(1, 1, 1, 2, 4, 1, 2, 2, 2, '2026-04-15 19:00:00', '2026-04-15 19:06:00', 0),
(2, 2, 1, 2, 5, 1, 4, 4, 3, '2026-04-15 19:10:00', '2026-04-15 19:20:00', 0)
ON CONFLICT (job_id, candidate_user_id) DO NOTHING;

INSERT INTO chat_message (id, conversation_id, sender_user_id, receiver_user_id, message_type, content, ext, recalled, create_time, update_time, deleted) VALUES
(1, 1, 4, 2, 1, '你好，我对这个岗位很感兴趣😀', NULL, 0, '2026-04-15 19:01:00', '2026-04-15 19:01:00', 0),
(2, 1, 2, 4, 1, '收到，我们可以先聊下项目经历。', NULL, 0, '2026-04-15 19:06:00', '2026-04-15 19:06:00', 0),
(3, 2, 5, 2, 3, '发送了一份简历', '{\"resumeId\":2,\"fileName\":\"李四_数据工程师.pdf\",\"filePath\":\"/files/resume/resume_2.pdf\"}', 0, '2026-04-15 19:12:00', '2026-04-15 19:12:00', 0),
(4, 2, 2, 5, 4, '发送了一条面试通知', '{\"interviewTime\":\"2026-04-20T14:00:00\",\"location\":\"线上腾讯会议\",\"remark\":\"请提前10分钟进入会议\"}', 0, '2026-04-15 19:20:00', '2026-04-15 19:20:00', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO chat_message_resume (id, message_id, resume_id, resume_owner_user_id, snapshot_file_name, snapshot_file_path, create_time, update_time, deleted) VALUES
(1, 3, 2, 5, '李四_数据工程师.pdf', '/files/resume/resume_2.pdf', '2026-04-15 19:12:00', '2026-04-15 19:12:00', 0)
ON CONFLICT (message_id) DO NOTHING;

INSERT INTO chat_message_interview_invite (id, message_id, job_id, inviter_user_id, candidate_user_id, interview_time, location, remark, create_time, update_time, deleted) VALUES
(1, 4, 2, 2, 5, '2026-04-20 14:00:00', '线上腾讯会议', '请提前10分钟进入会议', '2026-04-15 19:20:00', '2026-04-15 19:20:00', 0)
ON CONFLICT (message_id) DO NOTHING;

-- =============================================
-- 重置序列（确保后续插入ID连续）
-- =============================================
SELECT setval('sys_user_id_seq', (SELECT MAX(id) FROM sys_user));
SELECT setval('company_id_seq', (SELECT MAX(id) FROM company));
SELECT setval('resume_id_seq', (SELECT MAX(id) FROM resume));
SELECT setval('job_id_seq', (SELECT MAX(id) FROM job));
SELECT setval('skill_tag_id_seq', (SELECT MAX(id) FROM skill_tag));
SELECT setval('chat_conversation_id_seq', COALESCE((SELECT MAX(id) FROM chat_conversation), 1), true);
SELECT setval('chat_message_id_seq', COALESCE((SELECT MAX(id) FROM chat_message), 1), true);
SELECT setval('chat_message_resume_id_seq', COALESCE((SELECT MAX(id) FROM chat_message_resume), 1), true);
SELECT setval('chat_message_interview_invite_id_seq', COALESCE((SELECT MAX(id) FROM chat_message_interview_invite), 1), true);





