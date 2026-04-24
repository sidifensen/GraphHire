# 企业端职位详情页设计说明

## 背景
企业端职位管理列表页当前仅提供“匹配候选人”和发布/暂停操作，缺少“查看职位详情”入口，企业用户无法直接查看某个职位的完整信息。

## 目标
在企业端职位管理列表每个职位项右侧增加“详情”按钮，点击进入独立详情页 `/enterprise/jobs/{id}`，用于查看该职位的完整信息。

## 范围
- 列表页新增详情按钮
- 新增企业端职位详情页面
- 新增企业端职位详情 API 封装与类型定义
- 增加前端单元测试覆盖列表入口与详情页状态

## 非目标
- 不改动职位创建与编辑流程
- 不改动职位发布/关闭逻辑
- 不新增后端接口（复用现有 `GET /company/job/{id}`）

## 方案
### 1. 路由与交互
- 在 `frontend/src/app/enterprise/jobs/page.tsx` 中为每条职位记录新增 `详情` 链接。
- 链接目标：`/enterprise/jobs/${job.id}`。

### 2. 详情页面
- 新增页面：`frontend/src/app/enterprise/jobs/[id]/page.tsx`。
- 页面加载时读取路由参数 `id`，调用 `companyApi.getJobDetail(id)`。
- 展示模块：
  - 职位标题、状态
  - 部门、城市、招聘人数、发布时间
  - 薪资区间
  - 技能标签（skills）
  - 职位描述
  - 指标信息（浏览量/投递数/高匹配）
- 操作入口：`查看匹配候选人`，跳转 `/enterprise/recommendations?jobId={id}`。

### 3. API 与类型
- `frontend/src/lib/api/company.ts` 增加：
  - `getJobDetail(jobId: number): Promise<EnterpriseJobDetail>`
- `frontend/src/lib/types/enterprise.ts` 增加：
  - `EnterpriseJobDetail`
  - `EnterpriseJobLocation`
  - `EnterpriseSalaryRange`
- 对空字段统一降级展示（例如“未填写”“薪资待定”）。

## 错误处理
- 非法 id：展示“无效的职位参数”。
- 请求失败：展示错误信息和“重试”按钮。
- 数据缺失：采用默认文案兜底，不中断页面渲染。

## 测试策略
- 列表页测试：断言详情按钮存在且 href 正确。
- 详情页测试：
  - 成功加载并渲染核心字段
  - 非法参数错误态
  - 接口失败错误态与重试

## 风险与回退
- 风险：后端返回结构与前端类型存在偏差。
- 缓解：详情页采用可选字段与兜底渲染。
- 回退：移除详情按钮与详情路由即可恢复原行为。
