# 企业端手机版原版对齐重写设计

## 背景
- 目标目录：`frontend/src/app/mobile-enterprise`
- 对照基准：`C:\Users\x\Downloads\graphhire企业端1 (1)`
- 当前问题：现有实现被改成“全宽适配版”，视觉结构与原版不一致。

## 目标
- 按原版页面结构与视觉样式重写企业端手机版页面。
- 保留当前 Next.js 路由架构与企业端鉴权壳（`EnterpriseAuthGuard`）。
- 补齐原版“候选人详情页”页面能力与入口。

## 设计决策
- 页面与布局直接对齐原版：恢复 `max-w-[375px]` 居中容器、原版间距类、顶部/底部导航行为。
- 保持现有 `mobile-enterprise/_lib/router` 适配层，不回退到 React Router。
- 对推荐页“详情”入口恢复可跳转实现，新增 `mobile-enterprise/candidate/[id]/page.tsx` 页面。
- 修正测试断言：从“全宽样式”改为“原版容器样式”。

## 影响范围
- `frontend/src/app/mobile-enterprise/_components/*`
- `frontend/src/app/mobile-enterprise/**/*.tsx`（含新增 candidate 路由）
- `frontend/src/tests/app/mobile-enterprise-*.test.*`

## 风险与控制
- 风险：路由适配导致候选人详情入口跳转路径异常。
- 控制：增加页面/结构测试，并在浏览器端通过 CDP 实测关键路径。
