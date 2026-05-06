# 个人资料页默认职位 shadcn Select Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将个人资料页“默认职位”下拉替换为 shadcn Select，同时保持现有保存语义与禁用逻辑不变。

**Architecture:** 先改测试定义新交互（combobox + option 点击），再在页面内引入 shadcn Select 并使用哨兵值处理“未设置”，最后执行前端构建与全量测试回归。

**Tech Stack:** React 19, Next.js 16, shadcn/ui, Vitest, Testing Library

---

### Task 1: 测试先行（RED）

**Files:**
- Modify: `frontend/src/tests/pages/user-personal-info-page.test.tsx`

- [ ] **Step 1: 改写默认职位结构断言**

```tsx
const defaultPositionCombobox = screen.getByRole('combobox', { name: '默认职位' });
expect(defaultPositionCombobox.tagName).toBe('BUTTON');
expect(defaultPositionCombobox).toHaveTextContent('Java开发工程师');
```

- [ ] **Step 2: 改写默认职位交互断言**

```tsx
await user.click(screen.getByRole('combobox', { name: '默认职位' }));
await user.click(screen.getByRole('option', { name: 'Golang开发工程师' }));
```

- [ ] **Step 3: 运行目标测试确认失败**

Run:
```bash
npm run test:run -- src/tests/pages/user-personal-info-page.test.tsx
```
Expected: FAIL（当前实现仍为原生 select）。

### Task 2: 页面替换实现（GREEN）

**Files:**
- Modify: `frontend/src/app/(user)/personal-info/page.tsx`

- [ ] **Step 1: 引入 shadcn Select 并替换“默认职位”控件**

```tsx
import {
  Select as ShadcnSelect,
  SelectContent as ShadcnSelectContent,
  SelectItem as ShadcnSelectItem,
  SelectTrigger as ShadcnSelectTrigger,
  SelectValue as ShadcnSelectValue,
} from '@/components/ui/select';
```

- [ ] **Step 2: 用哨兵值处理“未设置”空值语义**

```tsx
const UNSET_DEFAULT_POSITION_VALUE = '__unset_default_position__';
value={formData.defaultPositionTypeId || UNSET_DEFAULT_POSITION_VALUE}
onValueChange={(value) => setField('defaultPositionTypeId', value === UNSET_DEFAULT_POSITION_VALUE ? '' : value)}
```

- [ ] **Step 3: 保持禁用逻辑与可访问标签**

```tsx
disabled={loading || formData.expectedPositionTypeIds.length === 0}
aria-label="默认职位"
```

- [ ] **Step 4: 运行目标测试确认通过**

Run:
```bash
npm run test:run -- src/tests/pages/user-personal-info-page.test.tsx
```
Expected: PASS。

### Task 3: 改动面验证与收尾

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 执行前端构建**

Run:
```bash
npm run build
```
Expected: PASS。

- [ ] **Step 2: 执行前端全量测试**

Run:
```bash
npm run test:run
```
Expected: PASS。

- [ ] **Step 3: 更新发布记录并提交**

在 `RELEASE-NOTES.md` 增补本次变更摘要，然后提交：

```bash
git add frontend/src/app/(user)/personal-info/page.tsx frontend/src/tests/pages/user-personal-info-page.test.tsx docs/superpowers/specs/2026-05-07-002929-personal-default-position-shadcn-select-design.md docs/superpowers/acceptance/2026-05-07-002929-personal-default-position-shadcn-select-acceptance.md docs/superpowers/plans/2026-05-07-002929-personal-default-position-shadcn-select.md RELEASE-NOTES.md
git commit -m "refactor: 默认职位下拉切换为 shadcn Select"
```
