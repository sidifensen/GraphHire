# 企业端手机版接入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 复用现有企业端手机版原型，在不改变企业端公开地址和桌面样式的前提下，为手机访问接入隐藏内部移动路由。

**Architecture:** 沿用用户端 `mobile-user` 的方案，在前端增加 `mobile-enterprise` 内部路由目录、企业端路径映射和路由适配层，再通过中间件按设备把公开 `/enterprise/**` 地址 rewrite 到内部移动实现。页面 UI 直接从原型迁入，只做最小路由和运行时适配。

**Tech Stack:** Next.js App Router、TypeScript、Vitest、React 19、Tailwind CSS、framer-motion

---

### Task 1: 先写企业端移动路由失败测试

**Files:**
- Modify: `frontend/src/tests/lib/device-routing.test.ts`
- Create: `frontend/src/tests/app/mobile-enterprise-shell.test.tsx`

- [ ] **Step 1: Write the failing mapping tests**

```ts
expect(mapEnterprisePathToMobileInternalPath('/enterprise/dashboard')).toBe('/mobile-enterprise');
expect(mapEnterprisePathToMobileInternalPath('/enterprise/jobs/new')).toBe('/mobile-enterprise/jobs/create');
expect(mapMobilePathToEnterprisePath('/mobile-enterprise/team')).toBe('/enterprise/employees');
expect(shouldRewriteToMobile('/enterprise/jobs', mobileUa)).toBe(true);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/tests/lib/device-routing.test.ts src/tests/app/mobile-enterprise-shell.test.tsx`
Expected: FAIL with missing enterprise mapping exports or assertions failing

- [ ] **Step 3: Write shell visibility tests**

```ts
usePathnameMock.mockReturnValue('/mobile-enterprise');
expect(screen.getByText('工作台')).toBeInTheDocument();

usePathnameMock.mockReturnValue('/mobile-enterprise/jobs/create');
expect(screen.queryByText('工作台')).toBeNull();
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm run test:run -- src/tests/app/mobile-enterprise-shell.test.tsx`
Expected: FAIL because `MobileEnterpriseShell` does not exist yet

### Task 2: 实现企业端路径映射和中间件支持

**Files:**
- Modify: `frontend/src/lib/device-routing.ts`
- Modify: `frontend/middleware.ts`

- [ ] **Step 1: Add enterprise route mapping support**

```ts
const MOBILE_ENTERPRISE_INTERNAL_PREFIX = '/mobile-enterprise';
const ENTERPRISE_TO_MOBILE_ROUTE_MAPPINGS = [
  ['/enterprise/notifications', '/messages'],
  ['/enterprise/employees', '/team'],
  ['/enterprise/recommendations', '/recommendations'],
  ['/enterprise/jobs/new', '/jobs/create'],
  ['/enterprise/jobs', '/jobs'],
  ['/enterprise/dashboard', '/'],
] as const;
```

- [ ] **Step 2: Add enterprise map helpers**

```ts
export function isEnterprisePath(pathname: string): boolean
export function mapEnterprisePathToMobileInternalPath(pathname: string): string
export function mapMobilePathToEnterprisePath(pathname: string): string
```

- [ ] **Step 3: Update shared rewrite decision logic**

```ts
return (isUserPath(pathname) || isEnterprisePath(pathname))
  && (isMobileUserAgent(userAgent) || isMobileClientHint(secChUaMobile));
```

- [ ] **Step 4: Update middleware target selection**

```ts
const mappedPathname = isEnterprisePath(pathname)
  ? mapEnterprisePathToMobileInternalPath(pathname)
  : mapUserPathToMobileInternalPath(pathname);
```

- [ ] **Step 5: Run routing tests**

Run: `npm run test:run -- src/tests/lib/device-routing.test.ts`
Expected: PASS

### Task 3: 迁移企业端移动原型并接入适配层

**Files:**
- Create: `frontend/src/app/mobile-enterprise/layout.tsx`
- Create: `frontend/src/app/mobile-enterprise/page.tsx`
- Create: `frontend/src/app/mobile-enterprise/jobs/page.tsx`
- Create: `frontend/src/app/mobile-enterprise/jobs/create/page.tsx`
- Create: `frontend/src/app/mobile-enterprise/jobs/[id]/page.tsx`
- Create: `frontend/src/app/mobile-enterprise/jobs/[id]/edit/page.tsx`
- Create: `frontend/src/app/mobile-enterprise/recommendations/page.tsx`
- Create: `frontend/src/app/mobile-enterprise/team/page.tsx`
- Create: `frontend/src/app/mobile-enterprise/messages/page.tsx`
- Create: `frontend/src/app/mobile-enterprise/_components/**`
- Create: `frontend/src/app/mobile-enterprise/_lib/**`
- Create: `frontend/src/app/mobile-enterprise/_styles/mobile-enterprise.css`

- [ ] **Step 1: Port prototype code into mobile-enterprise**

```tsx
import MobileEnterpriseShell from './_components/MobileEnterpriseShell';
import './_styles/mobile-enterprise.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <MobileEnterpriseShell>{children}</MobileEnterpriseShell>;
}
```

- [ ] **Step 2: Add router adapter mirroring mobile-user**

```tsx
function toPublicEnterprisePath(pathname: string): string {
  return mapMobilePathToEnterprisePath(pathname);
}
```

- [ ] **Step 3: Replace react-router-dom usage in ported files**

```tsx
import { Link, useLocation, useNavigate, useParams } from '../_lib/router';
```

- [ ] **Step 4: Normalize unsupported routes and imports**

```tsx
// replace candidate detail link or remove unreachable route
// replace motion/react imports with framer-motion equivalents
```

- [ ] **Step 5: Run shell tests**

Run: `npm run test:run -- src/tests/app/mobile-enterprise-shell.test.tsx`
Expected: PASS

### Task 4: 验证整体前端行为

**Files:**
- Modify: any touched mobile-enterprise files if verification exposes issues

- [ ] **Step 1: Run focused mobile-enterprise tests**

Run: `npm run test:run -- src/tests/lib/device-routing.test.ts src/tests/app/mobile-enterprise-shell.test.tsx`
Expected: PASS

- [ ] **Step 2: Run full frontend test suite**

Run: `npm run test:run`
Expected: PASS

- [ ] **Step 3: Run frontend production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend docs/superpowers RELEASE-NOTES.md
git commit -m "feat: 接入企业端手机版内部路由"
```
