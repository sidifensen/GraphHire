# 个人资料页默认职位 shadcn Select 验收标准

**日期**: 2026-05-07  
**关联设计**: `docs/superpowers/specs/2026-05-07-002929-personal-default-position-shadcn-select-design.md`

## AC-1 控件替换

1. `/personal-info` 页“默认职位”控件由原生 `select` 改为 shadcn `Select`。
2. 测试中该控件可通过 `role=combobox` 查询，底层元素为 `BUTTON`。

## AC-2 交互保持一致

1. 展开下拉后可看到“未设置”和当前已选期望职位对应选项。
2. 选择其他职位后，保存接口提交的 `defaultPositionTypeId` 与选项一致。
3. 仍保持“加载中或无期望职位时禁用”规则。

## AC-3 改动面验证

1. 目标测试通过：`src/tests/pages/user-personal-info-page.test.tsx`。
2. 前端改动面验证通过：`npm run build`、`npm run test:run`。
