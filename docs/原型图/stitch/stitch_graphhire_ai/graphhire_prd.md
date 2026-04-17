# GraphHire 图谱智聘 - 完整原型设计规范 (PRD)

## 一、核心定位
AI 驱动的技能图谱招聘平台，包含用户端、企业端和管理端。

## 二、设计系统
- **主色**：#2563EB (蓝色)
- **辅色**：#10B981 (绿色)
- **警告**：#F59E0B (橙色)
- **危险**：#EF4444 (红色)
- **中性**：#6B7280 (灰色)
- **背景**：#F3F4F6 (浅灰)
- **卡片**：#FFFFFF (白色)

## 三、页面清单
### 用户端 (U01-U10)
- /home, /login, /register, /resume/upload, /resume/manage, /profile, /skill-graph, /jobs, /match/[id], /notifications

### 企业端 (C01-C10)
- /company/dashboard, /company/login, /company/register, /company/info, /company/job/publish, /company/jobs, /company/recommendations, /company/candidate/[id], /company/staff, /company/notifications

### 管理端 (A01-A06)
- /admin/login, /admin/dashboard, /admin/company/audit, /admin/users, /admin/skills, /admin/tasks

## 四、核心交互
- **能力图谱 [U07]**：可视化技能树，展示技能掌握程度。
- **匹配详情 [U09]**：五维雷达图对比候选人与职位。
- **推荐简历 [C07]**：AI 自动匹配简历卡片。