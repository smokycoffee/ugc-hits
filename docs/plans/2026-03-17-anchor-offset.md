# Anchor Offset Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add extra top scroll offset to the main landing-page anchor sections so their headings remain visible below the sticky navbar.

**Architecture:** Keep the navbar links unchanged and add `scroll-margin-top` directly to the four target section wrappers. Back the change with a static regression check that asserts the offset classes remain on those specific files.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS

---

### Task 1: Add a failing regression check for anchor offsets

**Files:**
- Create: `tests/anchor-offset-check.mjs`
- Test: `tests/anchor-offset-check.mjs`

**Step 1: Write the failing test**

Assert that the process, pricing, proof, and FAQ section files include the chosen `scroll-margin-top` classes.

**Step 2: Run test to verify it fails**

Run: `node tests/anchor-offset-check.mjs`
Expected: FAIL because the sections currently have no anchor offset classes.

**Step 3: Write minimal implementation**

Add the offset classes to the four section wrappers only.

**Step 4: Run test to verify it passes**

Run: `node tests/anchor-offset-check.mjs`
Expected: PASS

### Task 2: Apply the anchor offset

**Files:**
- Modify: `src/components/landing/process-section.tsx`
- Modify: `src/components/landing/pricing-section.tsx`
- Modify: `src/components/landing/why-section.tsx`
- Modify: `src/components/landing/faq-section.tsx`

**Step 1: Add consistent section offsets**

Apply the same `scroll-margin-top` classes to all four main navbar section wrappers.

**Step 2: Keep section content intact**

Do not change structure, copy, or spacing beyond the anchor offset classes.

### Task 3: Verify the change

**Files:**
- Modify: `src/components/landing/process-section.tsx`
- Modify: `src/components/landing/pricing-section.tsx`
- Modify: `src/components/landing/why-section.tsx`
- Modify: `src/components/landing/faq-section.tsx`
- Create: `tests/anchor-offset-check.mjs`

**Step 1: Run the targeted check**

Run: `node tests/anchor-offset-check.mjs`
Expected: PASS

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS
