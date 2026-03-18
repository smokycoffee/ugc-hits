# Get Started Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a navbar `Get Started` CTA that opens a new localized audience-selection page with segmented brand/creator content and shared landing-page chrome.

**Architecture:** Extend the existing landing content loader so both the home page and the new get-started page can share locale-aware copy. Keep the page shell server-rendered with `SiteHeader` and `SiteFooter`, and isolate the segmented-control interaction in a small client component.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, next-intl

---

### Task 1: Add a failing regression check

**Files:**
- Create: `tests/get-started-flow-check.mjs`
- Test: `tests/get-started-flow-check.mjs`

**Step 1: Write the failing test**

Assert that the navbar source includes a `Get Started` CTA and that the localized `get-started` route exists.

**Step 2: Run test to verify it fails**

Run: `node tests/get-started-flow-check.mjs`
Expected: FAIL because the navbar does not yet include the new CTA and the route file does not exist.

**Step 3: Write minimal implementation**

Update the navbar and create the new localized route plus segmented-control component.

**Step 4: Run test to verify it passes**

Run: `node tests/get-started-flow-check.mjs`
Expected: PASS

### Task 2: Extend localized content

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pl.json`
- Modify: `src/lib/get-landing-content.ts`

**Step 1: Add get-started copy**

Add message content for the page intro, segment labels, per-audience descriptions, bullets, trust notes, and CTA labels/links.

**Step 2: Expose content through the loader**

Return a `getStarted` object from `getLandingContent`, including localized landing-anchor links that work from the new route.

### Task 3: Update the shared navbar

**Files:**
- Modify: `src/components/ui/navbar-menu.tsx`

**Step 1: Add secondary CTA support**

Render a lighter `Get Started` pill beside the existing dark CTA.

**Step 2: Keep responsive behavior intact**

Preserve the current mobile language switcher and primary CTA handling.

### Task 4: Build the get-started page

**Files:**
- Create: `src/components/landing/get-started-shell.tsx`
- Create: `src/app/[locale]/get-started/page.tsx`

**Step 1: Create the interactive segmented control**

Implement a client component that defaults to the brand segment and swaps content per audience.

**Step 2: Match landing-page styling**

Reuse the current border radius, shadows, gradients, and typography conventions so the new page feels unified with the landing page.

**Step 3: Reuse shared chrome**

Render `SiteHeader` and `SiteFooter` around the new page body.

### Task 5: Verify the change

**Files:**
- Modify: `src/components/ui/navbar-menu.tsx`
- Modify: `src/lib/get-landing-content.ts`
- Modify: `messages/en.json`
- Modify: `messages/pl.json`
- Create: `src/components/landing/get-started-shell.tsx`
- Create: `src/app/[locale]/get-started/page.tsx`
- Create: `tests/get-started-flow-check.mjs`

**Step 1: Run the targeted check**

Run: `node tests/get-started-flow-check.mjs`
Expected: PASS

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS
