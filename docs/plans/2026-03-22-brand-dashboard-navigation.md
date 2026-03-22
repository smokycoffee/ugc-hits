# Brand Dashboard Navigation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a routed brand dashboard workspace with a shared sidebar shell, a campaigns index/detail flow, and placeholder pages for the remaining sections.

**Architecture:** Move the current brand dashboard from a single page into nested routes under `/[locale]/dashboard/brand`. Add a shared shell component plus a small view-model helper layer so campaign list/detail screens can render consistently from the existing dashboard data. Keep non-campaign pages as lightweight placeholders that still use the same shell and header patterns.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, Tailwind CSS, node:test

---

### Task 1: Add a test seam for brand dashboard view models

**Files:**
- Create: `tests/platform/brand-dashboard-view-model.test.ts`
- Create: `src/lib/platform/brand-dashboard.ts`

**Step 1: Write the failing test**

Add tests for:
- merging `primaryCampaign` with `campaigns` into a stable campaign list
- resolving a campaign by id
- generating safe fallback sections for missing campaign metadata

**Step 2: Run test to verify it fails**

Run: `npm run test:platform`
Expected: FAIL because `src/lib/platform/brand-dashboard.ts` does not exist yet.

**Step 3: Write minimal implementation**

Create helper functions that:
- normalize the brand campaign collection
- look up a campaign by id
- generate display-ready arrays and labels used by the new pages

**Step 4: Run test to verify it passes**

Run: `npm run test:platform`
Expected: PASS for the new test file.

**Step 5: Commit**

```bash
git add tests/platform/brand-dashboard-view-model.test.ts src/lib/platform/brand-dashboard.ts
git commit -m "test: add brand dashboard view model coverage"
```

### Task 2: Add the shared brand dashboard shell

**Files:**
- Create: `src/components/platform/brand-dashboard-shell.tsx`
- Create: `src/app/[locale]/dashboard/brand/layout.tsx`
- Modify: `src/lib/platform/utils.ts`

**Step 1: Write the failing test**

Use the new helper test seam only if a route utility is introduced; otherwise skip extra tests here and keep the shell implementation presentation-only.

**Step 2: Write minimal implementation**

Build:
- a left sidebar for desktop
- a stacked nav for mobile
- consistent page chrome for all brand dashboard child routes
- localized nav href helpers where needed

**Step 3: Run verification**

Run: `npm run lint`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/platform/brand-dashboard-shell.tsx src/app/[locale]/dashboard/brand/layout.tsx src/lib/platform/utils.ts
git commit -m "feat: add brand dashboard shell"
```

### Task 3: Build campaigns index and detail routes

**Files:**
- Create: `src/app/[locale]/dashboard/brand/campaigns/page.tsx`
- Create: `src/app/[locale]/dashboard/brand/campaigns/[campaignId]/page.tsx`
- Modify: `src/app/[locale]/dashboard/brand/page.tsx`
- Modify: `src/lib/platform/data.ts`
- Modify: `src/lib/platform/brand-dashboard.ts`

**Step 1: Write the failing test**

If helper behavior changes, extend `tests/platform/brand-dashboard-view-model.test.ts` first for any new formatting logic.

**Step 2: Run test to verify it fails**

Run: `npm run test:platform`
Expected: FAIL on the new helper expectations before UI implementation.

**Step 3: Write minimal implementation**

Implement:
- redirect from `/dashboard/brand` to `/dashboard/brand/campaigns`
- campaigns list page with top review panel and campaign cards
- `View campaign` link to the detail route
- campaign detail page with status banner, campaign summary, deliverables, inspiration links, and creator targeting sections

**Step 4: Run verification**

Run:
- `npm run test:platform`
- `npm run lint`

Expected: PASS

**Step 5: Commit**

```bash
git add src/app/[locale]/dashboard/brand/page.tsx src/app/[locale]/dashboard/brand/campaigns/page.tsx src/app/[locale]/dashboard/brand/campaigns/[campaignId]/page.tsx src/lib/platform/data.ts src/lib/platform/brand-dashboard.ts tests/platform/brand-dashboard-view-model.test.ts
git commit -m "feat: add brand campaigns workspace"
```

### Task 4: Add placeholder routes for the remaining brand dashboard sections

**Files:**
- Create: `src/app/[locale]/dashboard/brand/messages/page.tsx`
- Create: `src/app/[locale]/dashboard/brand/applicants/page.tsx`
- Create: `src/app/[locale]/dashboard/brand/accounts/page.tsx`
- Create: `src/app/[locale]/dashboard/brand/support/page.tsx`
- Create: `src/components/platform/brand-dashboard-placeholder.tsx`

**Step 1: Write the failing test**

No extra automated test is required if this task remains presentation-only and uses existing route patterns.

**Step 2: Write minimal implementation**

Add placeholder pages with:
- consistent page headers
- a polished empty-state card
- copy that makes it clear the section is intentionally waiting for the next iteration

**Step 3: Run verification**

Run: `npm run lint`
Expected: PASS

**Step 4: Commit**

```bash
git add src/app/[locale]/dashboard/brand/messages/page.tsx src/app/[locale]/dashboard/brand/applicants/page.tsx src/app/[locale]/dashboard/brand/accounts/page.tsx src/app/[locale]/dashboard/brand/support/page.tsx src/components/platform/brand-dashboard-placeholder.tsx
git commit -m "feat: add brand dashboard placeholder routes"
```

### Task 5: Final verification

**Files:**
- Review only

**Step 1: Run tests**

Run: `npm run test:platform`
Expected: PASS

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 3: Run build**

Run: `npm run build`
Expected: PASS or document any unrelated existing failure.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: restructure brand dashboard navigation"
```
