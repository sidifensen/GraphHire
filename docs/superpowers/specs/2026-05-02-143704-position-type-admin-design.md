# 管理端 Position Type 管理页设计

**日期**: 2026-05-02  
**范围**: 管理端 `position_type` 三层分类（一级/二级/三级）完整管理能力  
**目标**: 新增“职位类型管理”页面，支持树形高可读展示 + 双视图切换，并提供新增、编辑、启停、同级排序能力

---

## 1. 背景与问题

当前系统已存在 `position_type` 表和大规模种子数据（多层嵌套），但管理端没有对应维护入口。  
若直接复用“行业管理”的平铺表格，无法处理：

1. 父子层级关系不可见  
2. 同级排序边界不清  
3. 大数据量下检索和定位成本过高

因此本次设计采用“双视图”：

1. 左侧树 + 右侧详情（默认）  
2. 树形表格（可切换）

---

## 2. 方案比较与决策

### 方案 A：后端返回完整树，前端双视图渲染（采用）
- 后端输出树形结构 DTO，前端两种视图复用同一数据源。
- 优点：语义清晰，前端状态单一，扩展稳定。
- 缺点：首屏数据量较大，但当前三层结构可接受。

### 方案 B：后端分页平铺列表，前端组树
- 分页会切断父子关系，不适合层级管理。

### 方案 C：按展开懒加载子节点
- 适合超大树，但接口与交互复杂度高；当前阶段非必要。

**决策**：采用方案 A。

---

## 3. 功能设计

### 3.1 页面入口与导航

1. 管理端侧边栏新增 `职位类型管理` 导航项，路径 `/admin/position-types`。  
2. 页面标题与风格保持“行业管理”一致，降低认知切换成本。

### 3.2 双视图

#### 视图 1（默认）：左树右详情
1. 左侧树支持展开/收起，仅展示名称、层级标记、状态点。  
2. 点击节点后右侧展示详情卡与操作区。  
3. 右侧操作：
   - 编辑名称
   - 启用/停用
   - 新增子类（三级节点不显示该按钮）
   - 同级上移/下移

#### 视图 2：树形表格
1. 扁平化展示当前树（保留缩进）。  
2. 每行展示：名称、层级、状态、排序、更新时间、操作。  
3. 支持展开收起一级/二级节点，适合批量浏览。

### 3.3 搜索与过滤

1. 顶部关键字搜索：匹配名称。  
2. 状态过滤：全部/启用/停用。  
3. 层级过滤：全部/一级/二级/三级。  
4. 命中搜索时保留祖先链，保证上下文可读。

### 3.4 新增与编辑规则

1. 三层都允许新增/编辑。  
2. 一级新增：`parentId = null`，`level = 1`。  
3. 二级新增：父节点必须为一级。  
4. 三级新增：父节点必须为二级。  
5. 禁止创建第四层。  
6. 同一父节点下名称不可重复（忽略首尾空格）。  
7. `code` 由服务端生成，前端只读展示（详情内可见）。

### 3.5 启停规则

1. 停用父节点时，级联停用全部后代。  
2. 启用子节点时，若祖先是停用状态，先自动启用祖先再启用当前节点（保证树状态一致）。  
3. 操作成功后刷新树。

### 3.6 排序规则

1. 仅在同级节点内移动。  
2. `UP`/`DOWN` 超边界时不报错，返回当前状态。  
3. 排序基于 `sortNo` 连续化（0..n-1）。

---

## 4. 后端设计

### 4.1 API 契约（`/admin` 下）

1. `GET /position-type/tree`
   - 查询参数：`keyword?`, `status?`, `level?`
   - 返回：树结构列表（顶层数组）
2. `POST /position-type`
   - body: `{ name, parentId?, status? }`
3. `PUT /position-type/{id}`
   - body: `{ name? }`
4. `PUT /position-type/{id}/status`
   - body: `{ status }`（0/1）
