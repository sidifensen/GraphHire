# Acceptance Criteria: Controller 集成测试

**Spec:** `docs/superpowers/specs/2026-04-16-controller-integration-test-design.md`
**Date:** 2026-04-16
**Status:** Draft

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | BaseControllerTest 基类能够成功登录预置的三个测试账号并持有有效 token | Logic | 预置账号存在于数据库或可通过注册创建 | personToken、companyToken、adminToken 三个 static 字段均不为 null，且长度为正字符串 |
| AC-002 | MockMvc 请求能够自动附加 Sat-Token header | Logic | 已通过 BaseControllerTest 登录获取 token | 需认证的 Controller 接口返回 200 而非 401/403 |
| AC-003 | @Transactional 确保每个测试方法结束后数据回滚 | Logic | 测试中创建了公司/用户/简历等数据 | 测试前后数据库中相关表记录数一致 |
| AC-004 | AuthControllerTest 覆盖所有 10 个接口 | API | AuthController 接口正常部署 | mvn test 运行后 AuthControllerTest 全部通过 |
| AC-005 | AdminControllerTest 覆盖所有 14 个接口 | API | AdminController 接口正常部署，管理员账号可登录 | mvn test 运行后 AdminControllerTest 全部通过 |
| AC-006 | PersonControllerTest 覆盖所有 5 个接口 | API | PersonController 接口正常部署，personToken 可用 | mvn test 运行后 PersonControllerTest 全部通过 |
| AC-007 | ResumeControllerTest 覆盖所有 6 个接口 | API | ResumeController 接口正常部署，personToken 可用，已有 PersonInfo | mvn test 运行后 ResumeControllerTest 全部通过 |
| AC-008 | CompanyControllerTest 覆盖所有 18 个接口 | API | CompanyController 接口正常部署，companyToken 可用 | mvn test 运行后 CompanyControllerTest 全部通过 |
| AC-009 | MatchControllerTest 覆盖所有 4 个接口 | API | MatchController 接口正常部署，存在可用 Resume 和 Job | mvn test 运行后 MatchControllerTest 全部通过 |
| AC-010 | NotificationControllerTest 覆盖所有 9 个接口 | API | NotificationController 接口正常部署，登录用户存在 | mvn test 运行后 NotificationControllerTest 全部通过 |
| AC-011 | SkillTagControllerTest 覆盖所有 11 个接口 | API | SkillTagController 接口正常部署 | mvn test 运行后 SkillTagControllerTest 全部通过 |
| AC-012 | 文件上传接口 POST /resume/my/upload 能够成功上传测试文件 | API | classpath 下有测试文件 resume-test.txt | 返回 Result，code=200，data 中包含 resumeId |
| AC-013 | mvn test 能够一键运行所有 Controller 集成测试 | Logic | 项目编译无错误，测试文件全部就位 | 所有测试类执行完毕，控制台显示 BUILD SUCCESS |
| AC-014 | 测试用例覆盖常见异常场景（登录失败、越权访问、数据不存在） | API | 测试账号密码错误、访问不存在的资源 ID | 对应接口返回非 200 状态码或业务异常 code |
| AC-015 | 测试用例覆盖 CRUD 完整链路（创建→查询→更新→删除） | API | 关联模块数据层正常 | 每个资源从创建到删除的完整流程测试通过 |
| AC-016 | SkillTagController 测试无需任何前置账号或数据依赖 | Logic | SkillTag 表存在 | SkillTagControllerTest 可独立运行，不依赖其他测试的 token 或数据 |
| AC-017 | MatchController 的触发匹配接口依赖 Resume 和 Job 数据 | API | ResumeControllerTest 和 CompanyControllerTest 已创建了简历和职位 | POST /match/trigger 返回匹配记录 ID |
| AC-018 | 测试类中 userId 通过 StpUtil.getLoginIdAsLong() 动态获取 | Logic | 用户已登录且 token 有效 | NotificationController 测试中使用的 userId 与登录用户 ID 一致 |
