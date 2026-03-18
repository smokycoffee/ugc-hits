# Global Grid Background Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply the subtle square-grid background treatment across the whole app instead of limiting it to the landing hero and get-started hero surfaces.

**Architecture:** Move the grid pattern into the global `body` background so every page inherits it, while keeping section-specific glow layers lightweight. Remove duplicate local grid overlays from hero-style sections to avoid stacking the pattern twice.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS

---

### Task 1: Add a failing regression check

**Files:**
- Create: `tests/global-background-grid-check.mjs`

**Step 1: Write the failing test**

Assert that `globals.css` adds a site-wide grid layer to `body`, and that the hero and get-started shell no longer define their own grid overlay classes.

**Step 2: Run test to verify it fails**

Run: `node tests/global-background-grid-check.mjs`
Expected: FAIL because the grid is still local to section components.

### Task 2: Move the grid into global styling

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/landing/hero-section.tsx`
- Modify: `src/components/landing/get-started-shell.tsx`

**Step 1: Add subtle grid layers to `body`**

Extend the existing global background image so the whole app gets the same soft square-grid pattern.

**Step 2: Remove duplicate local grid overlays**

Keep section glows, but remove section-level grid overlays from the hero and get-started shell.

### Task 3: Verify

**Files:**
- Create: `tests/global-background-grid-check.mjs`
- Modify: `src/app/globals.css`
- Modify: `src/components/landing/hero-section.tsx`
- Modify: `src/components/landing/get-started-shell.tsx`

**Step 1: Run targeted check**

Run: `node tests/global-background-grid-check.mjs`
Expected: PASS

**Step 2: Run project verification**

Run: `for file in tests/*.mjs; do node "$file" || exit 1; done`
Run: `npm run lint`
Run: `npm run build`
Expected: PASS
