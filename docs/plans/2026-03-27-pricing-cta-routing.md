# Pricing CTA Routing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Route the self-serve homepage pricing CTA to the locale-aware get-started page without changing the managed support CTA.

**Architecture:** The locale-aware href will be attached to the first pricing plan inside `getLandingContent`, then threaded through `PricingSection` into `PricingCard`. `PricingCard` will render a `Link` when a plan has an href and keep the existing button styling otherwise.

**Tech Stack:** Next.js App Router, React, TypeScript, Node source-check tests

---

### Task 1: Add red-green coverage for pricing CTA routing

**Files:**
- Create: `tests/pricing-card-navigation-check.mjs`
- Modify: `src/lib/get-landing-content.ts`
- Modify: `src/components/landing/pricing-section.tsx`
- Modify: `src/components/ui/pricing-card.tsx`

**Step 1: Write the failing test**

Create a source-based regression check that verifies:
- pricing plans support an optional `href`
- the first plan gets `getStartedHref`
- `PricingSection` forwards `plan.href`
- `PricingCard` renders a `Link` when `href` exists

**Step 2: Run test to verify it fails**

Run: `node tests/pricing-card-navigation-check.mjs`
Expected: FAIL because pricing plans do not yet expose or render hrefs

**Step 3: Write minimal implementation**

- Add `href?: string` to the pricing plan type
- Set `href: index === 0 ? getStartedHref : undefined` in landing content
- Pass `href` into `PricingCard`
- Render the CTA as `Link` when `href` is present

**Step 4: Run tests to verify they pass**

Run: `node tests/pricing-card-navigation-check.mjs`
Expected: PASS

Run: `node tests/pricing-card-cta-alignment-check.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/pricing-card-navigation-check.mjs src/lib/get-landing-content.ts src/components/landing/pricing-section.tsx src/components/ui/pricing-card.tsx docs/plans/2026-03-27-pricing-cta-routing-design.md docs/plans/2026-03-27-pricing-cta-routing.md
git commit -m "feat: route pricing CTA to localized get-started"
```
