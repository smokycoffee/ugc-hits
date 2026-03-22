# Brand Onboarding Auth Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Route brands through login before onboarding, persist the authenticated onboarding flow, and make the dashboard render the saved campaign instead of a duplicate creation form.

**Architecture:** Introduce a small onboarding-path utility so `get-started`, `login`, auth redirects, and onboarding all share the same locale-aware handoff. Persist onboarding through a new Supabase RPC that upserts the brand profile plus a single primary campaign, then load that primary campaign as the dashboard’s main state.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase RPC + SQL migrations, Tailwind CSS

---

### Task 1: Lock redirect behavior with failing tests

**Files:**
- Create: `tests/platform/brand-onboarding-paths.test.ts`
- Modify: `tests/platform/auth-redirects.test.ts`
- Modify: `tests/platform/confirm-redirect.test.ts`
- Modify: `tests/get-started-flow-check.mjs`

**Step 1: Write the failing tests**

Add tests for localized onboarding/login path builders, brand auth redirects that carry onboarding `next`, and static route expectations for the new handoff.

**Step 2: Run tests to verify they fail**

Run: `npm run test:platform`
Expected: FAIL because the helpers and redirect behavior do not exist yet.

**Step 3: Update the static flow check**

Run: `node tests/get-started-flow-check.mjs`
Expected: FAIL because the source still routes to public onboarding and the dashboard still shows the create form.

### Task 2: Implement shared onboarding path helpers

**Files:**
- Create: `src/lib/platform/brand-onboarding.ts`
- Modify: `src/components/landing/get-started-shell.tsx`
- Modify: `src/app/[locale]/login/page.tsx`
- Modify: `src/lib/platform/auth-redirects.ts`
- Modify: `src/lib/platform/actions.ts`

**Step 1: Add locale-aware path helpers**

Build helpers for localized onboarding URLs and login handoff URLs that preserve `companyName` and `productType`.

**Step 2: Wire `get-started` to `login`**

Push brand leads to localized login with a populated `next` path instead of public onboarding.

**Step 3: Carry `next` through brand auth**

Update magic-link and Google login actions so successful brand auth lands on authenticated onboarding.

### Task 3: Move onboarding behind authenticated brand access

**Files:**
- Modify: `src/app/[locale]/onboarding-brand/page.tsx`
- Modify: `src/lib/platform/data.ts`
- Modify: `src/components/onboarding/brand-onboarding-shell.tsx`

**Step 1: Require a brand session**

Make onboarding use authenticated app data and redirect unauthenticated access back to localized login with the same onboarding state.

**Step 2: Convert onboarding submit into a real save**

Wrap the client shell in a server action submit path and redirect successful submissions to the localized brand dashboard.

### Task 4: Persist onboarding into Supabase

**Files:**
- Create: `supabase/migrations/20260322173000_brand_onboarding_primary_campaign.sql`
- Modify: `src/lib/platform/actions.ts`
- Modify: `src/lib/platform/data.ts`

**Step 1: Extend the schema**

Add primary-campaign support plus onboarding detail fields needed to save and render the campaign.

**Step 2: Add an upsert RPC**

Implement a brand-authenticated RPC that upserts the brand profile and the brand’s primary campaign.

**Step 3: Call the RPC from onboarding**

Normalize the submitted form values and redirect to the dashboard on success.

### Task 5: Replace the dashboard create form with the saved campaign state

**Files:**
- Modify: `src/app/[locale]/dashboard/brand/page.tsx`
- Modify: `src/lib/platform/data.ts`
- Modify: `tests/get-started-flow-check.mjs`

**Step 1: Load the primary campaign**

Return the primary campaign separately from the brand dashboard data fetch.

**Step 2: Redesign the dashboard primary panel**

Replace the creation form with a campaign overview card and keep the rest of the dashboard sections working.

### Task 6: Verify end-to-end behavior

**Files:**
- Modify: `tests/platform/*.test.ts`
- Modify: `tests/get-started-flow-check.mjs`

**Step 1: Run platform tests**

Run: `npm run test:platform`
Expected: PASS

**Step 2: Run source flow check**

Run: `node tests/get-started-flow-check.mjs`
Expected: PASS

**Step 3: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 4: Run build**

Run: `npm run build`
Expected: PASS
