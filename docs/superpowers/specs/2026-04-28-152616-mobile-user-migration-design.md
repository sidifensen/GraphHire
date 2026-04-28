# 设计规格：移动端用户页面整体迁移到 `app/mobile-user`

**日期：** 2026-04-28
**状态：** 已批准（自动推进）
**范围：** `frontend/src/app/mobile-user/**`、`frontend/src/mobile-user-page/**`、相关测试

---

## 背景

当前 `frontend/src/app/mobile-user/**` 只是 Next App Router 的薄路由壳，真实页面实现、共享组件、样式和导航适配仍分散在 `frontend/src/mobile-user-page/**`。该目录同时保留了旧独立入口 `main.tsx` 与空的 `App.tsx`，已经不再符合当前 Next 前端结构。

这会带来三个持续性问题：
- 路由入口和真实实现分离，目录语义不清晰。
- 遗留独立入口和死代码继续存在，后续更难清理。
- 迁移后仍保留跨目录耦合，后续每次修改移动端都需要在两个目录之间来回跳转。

## 目标

- 将 `frontend/src/mobile-user-page/**` 的当前在用实现整体迁入 `frontend/src/app/mobile-user/**`。
- 删除旧目录下不再参与构建的独立入口和遗留代码。
- 保持移动端公开路由映射和页面行为不变。
- 为这次结构迁移补齐可以自动验证的测试，避免只是“搬文件但无保护”。

## 非目标

- 不修改公开用户端 URL 语义。
- 不重写 `frontend/src/lib/device-routing.ts` 的映射规则。
- 不引入新的业务接口或页面交互。
- 不顺带做与本次迁移无关的 UI 重设计。

## 方案对比

### 方案 A：保持现状，只继续从 `app/mobile-user` 引用外部目录
- 优点：改动最小，短期风险最低。
- 缺点：保留双目录结构和遗留入口，问题不会消失。

### 方案 B：把所有页面都直接塞进各自路由目录
- 优点：完全消除外部引用。
- 缺点：共享组件、样式、mock 数据会被迫分散，后续维护成本高。

### 方案 C：整体迁入 `app/mobile-user`，保留私有共享目录
- 优点：满足“全部迁移”，同时保持共享实现集中管理。
- 缺点：需要一轮系统性移动和导入路径清理。

## 选定方案

采用方案 C。

具体来说：
- 路由入口继续放在 `frontend/src/app/mobile-user/**/page.tsx`，并直接承载页面实现，不再保留额外的 `_pages` 转发目录。
- 共享实现迁入 `frontend/src/app/mobile-user/_components`、`_hooks`、`_lib`、`_data` 等私有目录。
- 原 `pages/*` 的实现直接融入对应 `page.tsx`，但不再依赖 `frontend/src/mobile-user-page/**`。
- `styles.css` 迁入 `frontend/src/app/mobile-user/_styles/mobile-user.css` 并继续由 `layout.tsx` 统一引入。
- `main.tsx`、`App.tsx` 以及整个旧目录在迁移完成后删除。

## 目录设计

迁移后的目标结构：

```text
frontend/src/app/mobile-user/
  _components/
  _data/
  _hooks/
  _lib/
  _styles/
  applications/page.tsx
  companies/[id]/page.tsx
  companies/page.tsx
  graph/page.tsx
  jobs/[id]/page.tsx
  jobs/page.tsx
  login/page.tsx
  notifications/page.tsx
  personal-info/page.tsx
  profile/page.tsx
  register/page.tsx
  resume/page.tsx
  layout.tsx
  page.tsx
```

约束：
- 下划线私有目录只服务 `app/mobile-user` 内部，不对其他模块作为通用组件出口。
- 任何 `app/mobile-user/**` 文件都不应再 import `@/mobile-user-page/...` 或 `@/app/mobile-user/_pages/...`。
- 各路由 `page.tsx` 直接承载页面实现；共享逻辑只保留在同域私有目录中。

## 导航与路径设计

- `frontend/src/lib/device-routing.ts` 保持现有映射规则不变。
- `MobileShell` 和底部导航的路径判断逻辑继续基于“内部路径还原后的公开路径”工作。
- 若迁移中发现某个页面依赖了旧路由适配层，适配代码迁入 `app/mobile-user/_lib/router.tsx`，保持接口兼容，避免在本次重构中扩散行为变化。

## 测试设计

本次迁移是结构性重构，测试需要同时覆盖“结构目标”和“核心行为未变”。

### 自动化测试
- 新增一个结构测试，扫描 `frontend/src/app/mobile-user/**`，断言不再存在 `mobile-user-page` 或 `_pages` 导入。
- 新增一个结构测试，断言 `frontend/src/mobile-user-page` 与 `frontend/src/app/mobile-user/_pages` 目录在迁移完成后都已删除。
- 补一个移动端壳测试，验证在首页展示底部导航、在登录页隐藏底部导航。
- 保留并运行现有 `frontend/src/tests/lib/device-routing.test.ts`，确认映射规则未回归。

### 构建与集成验证
- 运行前端 `npm run build`
- 运行前端 `npm run test:run`
- 运行后端 `mvn compile`
- 运行后端 `mvn test`
- 使用浏览器打开移动端相关页面，验证首页、职位页和登录页可用，且底部导航显示符合预期。

## 风险与缓解

### 风险 1：导入路径大规模调整导致编译失败
- 缓解：先用测试锁定结构目标，再批量迁移并运行构建。

### 风险 2：删除旧目录后还有隐藏引用
- 缓解：增加全文扫描测试并在删除前后分别运行。

### 风险 3：壳组件路径判断被迁移打断
- 缓解：补壳组件显示/隐藏测试，并复跑 `device-routing` 单测。

## 实施边界

- 本次只做目录迁移、导入修正、遗留入口删除和必要测试补齐。
- 若发现页面内部已有与迁移无关的业务缺陷，不在本次顺手修复，避免扩大变更面。
