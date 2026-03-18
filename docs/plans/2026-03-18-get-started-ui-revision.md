# Get Started UI Revision Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current `/[locale]/get-started` body with a simpler segmented brand/creator layout that matches the landing-page visual language and keeps all CTA interactions on-page.

**Architecture:** Keep the existing localized route, navbar, and footer. Simplify the `getStarted` message shape so the shell can render one centered segmented control, one left-side value proposition block, and one right-side CTA card for each audience without the extra supporting panels.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, next-intl

---

### Task 1: Update the failing regression check

**Files:**
- Modify: `tests/get-started-flow-check.mjs`

**Step 1: Write the failing test**

Assert that the English get-started copy uses the new minimal brand/creator headlines and no longer contains the old intro line.

**Step 2: Run test to verify it fails**

Run: `node tests/get-started-flow-check.mjs`
Expected: FAIL because the old copy is still present.

### Task 2: Simplify localized content

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pl.json`
- Modify: `src/lib/get-landing-content.ts`

**Step 1: Replace the old get-started copy**

Use simpler audience-specific headline, paragraph, benefit list, and CTA-card content.

**Step 2: Remove no-longer-needed fields from the content model**

Delete the extra overview/panel fields that powered the more complex layout.

### Task 3: Rebuild the shell

**Files:**
- Modify: `src/components/landing/get-started-shell.tsx`
- Modify: `src/app/[locale]/get-started/page.tsx`

**Step 1: Replace the current body layout**

Render the segmented control at the top, the audience pitch on the left, and a compact CTA card on the right.

**Step 2: Keep the style unified**

Preserve the current typography, rounded cards, shadows, and soft background treatment from the landing page.

### Task 4: Verify

**Files:**
- Modify: `tests/get-started-flow-check.mjs`
- Modify: `messages/en.json`
- Modify: `messages/pl.json`
- Modify: `src/lib/get-landing-content.ts`
- Modify: `src/components/landing/get-started-shell.tsx`
- Modify: `src/app/[locale]/get-started/page.tsx`

**Step 1: Run targeted check**

Run: `node tests/get-started-flow-check.mjs`
Expected: PASS

**Step 2: Run project verification**

Run: `for file in tests/*.mjs; do node "$file" || exit 1; done`
Run: `npm run lint`
Run: `npm run build`
Expected: PASS
