# Brand Account Settings Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the placeholder brand accounts route with a tabbed settings page that shows real account email data, reuses the existing sign-out flow, and includes non-functional notifications and delete-account panels.

**Architecture:** Keep the route as a server component so it can load the authenticated brand session via `getBrandDashboard(locale)`. Extract the tab metadata and descriptive panel copy into a small `src/lib/platform` helper covered by tests, then render the settings UI in `page.tsx` using shadcn-style `Tabs` and `ScrollArea` primitives added under `src/components/ui`.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, shadcn-style UI primitives, Radix UI tabs/scroll-area, lucide-react, Node test runner.

---

### Task 1: Add account settings view-model coverage

**Files:**
- Create: `src/lib/platform/account-settings.ts`
- Create: `tests/platform/account-settings.test.ts`

**Step 1: Write the failing test**

Add tests that assert:
- the tab order is `account`, `notifications`, `danger`
- the danger tab and panel are marked destructive
- the account panel copy references signed-in account details

**Step 2: Run test to verify it fails**

Run: `npm run test:platform`
Expected: FAIL because `src/lib/platform/account-settings.ts` does not exist yet.

**Step 3: Write minimal implementation**

Export a helper that returns the tab definitions and panel metadata needed by the page UI.

**Step 4: Run test to verify it passes**

Run: `npm run test:platform`
Expected: PASS for the new account settings test.

### Task 2: Add missing shadcn-style UI primitives

**Files:**
- Create: `src/components/ui/scroll-area.tsx`
- Create: `src/components/ui/tabs.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`

**Step 1: Install missing dependencies**

Run: `npm install @radix-ui/react-scroll-area @radix-ui/react-tabs @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-separator`

**Step 2: Add minimal primitives**

Create `scroll-area.tsx` and `tabs.tsx` using the project’s `cn` helper and the shadcn-compatible API expected by the settings page.

**Step 3: Verify dependency resolution**

Run: `npm run lint`
Expected: the new primitives resolve their imports cleanly.

### Task 3: Replace the placeholder brand accounts route

**Files:**
- Modify: `src/app/[locale]/dashboard/brand/accounts/page.tsx`

**Step 1: Load real data**

Read `locale` params, call `getBrandDashboard(locale)`, and use `data.profile.email` in the account panel.

**Step 2: Build the tabs**

Render the approved `Account`, `Notifications`, and `Danger` tab bar using the new `Tabs` and `ScrollArea` primitives.

**Step 3: Build the three panels**

Add:
- account details card with the real email
- session card with the existing `/auth/signout` form
- notifications informational card
- danger card with UI only, no deletion behavior

**Step 4: Keep the visual language aligned**

Match the current dashboard shell: rounded cards, quiet borders, light glassy surfaces, and destructive red only in the danger tab/panel.

### Task 4: Verify the route

**Files:**
- No new files

**Step 1: Run tests**

Run: `npm run test:platform`
Expected: PASS.

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS.

**Step 3: Spot-check the route**

Run: `npm run build`
Expected: route compiles unless blocked by unrelated existing issues.
