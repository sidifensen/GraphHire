# 用户端沉浸式技能图谱重构设计

**日期**: 2026-05-05  
**范围**: 用户端 `/skill-graph` 页面 + 后端 `GET /person/graph` 返回结构  
**约束**: 保留左侧工作台菜单，不缩小；菜单视觉透明化；能力概览改为右下角纯数字文字（非卡片）。

## 1. 目标与结果

本次改造将“我的图谱”升级为沉浸式可拖拽图谱场景：

1. 页面主体以全屏图谱画布为中心，支持拖拽节点、缩放和平移。
2. 中心节点展示用户头像与真实姓名（姓名来源后端 `/person/graph` 新增字段，不使用邮箱）。
3. 外圈节点展示该用户技能，并与中心节点建立可视化关联线。
4. 能力概览使用右下角数字与文字叠加展示，不再使用右侧卡片。
5. 左侧菜单保留原尺寸和定位，仅将视觉改为透明/半透明风格，避免遮挡沉浸式背景。

## 2. 后端设计

### 2.1 接口契约变更

变更 `GET /person/graph` 的 `data` 结构（向后兼容新增字段）：

- 原字段保留：`personId`, `skills`, `success`
- 新增字段：
  - `realName: string | null`
  - `avatarUrl: string | null`（返回 `/person/avatar/public/{userId}` 或 null）

### 2.2 数据来源

- `realName` 和头像信息从 `PersonInfoRepository.findByUserId(userId)` 获取。
- 若 `realName` 为空，后端返回 `null`，前端使用回退文案 `求职者`。

### 2.3 兼容性

- 旧前端只读 `skills` 的逻辑不受影响。
- 新字段为可选读取，避免强依赖导致发布窗口期异常。

## 3. 前端设计

### 3.1 技术选型

采用 `react-force-graph-2d`：

- 原生支持节点拖拽：`enableNodeDrag` + `onNodeDragEnd`
- 支持缩放/平移：`enableZoomInteraction`、`enablePanInteraction`
- 支持图谱中心回正：`centerAt`、`zoomToFit`

### 3.2 页面结构

- 仍保留 `UserWorkbenchSidebar` 作为左侧入口。
- 右侧区域改为单一“全幅图谱舞台”，不再分左右卡片栅格。
- 能力概览绝对定位在舞台右下角，展示：
  - `totalScore`（综合分）
  - `skillCount`（知识节点数）
  - `level`（等级文案）

### 3.3 图数据映射

- 中心节点：`type='person'`，`id='person:{personId}'`
- 技能节点：`type='skill'`，每个技能一个节点
- 连线：`person -> skill`

并将节点半径、颜色、字体按类型区分：

- 人节点：更大、主品牌色、姓名文本
- 技能节点：较小、浅色高亮

### 3.4 交互行为

- 默认自动布局，首次加载后自动 `zoomToFit`。
- 拖拽技能节点后固定当前位置（设置 `fx/fy`），避免立即被力导向拉回。
- 双击空白或点击“归位”按钮时重置视角并恢复自动布局。

### 3.5 左侧菜单透明化

- 仅在 `/skill-graph` 路由下启用透明样式（避免影响其他“我的”页面）。
- 菜单容器改为无实底 + 轻量文字/高亮描边，激活项保持可识别对比度。

## 4. 测试设计（TDD）

### 4.1 后端测试

在 `PersonControllerTest` 新增用例：

1. `getPersonGraph` 返回 `realName` 与 `avatarUrl`。
2. `getPersonGraph` 当没有 `PersonInfo` 时，仍返回 `skills`，且 `realName/avatarUrl` 为 `null`。

### 4.2 前端测试

更新 `user-skill-graph-page.test.tsx`：

1. 校验页面渲染中心姓名（来自 `/person/graph.realName`）。
2. 校验能力概览为右下角文本块（无“能力概览卡片”结构依赖）。
3. 校验左侧菜单仍存在。

必要时为 `react-force-graph-2d` 做测试环境 mock（保证 JSDOM 下可测）。

## 5. 风险与缓解

1. **Canvas 图谱在测试环境不稳定**  
   通过 Vitest mock `react-force-graph-2d` 保持可测试性。

2. **姓名字段为空导致 UI 倒退为邮箱**  
   前端严格回退到固定文案 `求职者`，不读取邮箱字段。

3. **菜单透明后可读性下降**  
   增加文字阴影/描边与 hover 背景，确保对比度。

## 6. 验收标准摘要

1. 进入 `/skill-graph` 后可看到全屏沉浸式可拖拽图谱。
2. 中心节点显示真实姓名（非邮箱），外圈展示技能。
3. 右下角为纯数字文字能力概览，无右侧卡片。
4. 左侧菜单保留原尺寸并透明化。
5. 图谱与能力分仅使用 `/person/graph` 与 `/person/ability-assessment` 数据。
