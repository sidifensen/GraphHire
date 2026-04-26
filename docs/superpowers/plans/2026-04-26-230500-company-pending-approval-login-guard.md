# 招聘者加入已存在企业待审批登录拦截实现计划

## 背景
当前招聘者注册时，如果企业已存在，会创建 `company_staff` 记录为 `PENDING_JOIN`，但后端仍会自动登录并允许访问企业端页面，导致未审批账号可提前进入企业主页。

## 目标
1. 已存在企业场景下，注册后仅创建账号和待审批员工关系，不自动登录。
2. 登录时若企业员工状态不是 `ACTIVE`，禁止登录并返回明确提示。
3. 企业端接口增加统一企业员工状态校验，`PENDING_JOIN/REJECTED/DISABLED` 均不可操作。
4. 不新增数据表，复用现有 `user` 与 `company_staff` 结构。

## 方案
1. 复用 `company_staff.status` 作为企业成员准入状态。
2. 在注册公司逻辑中：
   - 新建公司（首位成员 OWNER）仍自动登录。
   - 已存在公司（成员 HR, PENDING_JOIN）不登录，抛出业务码并提示“已提交申请，等待企业负责人确认”。
3. 在登录逻辑中：对 `UserType.COMPANY` 追加员工状态检查：
   - `PENDING_JOIN` => 拒绝登录，提示审核中。
   - `REJECTED` => 拒绝登录，提示申请被拒绝。
   - `DISABLED` => 拒绝登录，提示账号已停用。
   - 其它非 ACTIVE 状态默认拒绝。
4. 在企业端控制器统一做 `currentStaffActive` 校验，未激活直接拒绝。

## TDD 拆解
1. AuthAppService 测试先补：
   - 已存在企业注册返回待审批提示且不触发登录。
   - 企业用户登录在 `PENDING_JOIN` 状态被拒绝。
2. CompanyController 测试先补：
   - `PENDING_JOIN` 员工访问企业接口抛出异常。
3. 实现最小代码使测试通过。
4. 回归执行后端测试。

## 验证
1. `backend` 模块 `mvn test`
2. 后续全量要求：`frontend npm run build`、`frontend npm run test:run`、`backend mvn compile`、浏览器CDP验证（本次先完成后端改造后继续执行）
