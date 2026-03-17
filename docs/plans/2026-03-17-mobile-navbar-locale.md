# Mobile Navbar Locale Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a mobile navbar locale switcher to the left of the CTA and shorten the mobile CTA label without changing desktop or hero CTA text.

**Architecture:** Keep the current desktop navbar intact and add a mobile-only locale switcher plus mobile-only CTA label inside `navbar-menu.tsx`. Back the change with a small static regression check for the mobile navbar structure.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS

---

### Task 1: Add a failing regression check

**Files:**
- Create: `tests/mobile-navbar-check.mjs`
- Test: `tests/mobile-navbar-check.mjs`

**Step 1: Write the failing test**

Assert that the navbar includes a mobile-only locale switcher and a mobile-only `Post Campaign` label.

**Step 2: Run test to verify it fails**

Run: `node tests/mobile-navbar-check.mjs`
Expected: FAIL because the current navbar has no mobile-only locale switcher or short CTA label.

**Step 3: Write minimal implementation**

Update `src/components/ui/navbar-menu.tsx` to render the mobile locale switcher and mobile-only CTA label.

**Step 4: Run test to verify it passes**

Run: `node tests/mobile-navbar-check.mjs`
Expected: PASS

### Task 2: Implement the mobile navbar controls

**Files:**
- Modify: `src/components/ui/navbar-menu.tsx`

**Step 1: Add the mobile locale switcher**

Render a `md:hidden` language switcher immediately to the left of the CTA.

**Step 2: Add the mobile-only CTA label**

Render `Post Campaign` on mobile when locale is English and preserve the existing CTA label on desktop.

**Step 3: Keep desktop intact**

Leave the desktop locale switcher and desktop CTA unchanged.

### Task 3: Verify the change

**Files:**
- Modify: `src/components/ui/navbar-menu.tsx`
- Create: `tests/mobile-navbar-check.mjs`

**Step 1: Run the targeted check**

Run: `node tests/mobile-navbar-check.mjs`
Expected: PASS

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS
