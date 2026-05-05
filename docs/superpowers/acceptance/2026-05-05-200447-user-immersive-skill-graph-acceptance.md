# 用户端沉浸式技能图谱验收标准

**日期**: 2026-05-05  
**关联设计**: `docs/superpowers/specs/2026-05-05-200447-user-immersive-skill-graph-design.md`

## AC-1 接口数据接入

1. 页面加载时并发调用：
   - `GET /person/graph`
   - `GET /person/ability-assessment`
2. 图谱节点数据仅来自 `/person/graph.skills`。
3. 中心姓名仅来自 `/person/graph.realName`（为空时回退 `求职者`）。
4. 能力数字仅来自 `/person/ability-assessment`（`totalScore`, `skillCount`, `level`）。

## AC-2 后端图谱返回结构

1. `GET /person/graph` 返回新增字段：
   - `realName`
   - `avatarUrl`
2. 保持兼容旧字段：`personId`, `skills`, `success`。
3. 当用户无 `PersonInfo` 记录时，`realName/avatarUrl` 为 `null`，接口仍成功返回图谱数据结构。

## AC-3 沉浸式图谱交互

1. `/skill-graph` 主体为单一图谱舞台，不再使用右侧统计卡片布局。
2. 图谱可平移、缩放、拖拽技能节点。
3. 中心节点固定展示用户（头像+姓名），外围节点为技能并存在关联连线。

## AC-4 能力概览展示方式

1. 能力概览位于图谱舞台右下角。
2. 展示形态为纯数字与文字，不使用卡片容器视觉。
3. 至少展示：综合分、等级文案、知识节点数。

## AC-5 左侧菜单要求

1. 左侧菜单继续显示且尺寸不缩小。
2. 菜单改为透明/半透明视觉，不影响可读性。
3. 菜单激活态（当前页）仍可识别。

## AC-6 回归与构建

1. 后端测试通过（含新增 `PersonControllerTest` 用例）。
2. 前端测试通过（含图谱页更新测试）。
3. 前后端构建与测试按项目规范通过：
   - `mvn compile`
   - `mvn test`
   - `npm run build`
   - `npm run test:run`
