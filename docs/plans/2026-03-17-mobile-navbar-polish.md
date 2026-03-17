# Mobile Navbar Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refine the mobile navbar so the locale switcher, CTA, and burger fit comfortably while the expanded mobile menu feels cleaner and easier to tap.

**Architecture:** Keep the existing client-side navbar toggle behavior and desktop layout. Update the mobile header composition and mobile-only styling inside `navbar-menu.tsx`, while extending the regression check to cover the compact CTA label and panel behavior.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS

---

### Task 1: Extend the mobile navbar regression check

**Files:**
- Modify: `tests/mobile-navbar-check.mjs`
- Test: `tests/mobile-navbar-check.mjs`

**Step 1: Write the failing test**

Assert that the mobile navbar includes a compact mobile CTA label and still uses a controlled mobile navigation panel.

**Step 2: Run test to verify it fails**

Run: `node tests/mobile-navbar-check.mjs`
Expected: FAIL because the navbar still uses the full CTA label everywhere.

**Step 3: Write minimal implementation**

Update `src/components/ui/navbar-menu.tsx` to render a shorter CTA label on mobile and polish the mobile layout and panel styling.

**Step 4: Run test to verify it passes**

Run: `node tests/mobile-navbar-check.mjs`
Expected: PASS

### Task 2: Refine the mobile navbar UI

**Files:**
- Modify: `src/components/ui/navbar-menu.tsx`

**Step 1: Tighten the mobile top-row layout**

Reduce crowding by adjusting the mobile control sizing, spacing, and label treatment.

**Step 2: Add a mobile-only CTA label**

Render `Post Campaign` on mobile and keep the existing CTA label on desktop.

**Step 3: Improve the mobile dropdown panel**

Give the expanded menu clearer spacing, stronger link styling, and a more intentional dropdown-card presentation.

**Step 4: Keep desktop intact**

Preserve the existing desktop nav, locale switcher, and CTA presentation.

### Task 3: Verify the change

**Files:**
- Modify: `src/components/ui/navbar-menu.tsx`
- Modify: `tests/mobile-navbar-check.mjs`

**Step 1: Run the targeted check**

Run: `node tests/mobile-navbar-check.mjs`
Expected: PASS

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 3: Review diff**

Run: `git diff -- src/components/ui/navbar-menu.tsx tests/mobile-navbar-check.mjs`
Expected: Only the mobile navbar polish changes and matching regression update.
