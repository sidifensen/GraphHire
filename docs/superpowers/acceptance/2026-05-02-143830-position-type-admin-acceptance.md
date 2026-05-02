# Acceptance Criteria: 管理端 Position Type 管理

**Spec:** `docs/superpowers/specs/2026-05-02-143704-position-type-admin-design.md`  
**Date:** 2026-05-02  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 管理端侧边栏出现“职位类型管理”入口并可跳转到 `/admin/position-types` | UI interaction | 管理端已登录并进入任意管理页 | 侧边栏可见入口文本“职位类型管理”，点击后 URL 变为 `/admin/position-types` 且页面加载成功 |
| AC-002 | 页面默认以“左树右详情”视图渲染 | UI interaction | 打开 `/admin/position-types` | 默认显示树区域与详情区域，且“树形表格”未激活 |
| AC-003 | 页面支持切换为“树形表格”视图并可切回 | UI interaction | 打开 `/admin/position-types`，接口返回至少 1 条数据 | 点击“树形表格”后显示表格视图；再点击“树+详情”后恢复分栏视图 |
| AC-004 | `GET /admin/position-type/tree` 返回三层树结构 DTO（含 children） | API | 数据库存在多层 `position_type` 数据 | 返回 200；`data` 为数组；节点包含 `id,name,parentId,level,sortNo,status,children` 字段 |
| AC-005 | 搜索关键字时仅返回命中节点及其祖先链 | API | 至少存在一个三级节点名称匹配关键字 | 传 `keyword` 后返回结果包含命中节点，且包含其完整父链；不匹配分支不返回 |
| AC-006 | 按状态过滤时仅返回对应状态节点树 | API | 同级中同时存在启用与停用节点 | 传 `status=1` 时返回节点 `status` 全为 1；`status=0` 时全为 0 |
| AC-007 | 按层级过滤时仅返回指定层级节点并保留必要祖先信息 | API | 数据库存在 1/2/3 级节点 | 传 `level=3` 时仅三级节点作为可操作目标返回，且能识别其父级上下文 |
| AC-008 | 新增一级节点成功 | API | 调用 `POST /admin/position-type` 且 `parentId` 为空、`name` 合法 | 返回 200；新节点 `level=1`；可在后续树查询中看到该节点 |
| AC-009 | 新增二级节点成功 | API | 目标父节点为一级 | 返回 200；新节点 `level=2` 且 `parentId` 为目标一级节点 ID |
| AC-010 | 新增三级节点成功 | API | 目标父节点为二级 | 返回 200；新节点 `level=3` 且 `parentId` 为目标二级节点 ID |
| AC-011 | 禁止创建第四层节点 | API | 选择三级节点作为父节点调用新增 | 返回业务错误；错误信息明确表示仅支持三级分类 |
| AC-012 | 同一父节点下重名新增被拒绝 | API | 同一父节点已存在同名节点 | 返回业务错误；错误信息为“同级职位类型名称已存在” |
| AC-013 | 编辑节点名称成功 | API | 节点存在且新名称合法 | 调用 `PUT /admin/position-type/{id}` 后返回 200，查询树可见名称变更 |
| AC-014 | 停用父节点时级联停用全部后代 | Logic | 构造包含父子孙三层的启用树 | 对父节点执行停用后，父与所有子孙节点 `status=0` |
| AC-015 | 启用子节点时自动启用停用中的祖先 | Logic | 祖先停用、目标子节点待启用 | 对子节点执行启用后，祖先链节点与目标节点均为 `status=1` |
| AC-016 | 同级上移仅影响同级排序并保持连续 | Logic | 同一父节点下至少 3 个节点且 `sortNo` 有序 | 执行 `UP` 后目标节点与前一节点交换，且同级 `sortNo` 连续为 `0..n-1` |
| AC-017 | 同级下移仅影响同级排序并保持连续 | Logic | 同一父节点下至少 3 个节点且 `sortNo` 有序 | 执行 `DOWN` 后目标节点与后一节点交换，且同级 `sortNo` 连续为 `0..n-1` |
| AC-018 | 超边界移动不报错且顺序不变 | Logic | 节点已位于同级首位或末位 | 对首位执行 `UP` 或末位执行 `DOWN` 返回成功，排序保持不变 |
| AC-019 | 前端在详情区可触发启停、移动、编辑、新增子类动作并调用对应 API | UI interaction | 页面选中任意可操作节点 | 点击对应按钮后发起正确 API；成功后树和详情状态同步刷新 |
| AC-020 | 表格视图中每行展示名称、层级、状态、排序、更新时间、操作 | UI interaction | 切换到树形表格视图，接口返回数据 | 表格列完整展示上述字段；行内可执行上移/下移/启停/编辑 |
| AC-021 | 前端查询参数正确透传到 `getPositionTypeTree` | UI interaction | 在页面修改关键字/状态/层级筛选 | API 调用参数与筛选条件一致，且重置页内展开状态不导致报错 |
| AC-022 | 管理端相关单元测试与页面测试全部通过 | Logic | 完成代码实现 | 后端 `mvn test` 通过；前端 `npm run test:run` 通过；包含 Position Type 新增测试用例 |

