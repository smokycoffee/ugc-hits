# Mobile Navbar Burger Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a burger-triggered mobile navigation panel while keeping the locale switcher visible in the top row beside the primary CTA.

**Architecture:** Convert the navbar into a client component so it can hold a small mobile open-state. Preserve the desktop navigation row, add a compact mobile toggle button, and render the mobile section links in a conditional panel below the main row.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS

---

### Task 1: Add a failing regression check for the mobile burger navbar

**Files:**
- Modify: `tests/mobile-navbar-check.mjs`
- Test: `tests/mobile-navbar-check.mjs`

**Step 1: Write the failing test**

Assert that `src/components/ui/navbar-menu.tsx` is a client component, includes a mobile burger toggle with `aria-expanded`, and keeps the locale switcher available in the top header row.

**Step 2: Run test to verify it fails**

Run: `node tests/mobile-navbar-check.mjs`
Expected: FAIL because the current navbar has no mobile burger toggle.

**Step 3: Write minimal implementation**

Update `src/components/ui/navbar-menu.tsx` to add local state, a burger button, a conditional mobile panel, and a persistent mobile locale switcher.

**Step 4: Run test to verify it passes**

Run: `node tests/mobile-navbar-check.mjs`
Expected: PASS

### Task 2: Implement the mobile navbar behavior

**Files:**
- Modify: `src/components/ui/navbar-menu.tsx`

**Step 1: Convert the component for interactivity**

Add `"use client"` and local open-state for the mobile panel.

**Step 2: Keep desktop behavior unchanged**

Leave the desktop nav and desktop locale switcher under `md` breakpoints.

**Step 3: Add the mobile top row**

Render the brand, visible mobile locale switcher, CTA, and burger button in the main header row.

**Step 4: Add the collapsible mobile nav panel**

Show the section links only when the mobile toggle is open.

**Step 5: Verify implementation**

Run: `node tests/mobile-navbar-check.mjs`
Expected: PASS

### Task 3: Run project verification

**Files:**
- Modify: `src/components/ui/navbar-menu.tsx`
- Test: `tests/mobile-navbar-check.mjs`

**Step 1: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 2: Review diff**

Run: `git diff -- src/components/ui/navbar-menu.tsx tests/mobile-navbar-check.mjs`
Expected: Only the mobile navbar behavior and regression test changes appear.
