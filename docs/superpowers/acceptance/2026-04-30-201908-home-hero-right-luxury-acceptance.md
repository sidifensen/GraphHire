# Acceptance Criteria: 首页 Hero 右侧轻奢重设计

**Spec:** `docs/superpowers/specs/2026-04-30-201908-home-hero-right-luxury-design.md`
**Date:** 2026-04-30
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 首页 Hero 右侧桌面容器高度升级并保留主图 | UI interaction | 访问 `/`，桌面宽度 >= 1024 | 右侧模块存在，视觉高度明显高于旧版，主图完整展示 |
| AC-002 | 右侧存在玻璃态核心指标卡片 | UI interaction | 访问 `/`，桌面宽度 >= 1024 | 页面可见 `AI匹配指数` 文案及对应数值 |
| AC-003 | 右侧底部存在三列业务指标条 | UI interaction | 访问 `/`，桌面宽度 >= 1024 | 页面可见 `企业活跃席位`、`候选人响应率`、`7日成功匹配` 三项指标 |
| AC-004 | 页面测试覆盖右侧新结构关键文案 | Logic | 运行 `npm run test:run -- tests/pages/page.test.tsx` | 测试通过且断言包含右侧新增文案 |
| AC-005 | 双实现页面视觉结构一致 | Logic | 检查 `src/app/page.tsx` 与 `src/features/mock-user/pages/Home.tsx` | 两处 Hero 右侧结构与关键文案保持一致 |
