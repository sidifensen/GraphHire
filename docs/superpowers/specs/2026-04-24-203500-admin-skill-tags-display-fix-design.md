# Skill Tags Display Fix Design

## 背景
管理员标签管理页出现“同义词、创建时间、更新时间”全部缺失（显示为“无 / -”）的问题，影响后台数据可读性与标签维护效率。

## 问题假设
前端仅按单一字段结构渲染（`synonyms: string[]`, `createdAt`, `updatedAt`）。当后端返回兼容形态（如 `createTime/updateTime`、JSON 字符串同义词）时，页面未做归一化，导致渲染缺失。

## 方案
1. 在 `admin/skill-tags` 页面加载数据时新增归一化函数：
   - 同义词兼容 `string[] | string | null`（字符串支持 JSON 数组与逗号分隔）
   - 时间兼容 `createdAt | createTime | create_time` 与 `updatedAt | updateTime | update_time`
2. 新增失败测试覆盖兼容形态，确保修复可回归。
3. 不调整后端接口契约，先在前端容错兜底，降低回归风险。

## 风险与边界
- 只改展示层转换，不改写入逻辑。
- 对合法 `createdAt/updatedAt` 结构保持原行为。

## 验证
- 前端单测通过（新增兼容场景）
- 前端构建通过
- CDP 打开 `/admin/skill-tags` 验证列表展示
