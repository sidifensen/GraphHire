# 个人资料页默认职位下拉切换为 shadcn Select 设计

**日期**: 2026-05-07  
**范围**: 用户端 `/personal-info` 页面“默认职位”字段展示与交互（仅前端）

## 1. 目标

将个人资料页“默认职位”下拉从原生 `<select>` 替换为 shadcn/ui `Select`，并保持既有业务行为不变：

1. 选项来源仍是当前“期望职位”已选叶子项 + “未设置”。
2. 仍支持设置空值（未设置）。
3. 仍保持原禁用条件（加载中或未选择任何期望职位时禁用）。
4. 保存接口参数与字段语义不变（`defaultPositionTypeId`）。

## 2. 方案

1. 在 `personal-info/page.tsx` 引入 `@/components/ui/select` 组件族。
2. 仅替换“默认职位”对应控件，保留其余表单结构与状态管理。
3. 为兼容 shadcn `SelectItem` 不能使用空字符串值的限制，引入哨兵值：
   - UI层使用 `__unset_default_position__` 表示“未设置”
   - 写回状态时转换为 `''`
4. 保留 `aria-label="默认职位"`，确保可访问性和测试查询稳定。

## 3. 测试策略（TDD）

1. 先改 `user-personal-info-page.test.tsx`：
   - 断言默认职位控件为 `role=combobox` 且底层为 `BUTTON`（shadcn形态）。
   - 使用点击展开 + 点击 `role=option` 完成默认职位切换。
2. 运行目标测试观察失败（RED）。
3. 实现页面替换后重跑目标测试通过（GREEN）。
4. 执行改动面前端验证：`npm run build` + `npm run test:run`。

## 4. 风险与控制

1. **空值处理风险**：通过哨兵值与状态转换保证提交仍为 `'' -> null` 的既有后端语义。
2. **测试不兼容风险**：同步改造测试交互方式，避免继续依赖 `selectOptions`。
3. **样式漂移风险**：复用当前页面已有 Tailwind token，确保视觉与表单区一致。