5. `PUT /position-type/{id}/move`
   - body: `{ direction }`（UP/DOWN）

### 4.2 领域与持久化

新增 `positiontype` 模块，结构对齐 `industry`：

1. `domain/model/PositionType`  
2. `domain/repository/PositionTypeRepository`  
3. `infrastructure/persistence/po/PositionTypePO`  
4. `infrastructure/persistence/mapper/PositionTypeMapper`  
5. `infrastructure/persistence/repository/PositionTypeRepositoryImpl`  
6. `application/service/PositionTypeAppService`

### 4.3 管理端应用服务

`AdminAppService` 新增 PositionType 相关方法，用于：
1. 参数校验与错误文案标准化  
2. DTO 转换  
3. 列表过滤（keyword/status/level）

### 4.4 返回 DTO

新增：
1. `AdminPositionTypeTreeItemResponse`
2. `AdminPositionTypeCreateRequest`
3. `AdminPositionTypeUpdateRequest`
4. `AdminPositionTypeStatusUpdateRequest`
5. `AdminPositionTypeMoveRequest`

---

## 5. 前端设计

### 5.1 API 层

`frontend/src/lib/api/admin.ts` 新增：
1. `getPositionTypeTree`  
2. `createPositionType`  
3. `updatePositionType`  
4. `updatePositionTypeStatus`  
5. `movePositionType`

并补充类型：
1. `AdminPositionTypeItem`（含 `children`）

### 5.2 页面与组件

1. 新页面：`frontend/src/app/admin/position-types/page.tsx`  
2. 在页面内完成双视图切换和弹窗表单（保持与行业管理一致视觉）。  
3. 使用现有 `AdminDataTable` 渲染树形表格视图，避免新增冗余通用组件。

### 5.3 状态管理

页面本地状态：
1. `treeData`、`loading`  
2. `keyword/status/level` 过滤条件  
3. `viewMode`（split/table）  
4. `expandedIds`（树展开）  
5. `selectedNode`（详情面板）  
6. `create/edit` 弹窗状态

---

## 6. 错误处理

1. 非法层级新增返回业务异常（“仅支持三级分类”）。  
2. 重名返回业务异常（“同级职位类型名称已存在”）。  
3. 节点不存在返回业务异常（“职位类型不存在”）。  
4. 前端捕获错误后用页面内提示展示（与当前管理页行为保持一致）。

---

## 7. 测试策略（TDD）

### 7.1 后端单测

1. `PositionTypeAppServiceTest`
   - 树构建正确性  
   - 新增层级约束  
   - 同级移动逻辑  
   - 级联启停规则
2. `AdminAppServiceTest`
   - 列表过滤与 DTO 映射
3. `AdminControllerTest`
   - 新接口参数透传与响应结构

### 7.2 前端测试（Vitest）

1. `admin-position-types-page.test.tsx`
   - 默认 split 视图渲染  
   - 视图切换（split/table）  
   - 搜索触发 API 参数变更  
   - 操作按钮触发 API（新增/启停/上移下移）

---

## 8. 非目标

1. 不做拖拽排序（本期保留上移下移）。  
2. 不做服务端分页（树管理以完整树加载为主）。  
3. 不改动用户端职位类型筛选逻辑。

---

## 9. 风险与缓解

1. **风险**：树数据量大导致首屏慢  
   **缓解**：默认仅展开一级；表格视图按需展开。
2. **风险**：级联启停误操作  
   **缓解**：停用父节点前弹确认文案提示“将同步停用子类”。
3. **风险**：排序与过滤同时使用造成认知混淆  
   **缓解**：排序操作仅在当前可见同级范围生效，操作后全量刷新。

---

## 10. 成功标准

1. 管理端可完整维护三层 `position_type`。  
2. 双视图可用且数据一致。  
3. 前后端测试通过，符合现有管理端风格与编码规范。
