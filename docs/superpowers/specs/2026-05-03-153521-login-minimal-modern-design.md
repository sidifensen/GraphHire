# Login Page Minimal Modern Refresh Design

**Date:** 2026-05-03  
**Scope:** `frontend/src/app/login/page.tsx` visual refresh only  
**Constraint:** Keep existing login form behavior, fields, handlers, and copy unchanged

---

## 1. Goal

Upgrade the login page from a plain centered card to a clean modern composition while preserving all existing form interactions and role-switch logic.

## 2. Non-Negotiable Constraints

- Do not change:
  - submit handler behavior (`handleSubmit`)
  - role switch behavior (`jobseeker` / `recruiter`)
  - email/password input type and required attributes
  - login button text and links text
  - error/review message semantics
- Allowed changes:
  - page-level layout
  - decorative background layers
  - non-form supporting content
  - container positioning and spacing

## 3. Visual Direction (Minimal Modern)

- Two-column desktop composition:
  - left: brand narrative block (title, value statement, concise chips)
  - right: existing login card
- Single-column mobile:
  - login card remains primary content
  - brand block moves above form with reduced footprint
- Palette:
  - light neutral-to-blue gradient background
  - white high-contrast card and subtle border
  - restrained shadows, no heavy glow

## 4. Component Boundaries

- `LoginPage` remains a single page component for now.
- Existing form subtree is preserved structurally and behaviorally.
- New wrapper layers add semantic hooks for testing:
  - page shell
  - hero/brand panel
  - form panel container

## 5. Data Flow / Logic Impact

No data-flow change. API calls, auth store updates, and redirects remain unchanged.

## 6. Error Handling

No new error branches. Existing error rendering remains unchanged in the form card.

## 7. Testing Strategy

- TDD RED:
  - add a layout-focused test asserting presence of new shell/brand/form wrappers while existing form controls remain present
  - run target test and confirm failure
- GREEN:
  - implement layout wrappers + style classes
  - run target test to pass
- Regression:
  - run login page tests
  - run frontend required checks (`npm run build`, `npm run test:run`)

## 8. Success Criteria

- Login page appears modern and less plain with a stable minimal aesthetic.
- Existing form behavior remains unchanged.
- All relevant tests and frontend validation commands pass.
